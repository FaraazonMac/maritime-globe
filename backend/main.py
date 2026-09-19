import asyncio
import json
import os
from datetime import datetime, timezone
from dark_fleet import flag_dark_ships
from contextlib import asynccontextmanager

import websockets
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()
API_KEY = os.getenv("AISSTREAM_API_KEY")

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