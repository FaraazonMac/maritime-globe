import asyncio
import json
import os
import websockets
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("AISSTREAM_API_KEY")

print(f"Loaded API key: {repr(API_KEY)}")  # temporary debug line

async def connect():
    async with websockets.connect("wss://stream.aisstream.io/v0/stream") as ws:
        subscribe_message = {
            "APIKey": API_KEY,
            "BoundingBoxes": [[[-90, -180], [90, 180]]],
        }
        await ws.send(json.dumps(subscribe_message))

        async for message in ws:
            data = json.loads(message)
            print(data)

asyncio.run(connect())