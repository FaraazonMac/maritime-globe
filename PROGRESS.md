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

## Current state
- ✅ Live globe with real ships, ports, lighthouses
- ✅ Frontend ↔ backend fully connected, both on GitHub
- ✅ Click panel shows real status/speed/heading
- ⬜ No flag/operator/build-year data yet (needs Equasis enrichment — separate future phase)
- ⬜ Dark-fleet detector — not started
- ⬜ Port congestion predictor — not started
- ⬜ AI agent chat — not started

## Next target
Dark-fleet / sanctions-evasion detector — flagging ships with suspicious AIS gaps or behavior. First real ML/AI feature of the project.