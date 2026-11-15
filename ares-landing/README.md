# ARES Landing Page

The ARES (Astronaut Routing and Environment Survival) landing experience is built with React and Vite. It includes the EDL intro, interactive Three.js Mars globe, satellite fact cards, a three-site landing chooser with camera fly-to routes, and Leaflet surface mission maps.

## Run locally

```bash
npm install
npm start
```

Vite prints the local development URL. To create and preview a production build:

```bash
npm run build
npm run preview
npx tsc --noEmit
```

## Project layout

```text
ares-landing/
├── index.html
├── src/
│   ├── App.jsx          # React UI and application lifecycle
│   ├── main.jsx         # React entry point
│   └── intro/
│       ├── sites.ts       # Landing-site metadata and coordinates
│       ├── store.ts       # Zustand intro and site-selection state
│       ├── SiteMarker.tsx # Georeferenced 3D markers
│       └── SiteChooser.tsx # Accessible landing-site dialog
├── css/
│   └── styles.css       # HUD, globe, and responsive surface-map styling
├── public/
│   └── INTRO.mp4        # Landing video
├── js/
│   ├── scene.js         # Three.js Mars scene controller
│   ├── marsMap.js       # Leaflet surface-map controller
│   ├── siteData.js      # Curated NASA mission locations and surface markers
│   └── moonFacts.js     # Phobos and Deimos facts
└── 3d model/
    └── 24881_Mars_1_6792.glb
```

Optional landing-video formats and moon models can be added under `public/video/` and `public/models/`; the procedural EDL animation remains available as a fallback.

Landing-site pages are available at `/site/gale`, `/site/jezero`, and `/site/insight`. Use the chooser from orbit to preview a marker, select a site, and return with the page's **Back to orbit** button or browser Back.
