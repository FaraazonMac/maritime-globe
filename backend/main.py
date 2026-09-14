from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS = Cross-Origin Resource Sharing. Browsers block a webpage running on
# one address (your frontend, localhost:5173) from fetching data from a
# different address (your backend, 127.0.0.1:8000) unless the backend
# explicitly says it's allowed. This is that permission.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

ships = [
    {
        "name": "MV Pacific Glory", "lat": 1.5, "lng": 104.1, "type": "Container Ship",
        "flag": "Panama", "operator": "Maersk Line", "buildYear": 2015,
        "origin": "Shanghai", "destination": "Rotterdam", "status": "moving",
    },
    {
        "name": "MV Atlas", "lat": 51.95, "lng": 4.14, "type": "Tanker",
        "flag": "Liberia", "operator": "MSC", "buildYear": 2018,
        "origin": "Jebel Ali", "destination": "Singapore", "status": "anchored-port",
    },
    {
        "name": "MV Northern Star", "lat": 29.97, "lng": 32.55, "type": "Bulk Carrier",
        "flag": "Marshall Islands", "operator": "COSCO Shipping", "buildYear": 2012,
        "origin": "Mumbai", "destination": "Hamburg", "status": "anchored-sea",
    },
    {
        "name": "MV Ocean Pioneer", "lat": 25.3, "lng": 55.4, "type": "Passenger Ship",
        "flag": "Malta", "operator": "Star Bulk", "buildYear": 2020,
        "origin": "Piraeus", "destination": "Busan", "status": "anchored-port",
    },
]

@app.get("/ships")
def get_ships():
    return ships 