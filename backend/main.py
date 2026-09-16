import asyncio
import json
import os
from contextlib import asynccontextmanager

import websockets
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()
API_KEY = os.getenv("AISSTREAM_API_KEY")

# In-memory store: latest known position per ship, keyed by MMSI.
# A background task keeps this updated forever; /ships just reads
# whatever's currently in here at the moment it's asked.
live_ships: dict[int, dict] = {}

STATUS_MAP = {
    0: "moving", 1: "anchored-sea", 2: "anchored-sea", 3: "anchored-sea",
    4: "anchored-sea", 5: "anchored-port", 6: "anchored-sea", 7: "moving",
    8: "moving",
}

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
            if data.get("MessageType") != "PositionReport":
                continue

            meta = data["MetaData"]
            report = data["Message"]["PositionReport"]
            mmsi = meta["MMSI"]

            live_ships[mmsi] = {
                "name": (meta.get("ShipName") or "Unknown").strip(),
                "lat": meta["latitude"],
                "lng": meta["longitude"],
                "type": "Vessel",
                "status": STATUS_MAP.get(report.get("NavigationalStatus"), "anchored-sea"),
                "speed": report.get("Sog"),
                "heading": report.get("Cog"),
            }

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
    return list(live_ships.values())