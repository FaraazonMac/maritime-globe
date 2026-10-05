# 🌊 Maritime Globe

**A live 3D globe of real ships, tracked via AIS, with genuine maritime-intelligence features layered on top — not just dots on a map.**

Most public ship trackers show you *where* ships are. This project treats the live AIS feed as raw data to derive real insight from: which ships have gone dark, how congested a port is right now, and what's actually happening around any given vessel — answered by an AI agent that queries live data instead of guessing.

<!-- ![Maritime Globe screenshot](docs/screenshot.png) -->

---

## Table of Contents

- [Key Features](#key-features)
- [Also Built In](#also-built-in)
- [Scope: Why Not Every Ship Worldwide?](#scope-why-not-every-ship-worldwide)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Known Limitations](#known-limitations)
- [Roadmap](#roadmap)

---

## Key Features

| Feature | What it does |
|---|---|
| 🔴 **Dark-fleet / AIS-gap detector** | Flags any ship silent for 20+ minutes — a simplified version of a technique maritime intelligence firms sell to governments for sanctions-evasion and illegal-fishing monitoring. Computed live from real AIS timestamps. |
| 🟢 **Live port congestion** | For every port in the tracked region, computes a live congestion score from real ship density (anchored ships within 15km, docked count, traffic). Explicitly scoped as a *live estimate*, not a historical forecast — no historical port-call data exists to train a real predictor on. |
| 💬 **AI fleet chat assistant** | Ask questions in plain English — *"how many tankers are idling near Rotterdam?"*, *"which Belgian port is busiest right now?"* — and get answers grounded in the live fleet. Powered by Groq (`openai/gpt-oss-120b`) with function-calling: the model decides *what* to query, the backend runs the real filter against live data, and the model only writes the final sentence. |

## Also Built In

- **Real vessel identity** — flag (derived from the MMSI's official ITU country code), IMO number, and call sign, from live AIS static data
- **Full live weather per ship** — wind speed/direction/gusts, sky condition with storm flag, pressure, visibility, wave height/period, swell, sea temperature, ocean current
- **Nearest-facility awareness** — real distance and compass bearing from any ship to the nearest port, lighthouse, shipyard, recycling yard, bunkering station, dry dock, and wet dock
- **Global infrastructure data** — ~3,630 real ports (NGA World Port Index) plus curated real shipyards, lighthouses, recycling yards, bunkering stations, and dry/wet docks, all as toggleable map layers
- **Interactive port-checker** — "Check another port →" cycles through progressively farther ports from a selected ship, each numbered live on the globe
- **Voyage data** — destination and ETA from AIS, plus departure ports detected live when a ship leaves a known port. The departure log is saved to disk and survives restarts, but only covers departures observed while the server was running
- **Smarter chat** — remembers the conversation, looks up ships by name or IMO and facilities by name, filters by flag, departure port and destination, and highlights whole result sets on the globe

## Scope: Why Not Every Ship Worldwide?

A deliberate engineering decision, not an oversight.

1. **AIS coverage isn't actually global.** Free feeds like [AISStream.io](https://aisstream.io) rely on a community network of land-based receivers, strong near coastlines, and dropping off sharply in open ocean. Closing that gap needs *satellite* AIS — a paid commercial product (Kpler, Spire, etc.). "All ships worldwide" on a free tier would mean busy coastlines and empty oceans — a worse product than one honestly scoped.
2. **Rendering cost.** Every ship is a live 3D object, rebuilt on every 10-second poll. The current North Sea/English Channel region alone regularly holds 1,000–3,000+ live ships. Global scale would need a different rendering strategy (GPU instancing, clustering) to stay smooth in a browser.
3. **Payload size.** `/ships` returns the full tracked fleet on every poll. At global AIS volume that payload reaches multiple megabytes every 10 seconds — untenable on free-tier infrastructure.

**None of the analysis features are region-limited.** Dark-fleet detection, port congestion, nearest-facility lookups, and the AI chat assistant already operate on the *entire* global port/infrastructure dataset. They'd work identically well the moment ship tracking widened — the AIS subscription's bounding box is a single line of config, not an architectural limitation.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite, [react-globe.gl](https://github.com/vasturiano/react-globe.gl) (Three.js) |
| Backend | Python, FastAPI, async WebSocket |
| Live AIS data | [AISStream.io](https://aisstream.io) |
| Port data | [NGA World Port Index](https://msi.nga.mil/Publications/WPI) |
| Weather data | [Open-Meteo](https://open-meteo.com) (marine + atmospheric, free, no key) |
| AI chat | [Groq](https://groq.com) (`openai/gpt-oss-120b`, function-calling) |


## Architecture

AISStream.io (WebSocket)
│
▼
FastAPI backend ──► in-memory live ship store
│ │
│ ├──► dark-fleet flagging
│ ├──► port congestion scoring
│ └──► /chat (Groq function-calling)
▼
REST endpoints (/ships, /ships/dark-fleet, /chat)
│
▼
React frontend ──► react-globe.gl (3D render)
│
├──► Open-Meteo (weather, per selected ship)
└──► NGA World Port Index (global port data)


## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- A free [AISStream.io](https://aisstream.io) API key
- A free [Groq](https://console.groq.com) API key (for the chat assistant)

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install fastapi uvicorn websockets python-dotenv requests
```

Create `backend/.env`:

AISSTREAM_API_KEY=your_key_here
GROQ_API_KEY=your_key_here


Run it:

```bash
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## API Reference

| Method | Endpoint | Description |

| `GET` | `/ships` | All currently tracked ships, with dark-fleet flags applied |
| `GET` | `/ships/dark-fleet` | Only ships currently flagged as dark |
| `POST` | `/chat` | AI fleet assistant. Send `{ "message": "...", "history": [...] }`, get `{ "reply", "ships", "facilities" }` back |

## Known Limitations

- No operator or build-year data — this doesn't exist in AIS broadcasts. The only real source (Equasis) requires a login with no public API, and this project doesn't build scrapers for authenticated third-party services.
- Some smaller vessels (fishing boats, pleasure craft, Class B AIS transponders) never broadcast an IMO number — a real limitation of the ship's equipment, not a bug.
- Live ship tracking is scoped to the North Sea/English Channel (see [Scope](#scope-why-not-every-ship-worldwide) above).
- Departure ports are only recorded for departures observed while the server is running. Ships that left port before that are unknown, and "departed yesterday"-style questions can't be answered.

## Roadmap

- [ ] Self-check/monitoring for overall system health (backend, AIS feed, data freshness)
- [ ] Evaluate widening live tracking beyond the North Sea/English Channel
- [ ] `requirements.txt` for one-command backend setup