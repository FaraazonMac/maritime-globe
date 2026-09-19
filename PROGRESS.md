# Maritime Globe — Progress Log

## Project
A live 3D ship-tracking globe (React + react-globe.gl) backed by a Python FastAPI service consuming real AIS data, with three planned differentiator features: dark-fleet/sanctions detector, port congestion predictor, AI agent chat.

## Milestone log

### Session 1 — Frontend foundations
- Set up Node.js, Vite + React + TypeScript project
- Learned JSX, useState, .map(), git/GitHub basics
- Built first globe (Cesium, later switched to react-globe.gl for better look/less friction)

### Session 2 — Globe styling
- Custom SVG markers for ships (status-based), ports (anchor icon), lighthouses (triangle)
- Click-to-inspect detail panel
- Fixed pointer-events bug blocking clicks

### Session 3 — Backend foundations
- Python virtual environment, FastAPI, first `/ships` endpoint
- Connected frontend to backend via fetch() + CORS

### Session 4 — Real AIS data
- Signed up for AISStream.io, secured API key in `.env`
- Built websocket listener as a FastAPI background task
- Fixed SSL cert issue, Anaconda/venv environment confusion
- Real live ships now flowing end-to-end: AISStream → backend → frontend → globe

### Session 5 — Real-data cleanup (today)
- Added periodic refetch (ships now update every 10s, genuinely live)
- Diagnosed and fixed performance issue: switched ships from DOM-based HTML markers to WebGL `objectsData` sprites (handles hundreds of real ships smoothly)
- Built directional arrow markers using real AIS heading data, uniform sizing across zoom levels (`sizeAttenuation: false`)
- Swapped to higher-res free Earth texture
- Accepted known limitation: map blurs at extreme zoom (fixed-resolution free texture, not a bug)



### Session 6 — Dark-fleet / AIS-gap detector
- Built `dark_fleet.py`: flags any ship with no AIS update for 20+ minutes (`DARK_THRESHOLD_MINUTES`), with an honest reason string ("may have left tracked area or gone dark" — acknowledges the ambiguity)
- New `/ships/dark-fleet` endpoint; `/ships` now runs every ship through the flag check
- Wired into frontend: flagged ships render in alert red, detail panel shows a red-bordered "Dark Fleet Alert" box
- Fixed a real bug along the way: ship clicks weren't registering (`obj.userData` was being read off the wrong object — the click handler receives the ship data directly, not a wrapper)
- Extensively tested threshold behavior by temporarily lowering it to force visible flags, then restoring to 20 min

### Session 7 — Vessel type, live weather, real ports
- Backend now listens for AIS `ShipStaticData` messages (not just `PositionReport`), merging vessel type into each ship's record instead of overwriting it on every position update
- Decided against per-type ship icons on the globe (kept simple arrow/circle); vessel type shown as a "Type" row in the detail panel instead
- Live wave height per selected ship via Open-Meteo Marine API (handles inland/no-data ships gracefully)
- Replaced the 4 hardcoded ports with a live fetch of NGA's World Port Index (~3,630 real global ports) via ArcGIS REST GeoJSON

### Session 8 — Real-world infrastructure layers
- Attempted live shipyard/lighthouse/tank-storage data via OpenStreetMap's Overpass API; hit repeated timeout failures on unscoped worldwide queries across two different Overpass mirrors — concluded this was a genuine free-server capacity limit, not a bug
- Switched to curated real-data lists instead (source of truth for a resume project, matching how ports/bunkering were already handled): 55 shipyards, ~130 lighthouses, 15 ship recycling yards, 30 bunkering stations, 20 dry docks, 10 wet docks
- Built a "Map Layers" sidebar — all categories hidden by default, toggleable
- Clicking any facility marker opens a detail panel with name, country, and a real fact
- Added nearest-facility awareness: clicking a ship computes real distance (haversine) and compass bearing to the nearest port, lighthouse, shipyard, recycling yard, bunkering station, dry dock, and wet dock

### Session 9 — Port congestion predictor
- Scoped honestly as a live congestion score (count of anchored ships within 15km, classified Low/Medium/High), not a historical forecast — no historical port-call data exists to train a real predictor on
- New "Port Congestion (Live)" map layer, color-coded markers
- Built an interactive port-checker on the ship panel: shows nearest port + congestion, "Check another port →" cycles to progressively farther ports (each numbered simultaneously on the globe), "← Previous port" to go back
- Port facility panel (clicking a port directly) shows live docked-ship count, nearby traffic, and congestion level
- Added a full country-code → country-name lookup table for cleaner facility panel display

### Session 10 — AI fleet chat assistant
- New `/chat` backend endpoint using Groq's API with function-calling
- Single tool (`query_ships`) lets the model filter the live fleet by vessel type, status, dark-fleet flag, idle time, and/or proximity to any of the ~3,630 global ports (backend independently fetches the same World Port Index on startup, decoupled from the frontend's copy)
- Debugged through: wrong model name (`llama-3.3-70b-versatile` deprecated on Groq, switched to `openai/gpt-oss-120b`), a route defined before `app = FastAPI(...)` existed, a non-JSON-serializable `datetime` field, and a malformed follow-up message causing 400s
- Frontend: bottom-right toggle "Fleet Assistant" chat widget; matching ships highlight on the globe (dimming others) only when the result set is small enough to show in full — broad queries just show the text answer

### Session 11 — UI polish & bug fixes
- Removed a fixed-width `#root` CSS rule that was leaving empty space on wide screens
- Fixed a stacking-order bug where globe labels rendered on top of overlay panels
- Made the ship dimming effect apply consistently on both direct ship-click and chat highlighting
- Panel background, blur, and text-centering cleanup across all four panel types



## Current state
- ✅ Live globe with real ships, ports, lighthouses, shipyards, recycling yards, bunkering stations, dry/wet docks — all toggleable layers
- ✅ Dark-fleet / sanctions-evasion detector — complete
- ✅ Live port congestion score — complete
- ✅ AI fleet chat assistant (Groq function-calling over live data) — complete
- ✅ Nearest-facility distance + compass bearing on every ship
- ✅ Live weather per ship
- ⬜ No flag/operator/build-year data (Equasis enrichment — still deferred)
- ⬜ Live ship tracking still scoped to North Sea/English Channel (not worldwide) — deliberate, due to AIS volume/render performance at global scale

## Next target
Decide on global ship tracking scope (or accept current region as final), then wrap-up tasks: `requirements.txt`, README rewrite, dead-code cleanup (test_ais.py, test_groq.py), demo video.