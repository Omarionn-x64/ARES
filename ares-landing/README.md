# ARES Landing Page

Modular HTML, CSS, and ES Module JavaScript implementation of the **ARES (Astronaut Routing and Environment Survival)** intro sequence and interactive 3D Mars globe.

## Folder Structure

```text
ares-landing/
├── index.html          # Semantic HTML shell, HUD overlays, and import map
├── css/
│   └── styles.css      # Custom HUD styling, dust flash & fade keyframes, responsive rules
├── js/
│   ├── main.js         # Page lifecycle, video/EDL cut timer, keyboard & UI event wiring
│   ├── scene.js        # Three.js Mars globe, Fresnel atmosphere, moons, and GSAP camera transitions
│   ├── textures.js     # Procedural Martian albedo/bump generator + external texture loader
│   ├── moonFacts.js    # Phobos & Deimos orbital parameters and fact deck
│   └── store.js        # Reactive phase state machine (video -> transition -> orbit -> moonFact -> entering)
├── video/              # Place landing.mp4, landing.webm, and landing-poster.jpg here
├── tex/                # Optional: place mars_color_2k.jpg and mars_normal_2k.jpg here
└── models/             # Optional: place phobos.glb and deimos.glb here
```

## Running Locally

Because `js/main.js` uses native ES modules (`type="module"`), serve the folder over a local HTTP server (for example):

```bash
npx serve .
# or
python3 -m http.server 8080
```
