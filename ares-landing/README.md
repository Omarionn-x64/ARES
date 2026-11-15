# ARES Landing Page

Modular HTML, CSS, and ES Module JavaScript implementation of the **ARES (Astronaut Routing and Environment Survival)** intro sequence and interactive 3D Mars globe.

## Folder Structure

```text
ares-landing/
├── index.html          # Semantic HTML shell, HUD overlays, and import map
├── css/
│   └── styles.css      # HUD, globe, and responsive surface-map styling
├── server.js           # Static Express server
├── 3d model/
│   └── 24881_Mars_1_6792.glb  # NASA Mars model with embedded surface maps
├── js/
│   ├── main.js         # Page lifecycle, video/EDL cut timer, keyboard & UI event wiring
│   ├── scene.js        # Three.js Mars model, surface markers, moons, and camera transitions
│   ├── siteData.js     # Curated NASA mission locations and surface-marker data
│   ├── marsMap.js      # Leaflet surface-map controller and waypoint drawer
│   ├── moonFacts.js    # Phobos & Deimos orbital parameters and fact deck
│   └── store.js        # Reactive phase state machine (video -> transition -> orbit -> moonFact -> entering)
├── video/              # Place landing.mp4, landing.webm, and landing-poster.jpg here
└── models/             # Optional: place phobos.glb and deimos.glb here
```

## Running Locally

Because `js/main.js` uses native ES modules (`type="module"`), serve the folder over a local HTTP server (for example):

```bash
npx serve .
# or
python3 -m http.server 8080
```
