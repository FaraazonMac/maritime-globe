import asyncio
import json
import os
import math
import re
import time
from collections import Counter
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


def bearing_compass(lat1, lng1, lat2, lng2):
    y = math.sin(math.radians(lng2 - lng1)) * math.cos(math.radians(lat2))
    x = (
        math.cos(math.radians(lat1)) * math.sin(math.radians(lat2))
        - math.sin(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.cos(math.radians(lng2 - lng1))
    )
    bearing = (math.degrees(math.atan2(y, x)) + 360) % 360
    directions = [
        "north", "north-northeast", "northeast", "east-northeast",
        "east", "east-southeast", "southeast", "south-southeast",
        "south", "south-southwest", "southwest", "west-southwest",
        "west", "west-northwest", "northwest", "north-northwest",
    ]
    return directions[round(bearing / 22.5) % 16]


def port_direction(from_port, to_port):
    a = find_port_by_name(from_port)
    b = find_port_by_name(to_port)
    if not a:
        return {"error": f"No port found matching '{from_port}'"}
    if not b:
        return {"error": f"No port found matching '{to_port}'"}
    return {
        "from": a["name"],
        "to": b["name"],
        "distance_km": round(haversine_km(a["lat"], a["lng"], b["lat"], b["lng"]), 1),
        "direction_from_origin": bearing_compass(a["lat"], a["lng"], b["lat"], b["lng"]),
    }


# Flag state from the MMSI. The first 3 digits of a ship's MMSI are its
# Maritime Identification Digits (MID), an ITU-assigned country code.
# Some countries own several MIDs, so we list them per country and invert.
FLAG_MIDS = {
    # Europe
    "Albania": [201], "Andorra": [202], "Austria": [203],
    "Portugal": [204, 255, 263], "Belgium": [205], "Belarus": [206],
    "Bulgaria": [207], "Vatican City": [208], "Cyprus": [209, 210, 212],
    "Germany": [211, 218], "Georgia": [213], "Moldova": [214],
    "Malta": [215, 229, 248, 249, 256], "Armenia": [216], "Denmark": [219, 220],
    "Spain": [224, 225], "France": [226, 227, 228], "Finland": [230],
    "Faroe Islands": [231], "United Kingdom": [232, 233, 234, 235],
    "Gibraltar": [236], "Greece": [237, 239, 240, 241], "Croatia": [238],
    "Morocco": [242], "Hungary": [243], "Netherlands": [244, 245, 246],
    "Italy": [247], "Ireland": [250], "Iceland": [251], "Liechtenstein": [252],
    "Luxembourg": [253], "Monaco": [254], "Norway": [257, 258, 259],
    "Poland": [261], "Montenegro": [262], "Romania": [264], "Sweden": [265, 266],
    "Slovakia": [267], "San Marino": [268], "Switzerland": [269],
    "Czechia": [270], "Turkey": [271], "Ukraine": [272], "Russia": [273],
    "North Macedonia": [274], "Latvia": [275], "Estonia": [276],
    "Lithuania": [277], "Slovenia": [278], "Serbia": [279],
    # North America and Caribbean
    "Anguilla": [301], "United States": [303, 338, 366, 367, 368, 369],
    "Antigua and Barbuda": [304, 305], "Curaçao / Sint Maarten / Bonaire": [306],
    "Aruba": [307], "Bahamas": [308, 309, 311], "Bermuda": [310],
    "Belize": [312], "Barbados": [314], "Canada": [316],
    "Cayman Islands": [319], "Costa Rica": [321], "Cuba": [323],
    "Dominica": [325], "Dominican Republic": [327], "Guadeloupe": [329],
    "Grenada": [330], "Greenland": [331], "Guatemala": [332],
    "Honduras": [334], "Haiti": [336], "Jamaica": [339],
    "Saint Kitts and Nevis": [341], "Saint Lucia": [343], "Mexico": [345],
    "Martinique": [347], "Montserrat": [348], "Nicaragua": [350],
    "Panama": [351, 352, 353, 354, 355, 356, 357, 370, 371, 372, 373, 374],
    "Puerto Rico": [358], "El Salvador": [359],
    "Saint Pierre and Miquelon": [361], "Trinidad and Tobago": [362],
    "Turks and Caicos Islands": [364],
    "Saint Vincent and the Grenadines": [375, 376, 377],
    "British Virgin Islands": [378], "US Virgin Islands": [379],
    # Asia
    "Afghanistan": [401], "Saudi Arabia": [403], "Bangladesh": [405],
    "Bahrain": [408], "Bhutan": [410], "China": [412, 413, 414],
    "Taiwan": [416], "Sri Lanka": [417], "India": [419], "Iran": [422],
    "Azerbaijan": [423], "Iraq": [425], "Israel": [428], "Japan": [431, 432],
    "Turkmenistan": [434], "Kazakhstan": [436], "Uzbekistan": [437],
    "Jordan": [438], "South Korea": [440, 441], "Palestine": [443],
    "North Korea": [445], "Kuwait": [447], "Lebanon": [450],
    "Kyrgyzstan": [451], "Macao": [453], "Maldives": [455], "Mongolia": [457],
    "Nepal": [459], "Oman": [461], "Pakistan": [463], "Qatar": [466],
    "Syria": [468], "United Arab Emirates": [470, 471], "Tajikistan": [472],
    "Yemen": [473, 475], "Hong Kong": [477], "Bosnia and Herzegovina": [478],
    # Oceania
    "French Southern Territories": [501, 607], "Antarctica": [618, 635],
    "Australia": [503], "Myanmar": [506], "Brunei": [508],
    "Micronesia": [510], "Palau": [511], "New Zealand": [512],
    "Cambodia": [514, 515], "Christmas Island": [516], "Cook Islands": [518],
    "Fiji": [520], "Cocos Islands": [523], "Indonesia": [525],
    "Kiribati": [529], "Laos": [531], "Malaysia": [533],
    "Northern Mariana Islands": [536], "Marshall Islands": [538],
    "New Caledonia": [540], "Niue": [542], "Nauru": [544],
    "French Polynesia": [546], "Philippines": [548],
    "Papua New Guinea": [553], "Pitcairn Islands": [555],
    "Solomon Islands": [557], "American Samoa": [559], "Samoa": [561],
    "Singapore": [563, 564, 565, 566], "Thailand": [567], "Tonga": [570],
    "Tuvalu": [572], "Vietnam": [574], "Vanuatu": [576, 577],
    "Wallis and Futuna": [578],
    # Africa
    "South Africa": [601], "Angola": [603], "Algeria": [605],
    "Ascension Island": [608], "Burundi": [609], "Benin": [610],
    "Botswana": [611], "Central African Republic": [612], "Cameroon": [613],
    "Congo": [615], "Comoros": [616, 620], "Cabo Verde": [617],
    "Côte d'Ivoire": [619], "Djibouti": [621], "Egypt": [622],
    "Ethiopia": [624], "Eritrea": [625], "Gabon": [626], "Ghana": [627],
    "Gambia": [629], "Guinea-Bissau": [630], "Equatorial Guinea": [631],
    "Guinea": [632], "Burkina Faso": [633], "Kenya": [634],
    "Liberia": [636, 637], "Libya": [642], "Lesotho": [644],
    "Mauritius": [645], "Madagascar": [647], "Mali": [649],
    "Mozambique": [650], "Mauritania": [654], "Malawi": [655],
    "Niger": [656], "Nigeria": [657], "Namibia": [659], "Réunion": [660],
    "Rwanda": [661], "Sudan": [662], "Senegal": [663], "Seychelles": [664],
    "Saint Helena": [665], "Somalia": [666], "Sierra Leone": [667],
    "São Tomé and Príncipe": [668], "Eswatini": [669], "Chad": [670],
    "Togo": [671], "Tunisia": [672], "Tanzania": [674, 677], "Uganda": [675],
    "DR Congo": [676], "Zambia": [678], "Zimbabwe": [679],
    # South America
    "Argentina": [701], "Brazil": [710], "Bolivia": [720], "Chile": [725],
    "Colombia": [730], "Ecuador": [735], "Falkland Islands": [740],
    "French Guiana": [745], "Guyana": [750], "Paraguay": [755],
    "Peru": [760], "Suriname": [765], "Uruguay": [770], "Venezuela": [775],
}
MID_TO_FLAG = {mid: country for country, mids in FLAG_MIDS.items() for mid in mids}


def flag_from_mmsi(mmsi):
    try:
        return MID_TO_FLAG.get(int(str(mmsi).zfill(9)[:3]))
    except (TypeError, ValueError):
        return None

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
                    "mmsi": mmsi,
                    "flag": flag_from_mmsi(mmsi),
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
                    imo = static.get("ImoNumber")
                    live_ships[mmsi]["imo"] = imo if imo else None
                    call_sign = (static.get("CallSign") or "").strip()
                    live_ships[mmsi]["call_sign"] = call_sign or None

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

    by_status = dict(Counter(s.get("status") for s in ships))
    by_type = dict(Counter(s.get("vessel_type") or "unknown" for s in ships))

    # Cap results so we don't blow past the model's context on a busy fleet.
    # last_seen is a datetime object, so convert it to text so json.dumps() works.
    trimmed = []
    for s in ships[:20]:
        s_copy = dict(s)
        if "last_seen" in s_copy:
            s_copy["last_seen"] = str(s_copy["last_seen"])
        trimmed.append(s_copy)
    return {"count": len(ships), "by_status": by_status, "by_type": by_type, "ships": trimmed}


def slim_for_model(result):
    # The model only needs a compact summary. The full ship list still goes to the globe.
    if "ships" not in result:
        return result
    keep = ("name", "flag", "status", "vessel_type", "speed", "minutes_since_update")
    return {
        "count": result["count"],
        "by_status": result.get("by_status"),
        "by_type": result.get("by_type"),
        "sample_ships": [{k: s.get(k) for k in keep} for s in result["ships"][:5]],
    }


def groq_post(payload):
    headers = {"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"}
    resp = None
    for attempt in range(4):
        resp = requests.post(GROQ_URL, headers=headers, json=payload, timeout=30)
        if resp.status_code != 429:
            return resp
        # Rate limited: wait as long as Groq suggests, then try again.
        match = re.search(r"try again in ([\d.]+)s", resp.text)
        wait = float(match.group(1)) + 0.5 if match else 5
        time.sleep(min(wait, 15))
    return resp

def find_ship(name):
    if not name:
        return {"error": "No ship name given"}
    name_lower = name.lower()
    matches = [
        s for s in flag_dark_ships(list(live_ships.values()))
        if name_lower in (s.get("name") or "").lower()
    ]
    if not matches:
        return {"error": f"No live ship found matching '{name}'. It may be outside the tracked North Sea / English Channel region, or its name may differ from what was asked."}
    if len(matches) > 1:
        return {
            "count": len(matches),
            "matches": [{"name": m["name"], "flag": m.get("flag"), "status": m.get("status")} for m in matches[:10]],
        }

    ship = matches[0]
    nearest = None
    nearest_dist = None
    for p in PORTS:
        d = haversine_km(ship["lat"], ship["lng"], p["lat"], p["lng"])
        if nearest_dist is None or d < nearest_dist:
            nearest_dist = d
            nearest = p

    return {
        "name": ship["name"],
        "flag": ship.get("flag"),
        "status": ship.get("status"),
        "vessel_type": ship.get("vessel_type"),
        "nearest_port": nearest["name"] if nearest else None,
        "nearest_port_distance_km": round(nearest_dist, 1) if nearest_dist is not None else None,
        "nearest_port_direction": bearing_compass(ship["lat"], ship["lng"], nearest["lat"], nearest["lng"]) if nearest else None,
    }

CHAT_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "query_ships",
            "description": (
                "Filter the live tracked fleet by vessel type, movement status, "
                "dark-fleet flag, how long since last AIS update, and/or proximity "
                "to a named port anywhere in the world. Returns the total count, a "
                "breakdown by status and vessel type, and up to 5 sample ships."
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
    },
    {
        "type": "function",
        "function": {
            "name": "port_direction",
            "description": "Get the real distance and compass direction from one named port to another.",
            "parameters": {
                "type": "object",
                "properties": {
                    "from_port": {"type": "string"},
                    "to_port": {"type": "string"},
                },
                "required": ["from_port", "to_port"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "find_ship",
            "description": (
                "Look up a specific live ship by name and get its real position, status, "
                "and its actual nearest port with distance and compass direction. Always use "
                "this for questions about a named ship — never assume a ship's name refers to "
                "a real-world place."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "name": {"type": "string", "description": "The ship's name, e.g. 'RATINGEN'"},
                },
                "required": ["name"],
            },
        },
    },
]


@app.post("/chat")
def chat(req: ChatRequest):
    if not GROQ_API_KEY:
        return {"reply": "Chat isn't configured yet (missing GROQ_API_KEY in .env).", "ships": []}

    system_prompt = (
        "You are a maritime fleet assistant. Answer questions about the ships currently "
        "being tracked live via AIS by calling the query_ships tool. Never guess ship data "
        "yourself. You may call the tool several times (for example once per port when "
        "comparing ports). Keep answers concise, mention ship names and key facts (status, vessel "
        "type, time since last update), and say plainly if zero ships matched. Note that "
        "live position data only exists for ships in the North Sea / English Channel region, "
        "even though port lookups cover the whole world. When comparing two named ports "
        "(e.g. which is busier), call port_direction to state the real distance and "
        "compass direction between them rather than guessing. For questions about a specific "
        "named ship (e.g. 'nearest port to X'), always call find_ship — never assume the name "
        "refers to a real-world place, since it's a ship you're tracking live. When asked which port is "
        "busiest, always also look up at least one other nearby port and mention it by name "
        "for comparison, e.g. 'For comparison, X has only N ships nearby.' Never write two or "
        "more numbers on the same line without a comma or a line break between them — "
        "write 'Moving: 37, Anchored-port: 20, Anchored-sea: 8', not 'Moving: 37 Anchored-port: 20'. "
        "Do not list individual sample ship names unless the person specifically asks for named ships — "
        "stick to counts and breakdowns by status/type."
    )

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": req.message},
    ]

    matched_ships = []
    matched_count = 0
    tool_call_count = 0
    MAX_ROUNDS = 5

    for round_number in range(MAX_ROUNDS + 1):
        # On the last round, forbid more tool calls so the model must write its answer.
        payload = {
            "model": GROQ_MODEL,
            "messages": messages,
            "tools": CHAT_TOOLS,
            "tool_choice": "auto" if round_number < MAX_ROUNDS else "none",
        }
        try:
            resp = groq_post(payload)
            if resp.status_code != 200:
                print("GROQ ERROR:", resp.status_code, resp.text[:800])
                return {"reply": f"Chat request failed ({resp.status_code}): {resp.text[:300]}", "ships": [], "count": 0}
        except Exception as e:
            return {"reply": f"Chat request failed: {e}", "ships": [], "count": 0}

        choice = resp.json()["choices"][0]["message"]
        tool_calls = choice.get("tool_calls")

        if not tool_calls:
            final_text = choice.get("content") or ""
            # Only highlight ships on the globe when the answer came from a single lookup.
            if tool_call_count != 1:
                matched_ships = []
            return {"reply": final_text, "ships": matched_ships, "count": matched_count}

        messages.append({
            "role": "assistant",
            "content": choice.get("content"),
            "tool_calls": tool_calls,
        })
        for call in tool_calls:
            tool_call_count += 1
            try:
                args = json.loads(call["function"]["arguments"] or "{}")
                fn_name = call["function"]["name"]
                if fn_name == "port_direction":
                    result = port_direction(**args)
                elif fn_name == "find_ship":
                    result = find_ship(**args)
                else:
                    result = query_ships(**args)
            except Exception as e:
                result = {"error": f"tool call failed: {e}"}
            if "ships" in result:
                matched_ships = result["ships"]
                matched_count = result.get("count", len(matched_ships))
            messages.append({
                "role": "tool",
                "tool_call_id": call["id"],
                "content": json.dumps(slim_for_model(result)),
            })

    return {"reply": "Sorry, I couldn't finish that question.", "ships": [], "count": 0}