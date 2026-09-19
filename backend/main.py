import asyncio
import json
import os
import math
import requests
from pydantic import BaseModel
from datetime import datetime, timezone
from dark_fleet import flag_dark_ships
from contextlib import asynccontextmanager

import websockets
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()
API_KEY = os.getenv("AISSTREAM_API_KEY")

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "openai/gpt-oss-120b"



PORTS: list[dict] = []

def fetch_ports():
    global PORTS
    try:
        resp = requests.get(
            "https://services2.arcgis.com/jUpNdisbWqRpMo35/ArcGIS/rest/services/WPI_Ports2017/FeatureServer/0/query",
            params={
                "where": "1=1",
                "outFields": "*",
                "returnGeometry": "true",
                "f": "geojson",
                "resultRecordCount": 4000,
            },
            timeout=15,
        )
        resp.raise_for_status()
        data = resp.json()
        loaded = []
        for f in data.get("features", []):
            geom = f.get("geometry")
            if not geom or not geom.get("coordinates"):
                continue
            props = f.get("properties", {})
            name = (
                props.get("PORT_NAME") or props.get("PORTNAME") or
                props.get("NAME") or props.get("Name") or props.get("name") or "Unknown Port"
            )
            lng, lat = geom["coordinates"]
            loaded.append({"name": name, "lat": lat, "lng": lng})
        PORTS = loaded
        print(f"Loaded {len(PORTS)} ports from World Port Index")
    except Exception as e:
        print(f"Failed to load World Port Index: {e}")


def find_port_by_name(query):
    if not query:
        return None
    query_lower = query.lower()
    for p in PORTS:
        if query_lower in p["name"].lower():
            return p
    return None


def haversine_km(lat1, lng1, lat2, lng2):
    R = 6371
    d_lat = math.radians(lat2 - lat1)
    d_lng = math.radians(lng2 - lng1)
    a = (
        math.sin(d_lat / 2) ** 2
        + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(d_lng / 2) ** 2
    )
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


# In-memory store: latest known info per ship, keyed by MMSI.
# A background task keeps this updated forever; /ships just reads
# whatever's currently in here at the moment it's asked.
live_ships: dict[int, dict] = {}

STATUS_MAP = {
    0: "moving", 1: "anchored-sea", 2: "anchored-sea", 3: "anchored-sea",
    4: "anchored-sea", 5: "anchored-port", 6: "anchored-sea", 7: "moving",
    8: "moving",
}

def map_ship_type(code):
    # AIS ShipType is a numeric code in ranges, not a flat lookup table —
    # e.g. every value 70-79 means some flavor of cargo ship.
    if code is None:
        return "unknown"
    if 60 <= code <= 69:
        return "passenger"
    if 70 <= code <= 79:
        return "cargo"
    if 80 <= code <= 89:
        return "tanker"
    if code == 30:
        return "fishing"
    if code in (31, 32, 52):
        return "tug"
    if code == 36 or code == 37:
        return "pleasure"
    if code == 50 or code == 51 or code == 55:
        return "official"
    return "other"

async def listen_to_ais():
    async with websockets.connect("wss://stream.aisstream.io/v0/stream") as ws:
        subscribe_message = {
            "APIKey": API_KEY,
            # North Sea / English Channel — busy real shipping lanes,
            # keeps ship count manageable instead of the whole world firehose.
            "BoundingBoxes": [[[49, -2], [54, 9]]],
        }
        await ws.send(json.dumps(subscribe_message))

        async for message in ws:
            data = json.loads(message)
            message_type = data.get("MessageType")

            if message_type == "PositionReport":
                meta = data["MetaData"]
                report = data["Message"]["PositionReport"]
                mmsi = meta["MMSI"]

                # Merge into whatever's already there for this ship
                # (e.g. a vessel_type saved from a ShipStaticData message)
                # instead of replacing the whole record.
                existing = live_ships.get(mmsi, {})
                live_ships[mmsi] = {
                    **existing,
                    "name": (meta.get("ShipName") or "Unknown").strip(),
                    "lat": meta["latitude"],
                    "lng": meta["longitude"],
                    "type": "Vessel",
                    "status": STATUS_MAP.get(report.get("NavigationalStatus"), "anchored-sea"),
                    "speed": report.get("Sog"),
                    "heading": report.get("Cog"),
                    "last_seen": datetime.now(timezone.utc),
                }

            elif message_type == "ShipStaticData":
                meta = data["MetaData"]
                static = data["Message"]["ShipStaticData"]
                mmsi = meta["MMSI"]

                # Only attach vessel type to ships we've already seen a
                # position for — no point creating a ship entry with a
                # type but no location.
                if mmsi in live_ships:
                    live_ships[mmsi]["vessel_type"] = map_ship_type(static.get("Type"))

async def ais_background_loop():
    # The connection will eventually drop on its own — reconnect
    # automatically instead of the feed silently dying forever.
    while True:
        try:
            await listen_to_ais()
        except Exception as e:
            print(f"AIS connection dropped, reconnecting in 5s: {e}")
            await asyncio.sleep(5)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Starts the AIS listener once, when the server boots, running
    # alongside normal request handling for the server's whole lifetime.
    fetch_ports()
    task = asyncio.create_task(ais_background_loop())
    yield
    task.cancel()

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)




@app.get("/ships")
def get_ships():
    return flag_dark_ships(list(live_ships.values()))

@app.get("/ships/dark-fleet")
def get_dark_fleet():
    all_ships = flag_dark_ships(list(live_ships.values()))
    return [s for s in all_ships if s["is_dark_flagged"]]



class ChatRequest(BaseModel):
    message: str


def query_ships(vessel_type=None, status=None, is_dark_flagged=None,
                 min_minutes_since_update=None, near_port=None, radius_km=None):
    ships = flag_dark_ships(list(live_ships.values()))

    if vessel_type:
        ships = [s for s in ships if s.get("vessel_type") == vessel_type]
    if status:
        ships = [s for s in ships if s.get("status") == status]
    if is_dark_flagged is not None:
        ships = [s for s in ships if s.get("is_dark_flagged") == is_dark_flagged]
    if min_minutes_since_update is not None:
        ships = [s for s in ships if s.get("minutes_since_update", 0) >= min_minutes_since_update]

    if near_port:
        port = find_port_by_name(near_port)
        if not port:
            return {"error": f"No port found matching '{near_port}'"}
        r = radius_km or 20
        ships = [
            s for s in ships
            if haversine_km(port["lat"], port["lng"], s["lat"], s["lng"]) <= r
        ]

    # Cap results so we don't blow past the model's context on a busy fleet.
    # last_seen is a datetime object — convert to plain text so json.dumps() works.
    trimmed = []
    for s in ships[:20]:
        s_copy = dict(s)
        if "last_seen" in s_copy:
            s_copy["last_seen"] = str(s_copy["last_seen"])
        trimmed.append(s_copy)
    return {"count": len(ships), "ships": trimmed}


CHAT_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "query_ships",
            "description": (
                "Filter the live tracked fleet by vessel type, movement status, "
                "dark-fleet flag, how long since last AIS update, and/or proximity "
                "to a named port anywhere in the world."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "vessel_type": {
                        "type": "string",
                        "enum": ["cargo", "tanker", "fishing", "passenger", "tug", "pleasure", "official", "other", "unknown"],
                    },
                    "status": {
                        "type": "string",
                        "enum": ["moving", "anchored-port", "anchored-sea"],
                    },
                    "is_dark_flagged": {"type": "boolean"},
                    "min_minutes_since_update": {"type": "number"},
                    "near_port": {"type": "string", "description": "A port name, e.g. 'Rotterdam'"},
                    "radius_km": {"type": "number", "description": "Search radius around near_port, default 20km"},
                },
            },
        },
    }
]


@app.post("/chat")
def chat(req: ChatRequest):
    if not GROQ_API_KEY:
        return {"reply": "Chat isn't configured yet (missing GROQ_API_KEY in .env).", "ships": []}

    system_prompt = (
        "You are a maritime fleet assistant. Answer questions about the ships currently "
        "being tracked live via AIS by calling the query_ships tool — never guess ship data "
        "yourself. Keep answers concise, mention ship names and key facts (status, vessel "
        "type, time since last update), and say plainly if zero ships matched. Note that "
        "live position data only exists for ships in the North Sea / English Channel region, "
        "even though port lookups cover the whole world."
    )

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": req.message},
    ]

    headers = {"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"}

    try:
        resp = requests.post(GROQ_URL, headers=headers, json={
            "model": GROQ_MODEL,
            "messages": messages,
            "tools": CHAT_TOOLS,
            "tool_choice": "auto",
        }, timeout=30)
        resp.raise_for_status()
    except Exception as e:
        return {"reply": f"Chat request failed: {e}", "ships": []}

    choice = resp.json()["choices"][0]["message"]
    matched_ships = []

    matched_count = 0
    if choice.get("tool_calls"):
        messages.append(choice)
        for call in choice["tool_calls"]:
            args = json.loads(call["function"]["arguments"])
            result = query_ships(**args)
            if "ships" in result:
                matched_ships = result["ships"]
                matched_count = result.get("count", len(matched_ships))
            messages.append({
                "role": "tool",
                "tool_call_id": call["id"],
                "content": json.dumps(result),
            })

        try:
            resp2 = requests.post(GROQ_URL, headers=headers, json={
                "model": GROQ_MODEL,
                "messages": messages,
            }, timeout=30)
            resp2.raise_for_status()
            final_text = resp2.json()["choices"][0]["message"]["content"]
        except Exception as e:
            return {"reply": f"Chat follow-up failed: {e}", "ships": matched_ships}
    else:
        final_text = choice.get("content", "")

    return {"reply": final_text, "ships": matched_ships, "count": matched_count}

