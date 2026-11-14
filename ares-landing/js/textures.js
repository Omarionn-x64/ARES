import * as THREE from 'three';

function hash2D(x, y) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return n - Math.floor(n);
}

function valueNoise(x, y) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);

  const a = hash2D(ix, iy);
  const b = hash2D(ix + 1, iy);
  const c = hash2D(ix, iy + 1);
  const d = hash2D(ix + 1, iy + 1);

  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

function fbm(x, y, octaves = 5) {
  let value = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < octaves; i++) {
    value += amp * valueNoise(x * freq, y * freq);
    freq *= 2.02;
    amp *= 0.5;
  }
  return value;
}

/**
 * Generates procedural Martian albedo and bump textures as an immediate fallback
 * while also attempting to load ./tex/mars_color_2k.jpg and ./tex/mars_normal_2k.jpg if added.
 */
export function createMarsTextures(isMobile = false) {
  const width = isMobile ? 1024 : 2048;
  const height = isMobile ? 512 : 1024;

  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = width;
  colorCanvas.height = height;
  const cCtx = colorCanvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = width;
  bumpCanvas.height = height;
  const bCtx = bumpCanvas.getContext('2d');

  const colorData = cCtx.createImageData(width, height);
  const bumpData = bCtx.createImageData(width, height);

  // Notable Martian surface features in normalized UV coordinates
  const features = [
    { u: 0.24, v: 0.44, r: 0.055, elev: 0.42 }, // Olympus Mons
    { u: 0.31, v: 0.48, r: 0.04, elev: 0.3 },   // Tharsis Montes
    { u: 0.43, v: 0.54, r: 0.09, elev: -0.35 }, // Valles Marineris canyon basin
    { u: 0.72, v: 0.62, r: 0.08, elev: -0.28 }, // Hellas Planitia
    { u: 0.62, v: 0.53, r: 0.025, elev: -0.18 }, // Gale Crater
  ];

  for (let y = 0; y < height; y++) {
    const v = y / height;
    const lat = (v - 0.5) * Math.PI;
    const polarFactor = Math.abs(v - 0.5) * 2;

    for (let x = 0; x < width; x++) {
      const u = x / width;
      const idx = (y * width + x) * 4;

      // Seamless horizontal wrapping via 3D-like cylindrical sampling
      const angle = u * Math.PI * 2;
      const nx = Math.cos(angle) * 2.5 + 3.1;
      const nz = Math.sin(angle) * 2.5 + 7.4;
      const ny = v * 5.0;

      const base = fbm(nx + ny * 0.35, nz + ny * 0.65, 5);
      const detail = fbm(nx * 4.2, nz * 4.2 + ny * 3.0, 4);

      // Southern highlands vs northern lowlands dichotomy
      const dichotomy = Math.sin(lat + base * 0.45) * 0.14;
      let elevation = base * 0.65 + detail * 0.35 + dichotomy;

      for (const f of features) {
        const du = Math.min(Math.abs(u - f.u), 1 - Math.abs(u - f.u));
        const dv = v - f.v;
        const dist = Math.sqrt(du * du + dv * dv);
        if (dist < f.r * 2.2) {
          const falloff = Math.exp(-(dist * dist) / (f.r * f.r));
          elevation += f.elev * falloff;
        }
      }

      elevation = Math.max(0, Math.min(1, elevation));

      // Albedo palette: iron-oxide ochre, basaltic dark maria, dusty highlands
      let r = 132 + elevation * 88 + (detail - 0.5) * 24;
      let g = 56 + elevation * 52 + (detail - 0.5) * 16;
      let b = 34 + elevation * 30 + (detail - 0.5) * 12;

      // Dark basaltic regions (Syrtis Major / Acidalia style patches)
      if (base < 0.42) {
        const darkMix = (0.42 - base) * 1.9;
        r -= darkMix * 52;
        g -= darkMix * 28;
        b -= darkMix * 18;
      }

      // Polar ice caps
      if (polarFactor > 0.89 + (detail - 0.5) * 0.04) {
        const iceMix = Math.min(1, (polarFactor - 0.89) * 14);
        r = r * (1 - iceMix) + 238 * iceMix;
        g = g * (1 - iceMix) + 228 * iceMix;
        b = b * (1 - iceMix) + 222 * iceMix;
      }

      colorData.data[idx] = Math.max(0, Math.min(255, r));
      colorData.data[idx + 1] = Math.max(0, Math.min(255, g));
      colorData.data[idx + 2] = Math.max(0, Math.min(255, b));
      colorData.data[idx + 3] = 255;

      const bumpVal = Math.max(0, Math.min(255, Math.floor(elevation * 255)));
      bumpData.data[idx] = bumpVal;
      bumpData.data[idx + 1] = bumpVal;
      bumpData.data[idx + 2] = bumpVal;
      bumpData.data[idx + 3] = 255;
    }
  }

  cCtx.putImageData(colorData, 0, 0);
  bCtx.putImageData(bumpData, 0, 0);

  const colorTexture = new THREE.CanvasTexture(colorCanvas);
  colorTexture.colorSpace = THREE.SRGBColorSpace;
  colorTexture.anisotropy = 4;

  const bumpTexture = new THREE.CanvasTexture(bumpCanvas);
  bumpTexture.anisotropy = 4;

  // Attempt to upgrade to external NASA/Mars Trek maps if present in /tex/
  const loader = new THREE.TextureLoader();
  loader.load(
    './tex/mars_color_2k.jpg',
    (loadedColor) => {
      loadedColor.colorSpace = THREE.SRGBColorSpace;
      colorTexture.image = loadedColor.image;
      colorTexture.needsUpdate = true;
    },
    undefined,
    () => {
      // Keep procedural texture if external file is not yet placed
    }
  );

  loader.load(
    './tex/mars_normal_2k.jpg',
    (loadedBump) => {
      bumpTexture.image = loadedBump.image;
      bumpTexture.needsUpdate = true;
    },
    undefined,
    () => {}
  );

  return { colorTexture, bumpTexture };
}
