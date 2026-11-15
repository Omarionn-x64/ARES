import { MOONS } from './moonFacts.js';
import { introStore } from './store.js';
import { MarsSceneController } from './scene.js';
import { LANDING_SITE_DATA } from './siteData.js';
import { fetchCuriositySiteData } from './nasaProxy.js';

const CUT_AT_SECONDS = 7.0;

// DOM References
const canvasEl = document.getElementById('mars-canvas');
const webglFallbackEl = document.getElementById('webgl-fallback');
const phaseIndicatorEl = document.getElementById('phase-indicator');
const orbitOverlayEl = document.getElementById('orbit-overlay');
const videoLayerEl = document.getElementById('video-layer');
const landingVideoEl = document.getElementById('landing-video');
const edlCanvasEl = document.getElementById('edl-fallback-canvas');
const edlTimerEl = document.getElementById('edl-timer');
const skipIntroBtn = document.getElementById('skip-intro-btn');
const playVideoBtn = document.getElementById('play-video-btn');
const dustFlashEl = document.getElementById('dust-flash');
const enteringOverlayEl = document.getElementById('entering-overlay');
const siteHandoffEl = document.getElementById('site-handoff');
const srAnnouncerEl = document.getElementById('sr-announcer');
const curiosityTooltipEl = document.getElementById('curiosity-tooltip');
const curiosityNameEl = document.getElementById('curiosity-name');
const curiosityDescriptionEl = document.getElementById('curiosity-description');
const curiosityFactsEl = document.getElementById('curiosity-facts');
const curiosityHazardsEl = document.getElementById('curiosity-hazards');
const curiosityMineralsEl = document.getElementById('curiosity-minerals');
const curiosityNasaImageEl = document.getElementById('curiosity-nasa-image');
const curiosityNasaMetaEl = document.getElementById('curiosity-nasa-meta');

// Moon Fact Card DOM
const factCardEl = document.getElementById('moon-fact-card');
const factMoonNameEl = document.getElementById('fact-moon-name');
const factMoonMetaEl = document.getElementById('fact-moon-meta');
const factTextEl = document.getElementById('fact-text');
const factCounterEl = document.getElementById('fact-counter');
const closeFactBtn = document.getElementById('close-fact-card');
const nextFactBtn = document.getElementById('next-fact-btn');

// Nav Buttons
const btnReplayIntro = document.getElementById('btn-replay-intro');
const btnMoonPhobos = document.getElementById('btn-moon-phobos');
const btnMoonDeimos = document.getElementById('btn-moon-deimos');
const btnEnterMars = document.getElementById('btn-enter-mars');
const btnLaunchRoute = document.getElementById('btn-launch-route');
const btnReturnOrbit = document.getElementById('btn-return-orbit');

let currentFactIndex = 0;
let sceneController = null;
let edlSimRaf = null;
let edlSimStart = null;
let hasRealVideo = false;
let hasFocusZoomedToCuriosity = false;

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function announce(message) {
  if (srAnnouncerEl) {
    srAnnouncerEl.textContent = message;
  }
}

async function loadCuriosityImageFromMarsTrek() {
  try {
    const res = await fetch('/api/mars-trek/capabilities');
    if (!res.ok) {
      throw new Error('Mars Trek capabilities endpoint is not configured');
    }

    const xml = await res.text();
    const hasMarsTrekConfig = xml && xml.includes('GetCapabilities') && xml.length > 200;

    if (!hasMarsTrekConfig) {
      throw new Error('Mars Trek capabilities response is empty');
    }

    curiosityNasaMetaEl.textContent = 'Mars Trek tile layer detected. Waiting for exact endpoint configuration.';
    curiosityNasaImageEl.src = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="820" height="420" viewBox="0 0 820 420">
        <defs>
          <linearGradient id="bg" x1="0" x2="1">
            <stop offset="0%" stop-color="#1c150f"/>
            <stop offset="50%" stop-color="#5a2d13"/>
            <stop offset="100%" stop-color="#120d0a"/>
          </linearGradient>
        </defs>
        <rect width="820" height="420" fill="url(#bg)"/>
        <circle cx="610" cy="110" r="70" fill="#f7d1a2" opacity="0.2"/>
        <path d="M0 320 C150 250, 220 310, 420 280 C570 250, 690 260, 820 220 L820 420 L0 420 Z" fill="#7c3518" opacity="0.8"/>
        <text x="40" y="120" font-size="28" fill="#f5d1a1" font-family="Arial, sans-serif">Mars Trek tile layer available</text>
        <text x="40" y="170" font-size="18" fill="#f5d1a1" opacity="0.8" font-family="Arial, sans-serif">Waiting for the exact NASA WMTS endpoint values</text>
      </svg>
    `);
    curiosityNasaImageEl.alt = 'Mars Trek tile layer placeholder preview';
  } catch (error) {
    console.warn('Mars Trek layer not yet configured:', error);
    curiosityNasaMetaEl.textContent = 'Mars Trek tile service is not configured yet; rover imagery will be used if available.';
  }
}

async function populateCuriositySitePanel() {
  const site = LANDING_SITE_DATA.curiosity;
  curiosityNameEl.textContent = site.title;
  curiosityDescriptionEl.textContent = site.description;

  curiosityFactsEl.innerHTML = site.facts
    .map((fact) => `<li>${fact}</li>`)
    .join('');

  curiosityHazardsEl.innerHTML = site.hazards
    .map((hazard) => `<li>${hazard}</li>`)
    .join('');

  curiosityMineralsEl.innerHTML = site.minerals
    .map((mineral) => `<li>${mineral}</li>`)
    .join('');

  await loadCuriosityImageFromMarsTrek();

  try {
    const nasaData = await fetchCuriositySiteData();
    const photo = nasaData.photos?.[0];

    if (photo && photo.img_src) {
      curiosityNasaImageEl.src = photo.img_src;
      curiosityNasaImageEl.alt = `${site.title} Curiosity image`;
      curiosityNasaMetaEl.textContent = `Rover: ${photo.rover} • Camera: ${photo.camera} • Sol: ${photo.sol}`;
    }
  } catch (error) {
    console.warn('Unable to fetch Curiosity API data:', error);
    if (!curiosityNasaImageEl.src || curiosityNasaImageEl.src === window.location.href) {
      curiosityNasaMetaEl.textContent = 'NASA imagery is unavailable while the secure proxy is offline.';
    }
  }
}

function showCuriosityHover() {
  if (!curiosityTooltipEl) return;
  curiosityTooltipEl.classList.remove('hidden');
  populateCuriositySitePanel();
}

function hideCuriosityHover() {
  if (!curiosityTooltipEl) return;
  curiosityTooltipEl.classList.add('hidden');
}

const closeCuriosityTooltipBtn = document.getElementById('close-curiosity-tooltip');
if (closeCuriosityTooltipBtn) {
  closeCuriosityTooltipBtn.addEventListener('click', hideCuriosityHover);
}

const sceneHoverHandler = (siteId) => {
  if (siteId === 'curiosity') {
    showCuriosityHover();
    return;
  }
  hideCuriosityHover();
};

function isWebGLAvailable() {
  try {
    const testCanvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

function activateCuriositySite() {
  if (sceneController) {
    sceneController.zoomToLandingSite();
  }
  showCuriosityHover();
  hasFocusZoomedToCuriosity = true;
  announce('Curiosity landing site focused. Gale Crater is now in view.');
}

function startEdlFallbackAnimation() {
  stopEdlFallbackAnimation();
  edlCanvasEl.classList.remove('hidden');
  const ctx = edlCanvasEl.getContext('2d');
  edlSimStart = performance.now();

  const renderFrame = (now) => {
    const { phase } = introStore.getState();
    if (phase !== 'video') return;

    const elapsed = (now - edlSimStart) / 1000;
    const progress = Math.min(elapsed / CUT_AT_SECONDS, 1);

    const w = (edlCanvasEl.width = window.innerWidth);
    const h = (edlCanvasEl.height = window.innerHeight);

    const grad = ctx.createRadialGradient(w * 0.5, h * 0.62, 20, w * 0.5, h * 0.5, Math.max(w, h) * 0.75);
    grad.addColorStop(0, `rgba(${193 + progress * 45}, ${84 + progress * 35}, 34, 1)`);
    grad.addColorStop(0.55, '#4a1909');
    grad.addColorStop(1, '#090608');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    const horizonY = h * (0.42 + progress * 0.24);
    ctx.strokeStyle = 'rgba(255, 195, 150, 0.24)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 10; i++) {
      const y = horizonY + Math.pow(i / 10, 1.7) * (h - horizonY);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    const cx = w * 0.5;
    const cy = h * 0.5;
    const radius = 90 - progress * 32;
    ctx.strokeStyle = 'rgba(255, 217, 176, 0.55)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    const altKm = Math.max(0.02, (11.2 * (1 - progress)).toFixed(2));
    const stage =
      elapsed < 2.5
        ? 'PARACHUTE DEPLOYED'
        : elapsed < 5.2
        ? 'HEAT SHIELD SEPARATION'
        : 'SKY CRANE TERMINAL DESCENT';
    edlTimerEl.textContent = `T+ 0${elapsed.toFixed(1)}s — ALT ${altKm} KM — ${stage}`;

    if (elapsed >= CUT_AT_SECONDS) {
      introStore.setPhase('transition');
      return;
    }

    edlSimRaf = requestAnimationFrame(renderFrame);
  };

  edlSimRaf = requestAnimationFrame(renderFrame);
}

function stopEdlFallbackAnimation() {
  if (edlSimRaf) {
    cancelAnimationFrame(edlSimRaf);
    edlSimRaf = null;
  }
}

function triggerDustFlash() {
  dustFlashEl.classList.remove('hidden');
  dustFlashEl.style.animation = 'none';
  void dustFlashEl.offsetWidth;
  dustFlashEl.style.animation = '';
  setTimeout(() => {
    dustFlashEl.classList.add('hidden');
  }, 650);
}

function renderMoonFactCard(moonId) {
  const moon = MOONS.find((m) => m.id === moonId);
  if (!moon) {
    factCardEl.classList.add('hidden');
    btnMoonPhobos.classList.remove('active');
    btnMoonDeimos.classList.remove('active');
    return;
  }

  btnMoonPhobos.classList.toggle('active', moon.id === 'phobos');
  btnMoonDeimos.classList.toggle('active', moon.id === 'deimos');

  factMoonNameEl.textContent = moon.name;
  factMoonMetaEl.textContent = moon.subtitle;
  factTextEl.textContent = moon.facts[currentFactIndex];
  factCounterEl.textContent = `${currentFactIndex + 1} / ${moon.facts.length}`;

  factCardEl.classList.remove('hidden');
  factCardEl.focus();
  announce(`${moon.name} selected. ${moon.facts[currentFactIndex]}`);
}

function handleStateChange(state, prevState) {
  const { phase, selectedMoon } = state;

  const phaseLabels = {
    video: 'EDL TELEMETRY',
    transition: 'ORBITAL INSERTION',
    orbit: 'ORBITAL OVERVIEW',
    moonFact: 'SATELLITE INSPECTION',
    entering: 'SURFACE DESCENT',
  };
  phaseIndicatorEl.textContent = phaseLabels[phase] || 'ORBITAL OVERVIEW';

  if (phase === 'video') {
    videoLayerEl.classList.remove('hidden', 'fading-out');
    orbitOverlayEl.classList.add('hidden');
    factCardEl.classList.add('hidden');
    enteringOverlayEl.classList.add('hidden');
    siteHandoffEl.classList.add('hidden');
    if (hasRealVideo) {
      landingVideoEl.currentTime = 0;
      landingVideoEl.play().catch(() => {
        playVideoBtn.classList.remove('hidden');
      });
    } else {
      startEdlFallbackAnimation();
    }
  }

  if (phase === 'transition') {
    stopEdlFallbackAnimation();
    videoLayerEl.classList.add('fading-out');
    triggerDustFlash();
    announce('Landing sequence complete. Pulling back to Mars orbital view.');

    setTimeout(() => {
      videoLayerEl.classList.add('hidden');
    }, 1000);

    if (sceneController) {
      sceneController.playPullBackTransition(reduceMotion);
    } else {
      introStore.setPhase('orbit');
    }
  }

  if (phase === 'orbit') {
    videoLayerEl.classList.add('hidden');
    orbitOverlayEl.classList.remove('hidden');
    factCardEl.classList.add('hidden');
    enteringOverlayEl.classList.add('hidden');
    btnMoonPhobos.classList.remove('active');
    btnMoonDeimos.classList.remove('active');
    announce('Interactive Mars orbit view active. Select Phobos, Deimos, or click Mars to enter.');
  }

  if (phase === 'moonFact' && selectedMoon) {
    if (prevState.selectedMoon !== selectedMoon) {
      currentFactIndex = 0;
      if (sceneController) {
        sceneController.focusOnMoon(selectedMoon);
      }
    }
    renderMoonFactCard(selectedMoon);
  }

  if (phase === 'entering') {
    orbitOverlayEl.classList.add('hidden');
    factCardEl.classList.add('hidden');
    enteringOverlayEl.classList.remove('hidden');
    announce('Diving toward Gale Crater surface map.');

    if (sceneController) {
      sceneController.playDiveTransition(reduceMotion);
    } else {
      siteHandoffEl.classList.remove('hidden');
    }
  }
}

function initVideoHandlers() {
  landingVideoEl.addEventListener('loadeddata', () => {
    hasRealVideo = true;
    stopEdlFallbackAnimation();
    edlCanvasEl.classList.add('hidden');
  });

  landingVideoEl.addEventListener('timeupdate', () => {
    const { phase } = introStore.getState();
    if (phase === 'video') {
      edlTimerEl.textContent = `T+ 0${landingVideoEl.currentTime.toFixed(1)}s — DESCENT FEED`;
      if (landingVideoEl.currentTime >= CUT_AT_SECONDS) {
        introStore.setPhase('transition');
      }
    }
  });

  landingVideoEl.addEventListener('ended', () => {
    if (introStore.getState().phase === 'video') {
      introStore.setPhase('transition');
    }
  });

  landingVideoEl.addEventListener('error', () => {
    hasRealVideo = false;
    landingVideoEl.classList.add('hidden');
    if (introStore.getState().phase === 'video') {
      startEdlFallbackAnimation();
    }
  });

  const playPromise = landingVideoEl.play();
  if (playPromise !== undefined) {
    playPromise.catch(() => {
      if (hasRealVideo) {
        playVideoBtn.classList.remove('hidden');
      }
    });
  }

  playVideoBtn.addEventListener('click', () => {
    landingVideoEl.play();
    playVideoBtn.classList.add('hidden');
  });

  skipIntroBtn.addEventListener('click', () => {
    introStore.setPhase('transition');
  });
}

function initUIEvents() {
  closeFactBtn.addEventListener('click', () => {
    currentFactIndex = 0;
    introStore.selectMoon(null);
  });

  nextFactBtn.addEventListener('click', () => {
    const { selectedMoon } = introStore.getState();
    const moon = MOONS.find((m) => m.id === selectedMoon);
    if (!moon) return;
    currentFactIndex = (currentFactIndex + 1) % moon.facts.length;
    renderMoonFactCard(selectedMoon);
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && introStore.getState().phase === 'moonFact') {
      currentFactIndex = 0;
      introStore.selectMoon(null);
    }
    if (e.key === 'Escape' && !curiosityTooltipEl.classList.contains('hidden')) {
      hideCuriosityHover();
    }
  });

  btnMoonPhobos.addEventListener('click', () => {
    const { phase } = introStore.getState();
    if (phase === 'video') introStore.setPhase('orbit');
    introStore.selectMoon('phobos');
  });

  btnMoonDeimos.addEventListener('click', () => {
    const { phase } = introStore.getState();
    if (phase === 'video') introStore.setPhase('orbit');
    introStore.selectMoon('deimos');
  });

  btnEnterMars.addEventListener('click', () => {
    const { phase } = introStore.getState();
    if (phase === 'video') {
      videoLayerEl.classList.add('hidden');
      if (sceneController) sceneController.setOrbitImmediate();
    }
    hideCuriosityHover();
    introStore.setPhase('entering');
  });

  btnReplayIntro.addEventListener('click', () => {
    hideCuriosityHover();
    if (sceneController) {
      sceneController.resetToStart();
    }
    introStore.setPhase('video');
  });

  btnLaunchRoute.addEventListener('click', () => {
    window.location.assign('/site/gale');
  });

  btnReturnOrbit.addEventListener('click', () => {
    hideCuriosityHover();
    siteHandoffEl.classList.add('hidden');
    if (sceneController) {
      sceneController.setOrbitImmediate();
    }
    introStore.setPhase('orbit');
  });

  document.querySelectorAll('[data-moon]').forEach((btn) => {
    if (btn !== btnMoonPhobos && btn !== btnMoonDeimos) {
      btn.addEventListener('click', () => {
        introStore.selectMoon(btn.getAttribute('data-moon'));
      });
    }
  });

  const fallbackEnterBtn = document.getElementById('fallback-enter-btn');
  if (fallbackEnterBtn) {
    fallbackEnterBtn.addEventListener('click', () => {
      hideCuriosityHover();
      siteHandoffEl.classList.remove('hidden');
    });
  }
}

function bootstrap() {
  introStore.subscribe(handleStateChange);
  initUIEvents();

  if (isWebGLAvailable()) {
    sceneController = new MarsSceneController(canvasEl, () => {
      enteringOverlayEl.classList.add('hidden');
      siteHandoffEl.classList.remove('hidden');
    }, sceneHoverHandler, activateCuriositySite);
  } else {
    canvasEl.classList.add('hidden');
    webglFallbackEl.classList.remove('hidden');
  }

  const hasVisited = localStorage.getItem('ares_intro_seen') === '1';
  if (reduceMotion) {
    videoLayerEl.classList.add('hidden');
    if (sceneController) sceneController.setOrbitImmediate();
    introStore.setPhase('orbit');
  } else {
    initVideoHandlers();
    localStorage.setItem('ares_intro_seen', '1');
    if (hasVisited) {
      btnReplayIntro.classList.remove('hidden');
    }
  }
}

bootstrap();
