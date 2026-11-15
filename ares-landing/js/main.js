import { MOONS } from './moonFacts.js';
import { introStore } from './store.js';
import { MarsSceneController } from './scene.js';
import { MarsSurfaceMapController } from './marsMap.js';
import { MARS_SITES } from './siteData.js';

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
const diveLabelEl = enteringOverlayEl.querySelector('.dive-label');
const diveTargetEl = enteringOverlayEl.querySelector('.dive-target');
const diveDetailsEl = document.getElementById('dive-details');
const siteHandoffEl = document.getElementById('site-handoff');
const marsTrekViewEl = document.getElementById('mars-trek-view');
const trekMapStatusEl = document.getElementById('trek-map-status');
const srAnnouncerEl = document.getElementById('sr-announcer');

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
const btnCloseTrek = document.getElementById('btn-close-trek');
const btnToggleMola = document.getElementById('btn-toggle-mola');
const btnToggleLocalMosaic = document.getElementById('btn-toggle-local-mosaic');

let currentFactIndex = 0;
let sceneController = null;
let marsSurfaceMapController = window.L
  ? new MarsSurfaceMapController('mars-leaflet-map')
  : null;
let edlSimRaf = null;
let edlSimStart = null;
let hasRealVideo = false;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function openMarsTrekView(siteId) {
  if (marsSurfaceMapController) {
    marsSurfaceMapController.open(siteId);
    return;
  }

  marsTrekViewEl.classList.remove('hidden');
  trekMapStatusEl.textContent =
    'The interactive map library did not load. Check your connection and reload the page.';
  trekMapStatusEl.classList.remove('hidden');
}

function closeMarsTrekView() {
  if (marsSurfaceMapController) {
    marsSurfaceMapController.close();
  } else {
    marsTrekViewEl.classList.add('hidden');
  }
}

function announce(message) {
  if (srAnnouncerEl) {
    srAnnouncerEl.textContent = message;
  }
}

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

/**
 * Procedural EDL Descent Telemetry Simulation
 * Plays seamlessly if local /video/landing.mp4 & landing.webm have not yet been placed.
 */
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

    // Martian atmospheric descent gradient shifting from upper haze to dusty surface
    const grad = ctx.createRadialGradient(w * 0.5, h * 0.62, 20, w * 0.5, h * 0.5, Math.max(w, h) * 0.75);
    grad.addColorStop(0, `rgba(${193 + progress * 45}, ${84 + progress * 35}, 34, 1)`);
    grad.addColorStop(0.55, '#4a1909');
    grad.addColorStop(1, '#090608');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Horizon & terrain scanlines
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

    // Center descent reticle
    const cx = w * 0.5;
    const cy = h * 0.5;
    const radius = 90 - progress * 32;
    ctx.strokeStyle = 'rgba(255, 217, 176, 0.55)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Update EDL HUD readout
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
  // Force reflow to restart CSS keyframe animation
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
  const { phase, selectedMoon, descentTarget } = state;

  // Update phase indicator badge
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
    closeMarsTrekView();

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
    siteHandoffEl.classList.add('hidden');
    closeMarsTrekView();
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
    const site = MARS_SITES[descentTarget] || MARS_SITES.gale;
    closeMarsTrekView();
    siteHandoffEl.classList.add('hidden');
    diveLabelEl.textContent = `${site.id.toUpperCase()} LANDING SITE`;
    diveTargetEl.textContent = `TARGET: ${site.title.toUpperCase()}`;
    diveDetailsEl.textContent = site.waypoints[0].summary;
    diveDetailsEl.classList.remove('hidden');

    orbitOverlayEl.classList.add('hidden');
    factCardEl.classList.add('hidden');
    enteringOverlayEl.classList.remove('hidden');
    announce(`Diving toward ${site.title}.`);

    if (sceneController) {
      sceneController.playDiveTransition(reduceMotion);
    } else {
      enteringOverlayEl.classList.add('hidden');
      openMarsTrekView(site.id);
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
    // Local video path not yet added — seamlessly run EDL simulation
    hasRealVideo = false;
    landingVideoEl.classList.add('hidden');
    if (introStore.getState().phase === 'video') {
      startEdlFallbackAnimation();
    }
  });

  // Attempt autoplay and expose Play button if browser blocks it
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

  // Keyboard navigation & Escape handler
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!marsTrekViewEl.classList.contains('hidden')) {
        closeMarsTrekView();
        if (sceneController) sceneController.setOrbitImmediate();
        introStore.setPhase('orbit');
      } else if (introStore.getState().phase === 'moonFact') {
        currentFactIndex = 0;
        introStore.selectMoon(null);
      }
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
    introStore.setPhase('entering');
  });

  btnReplayIntro.addEventListener('click', () => {
    if (sceneController) {
      sceneController.resetToStart();
    }
    introStore.setPhase('video');
  });

  btnLaunchRoute.addEventListener('click', () => {
    // Navigate to surface map route specified in ARES technical doc
    window.location.assign('/site/gale');
  });

  btnReturnOrbit.addEventListener('click', () => {
    siteHandoffEl.classList.add('hidden');
    closeMarsTrekView();
    if (sceneController) {
      sceneController.setOrbitImmediate();
    }
    introStore.setPhase('orbit');
  });

  btnCloseTrek.addEventListener('click', () => {
    closeMarsTrekView();
    if (sceneController) {
      sceneController.setOrbitImmediate();
    }
    introStore.setPhase('orbit');
  });

  btnToggleMola.addEventListener('click', () => {
    if (marsSurfaceMapController) marsSurfaceMapController.toggleMola();
  });

  btnToggleLocalMosaic.addEventListener('click', () => {
    if (marsSurfaceMapController) marsSurfaceMapController.toggleLocalMosaic();
  });

  document.querySelectorAll('.trek-site-switcher [data-site]').forEach((button) => {
    button.addEventListener('click', () => {
      if (marsSurfaceMapController) {
        marsSurfaceMapController.loadSite(button.dataset.site);
      }
    });
  });

  // Fallback page buttons
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
      openMarsTrekView(introStore.getState().descentTarget || 'gale');
    });
  }
}

function bootstrap() {
  introStore.subscribe(handleStateChange);
  initUIEvents();

  if (isWebGLAvailable()) {
    sceneController = new MarsSceneController(canvasEl, () => {
      enteringOverlayEl.classList.add('hidden');
      siteHandoffEl.classList.add('hidden');
      openMarsTrekView(introStore.getState().descentTarget || 'perseverance');
    });
  } else {
    canvasEl.classList.add('hidden');
    webglFallbackEl.classList.remove('hidden');
  }

  // Respect prefers-reduced-motion or repeat visitor skip
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
