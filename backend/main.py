from fastapi import FastAPI

app = FastAPI()

ships = [
    {"name": "MV Pacific Glory", "lat": 1.5, "lng": 104.1, "type": "Container Ship"},
    {"name": "MV Atlas", "lat": 51.95, "lng": 4.14, "type": "Tanker"},
]

@app.get("/ships")
def get_ships():
    return ships