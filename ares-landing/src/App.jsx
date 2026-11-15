import React, { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { MOONS } from '../js/moonFacts.js';
import { MarsSceneController } from '../js/scene.js';
import { MarsSurfaceMapController } from '../js/marsMap.js';
import { MARS_SITES } from '../js/siteData.js';
import { introStore } from '../js/store.js';

const CUT_AT_SECONDS = 7;
const PHASE_LABELS = {
  video: 'EDL TELEMETRY',
  transition: 'ORBITAL INSERTION',
  orbit: 'ORBITAL OVERVIEW',
  moonFact: 'SATELLITE INSPECTION',
  entering: 'SURFACE DESCENT',
};
const DEFAULT_MAP_STATE = {
  status: '',
  site: null,
  waypointIndex: 0,
  molaEnabled: false,
  localMosaicEnabled: false,
};
const subscribeToStore = (listener) => introStore.subscribe(listener);
const getStoreSnapshot = () => introStore.getState();

function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

function formatCoordinates([latitude, longitude]) {
  const latitudeHemisphere = latitude < 0 ? 'S' : 'N';
  const longitudeHemisphere = longitude < 0 ? 'W' : 'E';
  return `${Math.abs(latitude).toFixed(4)}° ${latitudeHemisphere}, ${Math.abs(longitude).toFixed(4)}° ${longitudeHemisphere}`;
}

function App() {
  const state = useSyncExternalStore(
    subscribeToStore,
    getStoreSnapshot
  );
  const { phase, selectedMoon, descentTarget } = state;
  const canvasRef = useRef(null);
  const tooltipRef = useRef(null);
  const videoRef = useRef(null);
  const edlCanvasRef = useRef(null);
  const edlTimerRef = useRef(null);
  const mapElementRef = useRef(null);
  const sceneControllerRef = useRef(null);
  const mapControllerRef = useRef(null);
  const previousMoonRef = useRef(null);
  const transitionStartedRef = useRef(false);
  const enteringTargetRef = useRef(null);
  const edlAnimationRef = useRef(null);
  const transitionTimersRef = useRef([]);
  const [webglAvailable, setWebglAvailable] = useState(true);
  const [mapAvailable, setMapAvailable] = useState(true);
  const [mapOpen, setMapOpen] = useState(false);
  const [mapState, setMapState] = useState(DEFAULT_MAP_STATE);
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [hasRealVideo, setHasRealVideo] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(false);
  const [videoVisible, setVideoVisible] = useState(true);
  const [videoFading, setVideoFading] = useState(false);
  const [dustFlashVisible, setDustFlashVisible] = useState(false);
  const [hasVisited, setHasVisited] = useState(false);
  const [diveDetails, setDiveDetails] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const reduceMotion = useRef(false);

  const selectedMoonData = MOONS.find((moon) => moon.id === selectedMoon);
  const currentFact = selectedMoonData?.facts[currentFactIndex];
  const activeSite = mapState.site;
  const activeWaypoint = activeSite?.waypoints[mapState.waypointIndex];

  const announce = useCallback((message) => setAnnouncement(message), []);

  const openMarsTrekView = useCallback((siteId) => {
    setMapOpen(true);
    if (mapControllerRef.current) {
      mapControllerRef.current.open(siteId);
    } else {
      setMapState((previous) => ({
        ...previous,
        status: 'The interactive map could not be initialized. Check your connection and reload the page.',
      }));
    }
  }, []);

  const closeMarsTrekView = useCallback(() => {
    setMapOpen(false);
  }, []);

  const stopEdlFallbackAnimation = useCallback(() => {
    if (edlAnimationRef.current !== null) {
      cancelAnimationFrame(edlAnimationRef.current);
      edlAnimationRef.current = null;
    }
  }, []);

  const startEdlFallbackAnimation = useCallback(() => {
    stopEdlFallbackAnimation();
    const canvas = edlCanvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    const startedAt = performance.now();

    const renderFrame = (now) => {
      if (introStore.getState().phase !== 'video') return;

      const elapsed = (now - startedAt) / 1000;
      const progress = Math.min(elapsed / CUT_AT_SECONDS, 1);
      const width = (canvas.width = window.innerWidth);
      const height = (canvas.height = window.innerHeight);
      const gradient = context.createRadialGradient(
        width * 0.5,
        height * 0.62,
        20,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.75
      );
      gradient.addColorStop(
        0,
        `rgba(${193 + progress * 45}, ${84 + progress * 35}, 34, 1)`
      );
      gradient.addColorStop(0.55, '#4a1909');
      gradient.addColorStop(1, '#090608');
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);

      const horizonY = height * (0.42 + progress * 0.24);
      context.strokeStyle = 'rgba(255, 195, 150, 0.24)';
      context.lineWidth = 1;
      for (let index = 0; index < 10; index += 1) {
        const y = horizonY + Math.pow(index / 10, 1.7) * (height - horizonY);
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(width, y);
        context.stroke();
      }

      context.strokeStyle = 'rgba(255, 217, 176, 0.55)';
      context.lineWidth = 1.5;
      context.beginPath();
      context.arc(width * 0.5, height * 0.5, 90 - progress * 32, 0, Math.PI * 2);
      context.stroke();

      const altitude = Math.max(0.02, (11.2 * (1 - progress)).toFixed(2));
      const stage =
        elapsed < 2.5
          ? 'PARACHUTE DEPLOYED'
          : elapsed < 5.2
            ? 'HEAT SHIELD SEPARATION'
            : 'SKY CRANE TERMINAL DESCENT';
      if (edlTimerRef.current) {
        edlTimerRef.current.textContent = `T+ 0${elapsed.toFixed(1)}s — ALT ${altitude} KM — ${stage}`;
      }

      if (elapsed >= CUT_AT_SECONDS) {
        introStore.setPhase('transition');
        return;
      }
      edlAnimationRef.current = requestAnimationFrame(renderFrame);
    };

    edlAnimationRef.current = requestAnimationFrame(renderFrame);
  }, [stopEdlFallbackAnimation]);

  useEffect(() => {
    reduceMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setHasVisited(localStorage.getItem('ares_intro_seen') === '1');

    const webgl = isWebGLAvailable();
    setWebglAvailable(webgl);
    if (webgl) {
      try {
        sceneControllerRef.current = new MarsSceneController(
          canvasRef.current,
          () => {
            openMarsTrekView(introStore.getState().descentTarget || 'perseverance');
          },
          tooltipRef.current
        );
      } catch (error) {
        console.error('Failed to initialize the Mars scene:', error);
        setWebglAvailable(false);
      }
    }

    try {
      mapControllerRef.current = new MarsSurfaceMapController(
        mapElementRef.current,
        (nextState) => setMapState((previous) => ({ ...previous, ...nextState }))
      );
    } catch (error) {
      console.error('Failed to initialize the Mars surface map:', error);
      setMapAvailable(false);
      setMapState((previous) => ({
        ...previous,
        status: 'The interactive map library did not load. Check your connection and reload the page.',
      }));
    }

    if (reduceMotion.current) {
      setVideoVisible(false);
      sceneControllerRef.current?.setOrbitImmediate();
      introStore.setPhase('orbit');
    } else {
      localStorage.setItem('ares_intro_seen', '1');
    }

    return () => {
      stopEdlFallbackAnimation();
      transitionTimersRef.current.forEach((timer) => window.clearTimeout(timer));
      sceneControllerRef.current?.dispose();
      mapControllerRef.current?.destroy();
      sceneControllerRef.current = null;
      mapControllerRef.current = null;
    };
  }, [openMarsTrekView, stopEdlFallbackAnimation]);

  useEffect(() => {
    if (phase === 'video') {
      transitionStartedRef.current = false;
      enteringTargetRef.current = null;
      transitionTimersRef.current.forEach((timer) => window.clearTimeout(timer));
      transitionTimersRef.current = [];
      setVideoVisible(true);
      setVideoFading(false);
      setMapOpen(false);
      setDiveDetails('');
      closeMarsTrekView();
      if (hasRealVideo && videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => setShowPlayButton(true));
      } else if (!reduceMotion.current) {
        startEdlFallbackAnimation();
      }
      return;
    }

    if (phase === 'transition') {
      if (transitionStartedRef.current) return;
      transitionStartedRef.current = true;
      stopEdlFallbackAnimation();
      setVideoFading(true);
      setDustFlashVisible(true);
      announce('Landing sequence complete. Pulling back to Mars orbital view.');
      transitionTimersRef.current.push(
        window.setTimeout(() => setDustFlashVisible(false), 650),
        window.setTimeout(() => setVideoVisible(false), 1000)
      );
      if (sceneControllerRef.current) {
        sceneControllerRef.current.playPullBackTransition(reduceMotion.current);
      } else {
        introStore.setPhase('orbit');
      }
      return;
    }

    if (phase === 'orbit') {
      enteringTargetRef.current = null;
      setVideoVisible(false);
      setMapOpen(false);
      closeMarsTrekView();
      announce('Interactive Mars orbit view active. Select Phobos, Deimos, or click Mars to enter.');
      return;
    }

    if (phase === 'moonFact' && selectedMoon) {
      if (previousMoonRef.current !== selectedMoon) {
        setCurrentFactIndex(0);
        sceneControllerRef.current?.focusOnMoon(selectedMoon);
      }
      previousMoonRef.current = selectedMoon;
      const moon = MOONS.find((item) => item.id === selectedMoon);
      if (moon) announce(`${moon.name} selected. ${moon.facts[currentFactIndex]}`);
      return;
    }

    if (phase === 'entering') {
      const site = MARS_SITES[descentTarget] || MARS_SITES.gale;
      if (enteringTargetRef.current === site.id) return;
      enteringTargetRef.current = site.id;
      setMapOpen(false);
      closeMarsTrekView();
      setDiveDetails(site.waypoints[0].summary);
      announce(`Diving toward ${site.title}.`);
      if (sceneControllerRef.current) {
        sceneControllerRef.current.playDiveTransition(reduceMotion.current);
      } else {
        openMarsTrekView(site.id);
      }
    }
  }, [
    announce,
    closeMarsTrekView,
    currentFactIndex,
    descentTarget,
    hasRealVideo,
    openMarsTrekView,
    phase,
    selectedMoon,
    startEdlFallbackAnimation,
    stopEdlFallbackAnimation,
  ]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      if (mapOpen) {
        closeMarsTrekView();
        sceneControllerRef.current?.setOrbitImmediate();
        introStore.setPhase('orbit');
      } else if (introStore.getState().phase === 'moonFact') {
        setCurrentFactIndex(0);
        introStore.selectMoon(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [closeMarsTrekView, mapOpen]);

  const selectMoon = (moonId) => {
    if (introStore.getState().phase === 'video') introStore.setPhase('orbit');
    introStore.selectMoon(moonId);
  };

  const enterMars = () => {
    if (introStore.getState().phase === 'video') {
      setVideoVisible(false);
      sceneControllerRef.current?.setOrbitImmediate();
    }
    introStore.setPhase('entering');
  };

  const replayIntro = () => {
    closeMarsTrekView();
    sceneControllerRef.current?.resetToStart();
    introStore.setPhase('video');
  };

  const closeFactCard = () => {
    setCurrentFactIndex(0);
    previousMoonRef.current = null;
    introStore.selectMoon(null);
  };

  const nextFact = () => {
    if (!selectedMoonData) return;
    setCurrentFactIndex((index) => (index + 1) % selectedMoonData.facts.length);
  };

  const selectWaypoint = (index, flyTo = true) => {
    mapControllerRef.current?.selectWaypoint(index, flyTo);
  };

  const handleVideoLoaded = () => {
    setHasRealVideo(true);
    setVideoFailed(false);
    stopEdlFallbackAnimation();
  };

  const handleVideoError = () => {
    setHasRealVideo(false);
    setVideoFailed(true);
    if (introStore.getState().phase === 'video') startEdlFallbackAnimation();
  };

  const handleVideoTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || introStore.getState().phase !== 'video') return;
    if (edlTimerRef.current) {
      edlTimerRef.current.textContent = `T+ 0${video.currentTime.toFixed(1)}s — DESCENT FEED`;
    }
    if (video.currentTime >= CUT_AT_SECONDS) introStore.setPhase('transition');
  };

  const playVideo = () => {
    videoRef.current?.play().then(() => setShowPlayButton(false)).catch((error) => {
      console.error('Unable to play the landing video:', error);
      setShowPlayButton(true);
    });
  };

  return (
    <div className="app-shell">
      <canvas
        id="mars-canvas"
        ref={canvasRef}
        aria-label="Interactive 3D view of Mars and its moons Phobos and Deimos"
        className={!webglAvailable ? 'hidden' : ''}
      />

      <div
        ref={tooltipRef}
        id="surface-marker-tooltip"
        className="surface-marker-tooltip hidden"
        role="tooltip"
        aria-hidden="true"
      >
        <span className="fact-kicker" />
        <h2 />
        <p />
      </div>

      {!webglAvailable && (
        <div className="webgl-fallback" role="region" aria-label="ARES Static Fallback View">
          <div className="fallback-mars-art" aria-hidden="true" />
          <div className="fallback-content">
            <span className="mission-badge">MARS SURFACE OPERATIONS</span>
            <h1>ARES</h1>
            <p>
              Astronaut Routing and Environment Survival — WebGL is unavailable on this device.
            </p>
            <div className="fallback-actions">
              <button type="button" className="hud-btn" onClick={() => selectMoon('phobos')}>
                Phobos Facts
              </button>
              <button type="button" className="hud-btn" onClick={() => selectMoon('deimos')}>
                Deimos Facts
              </button>
              <button
                type="button"
                className="hud-btn primary"
                onClick={() => openMarsTrekView(introStore.getState().descentTarget || 'gale')}
              >
                Enter Mars (Gale Crater)
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="hud-header" id="hud-header">
        <div className="brand-lockup">
          <span className="status-dot" id="telemetry-dot" />
          <span className="brand-code">ARES // NAV-01</span>
          <span className="phase-tag">{PHASE_LABELS[phase] || 'ORBITAL OVERVIEW'}</span>
        </div>
        <nav className="hud-nav" aria-label="Orbital Targets">
          <button
            type="button"
            className={`nav-chip${hasVisited ? '' : ' hidden'}`}
            title="Replay landing sequence"
            onClick={replayIntro}
          >
            Replay Intro
          </button>
          <button
            type="button"
            className={`nav-chip${selectedMoon === 'phobos' ? ' active' : ''}`}
            onClick={() => selectMoon('phobos')}
          >
            Phobos
          </button>
          <button
            type="button"
            className={`nav-chip${selectedMoon === 'deimos' ? ' active' : ''}`}
            onClick={() => selectMoon('deimos')}
          >
            Deimos
          </button>
          <button type="button" className="nav-chip accent" onClick={enterMars}>
            Enter Mars
          </button>
        </nav>
      </header>

      <main className={`orbit-overlay${phase === 'orbit' ? '' : ' hidden'}`}>
        <div className="hero-copy">
          <p className="eyebrow">ASTRONAUT RESEARCH AND ENVIRONMENT SURVIVAL</p>
          <h1 className="hero-title">ARES</h1>
          <p className="hero-hint">Click a moon for facts. Click Mars to enter.</p>
        </div>
      </main>

      <aside
        className={`fact-card${phase === 'moonFact' && selectedMoonData ? '' : ' hidden'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="fact-moon-name"
        tabIndex="-1"
      >
        <div className="fact-card-header">
          <div>
            <span className="fact-kicker">{selectedMoonData?.subtitle}</span>
            <h2 id="fact-moon-name">{selectedMoonData?.name}</h2>
          </div>
          <button
            type="button"
            className="close-btn"
            aria-label="Close fact card"
            onClick={closeFactCard}
          >
            &times;
          </button>
        </div>
        <p className="fact-body">{currentFact}</p>
        <div className="fact-footer">
          <button type="button" className="hud-btn small" onClick={nextFact}>
            Next fact
          </button>
          <small className="fact-counter">
            {selectedMoonData ? `${currentFactIndex + 1} / ${selectedMoonData.facts.length}` : ''}
          </small>
        </div>
      </aside>

      <div className={`entering-overlay${phase === 'entering' ? '' : ' hidden'}`} aria-live="polite">
        <div className="dive-reticle">
          <span className="dive-label">
            {MARS_SITES[descentTarget]?.id.toUpperCase() || 'GALE'} LANDING SITE
          </span>
          <strong className="dive-target">
            TARGET: {MARS_SITES[descentTarget]?.title.toUpperCase() || MARS_SITES.gale.title.toUpperCase()}
          </strong>
          <p className={`dive-details${diveDetails ? '' : ' hidden'}`}>{diveDetails}</p>
        </div>
      </div>

      <section
        className={`mars-trek-view${mapOpen ? ' is-open' : ' hidden'}`}
        aria-label="Interactive Mars surface map"
      >
        <header className="trek-toolbar">
          <div className="trek-site-heading">
            <span className="trek-kicker">{activeSite?.kicker}</span>
            <h1>{activeSite?.title}</h1>
          </div>
          <nav className="trek-site-switcher" aria-label="Landing sites">
            {[
              ['perseverance', 'Perseverance'],
              ['gale', 'Curiosity / Gale'],
              ['insight', 'InSight'],
            ].map(([siteId, label]) => (
              <button
                key={siteId}
                type="button"
                className={activeSite?.id === siteId ? 'is-active' : ''}
                aria-pressed={activeSite?.id === siteId}
                onClick={() => mapControllerRef.current?.loadSite(siteId)}
              >
                {label}
              </button>
            ))}
          </nav>
          <div className="trek-toolbar-actions">
            <button
              type="button"
              className={`trek-toolbar-button${activeSite?.localTileLayer ? '' : ' hidden'}`}
              aria-pressed={mapState.localMosaicEnabled}
              onClick={() => mapControllerRef.current?.toggleLocalMosaic()}
            >
              Local Mosaic: {mapState.localMosaicEnabled ? 'ON' : 'OFF'}
            </button>
            <button
              type="button"
              className="trek-toolbar-button"
              aria-pressed={mapState.molaEnabled}
              onClick={() => mapControllerRef.current?.toggleMola()}
            >
              MOLA Elevation: {mapState.molaEnabled ? 'ON' : 'OFF'}
            </button>
            <button type="button" className="trek-toolbar-button" onClick={() => {
              closeMarsTrekView();
              sceneControllerRef.current?.setOrbitImmediate();
              introStore.setPhase('orbit');
            }}>
              Return to Orbit
            </button>
          </div>
        </header>
        <div className="trek-workspace">
          <div
            ref={mapElementRef}
            className="mars-leaflet-map"
            role="application"
            aria-label="Interactive Mars mission map"
          >
            {mapState.status && (
              <p className="trek-map-status" role="status">{mapState.status}</p>
            )}
          </div>
          <aside className="site-info-drawer" aria-labelledby="drawer-title" aria-live="polite">
            {activeWaypoint && (
              <>
                <p className="drawer-sol">
                  SOL {activeWaypoint.sol} · {activeWaypoint.date} · {activeWaypoint.phase}
                </p>
                <h2 id="drawer-title">{activeWaypoint.title}</h2>
                <p className="drawer-coords">{formatCoordinates(activeWaypoint.coordinates)}</p>
                <dl className="drawer-telemetry">
                  <div>
                    <dt>MOLA elevation (DEM reference)</dt>
                    <dd>{activeWaypoint.elevation}</dd>
                  </div>
                  <div>
                    <dt>Geology</dt>
                    <dd>{activeWaypoint.geology}</dd>
                  </div>
                  <div>
                    <dt>Mission equipment</dt>
                    <dd>{activeWaypoint.instruments.join(' · ')}</dd>
                  </div>
                </dl>
                <p className="drawer-summary">{activeWaypoint.summary}</p>
                <section className="drawer-waypoints" aria-labelledby="drawer-waypoint-heading">
                  <h3 id="drawer-waypoint-heading">Selected mission POIs</h3>
                  <p className="drawer-waypoint-note">
                    {activeSite.traverseLayerName
                      ? 'NASA traverse overlay shown where available. POIs are selected campaign markers, not every drive endpoint; some mark a broader area rather than an exact stop. Elevations are nearest-cell MOLA DEM samples (~463 m at the equator).'
                      : 'Numbered markers show mission phases at the lander, not a rover traverse. Elevations are nearest-cell MOLA DEM samples (~463 m at the equator).'}
                  </p>
                  <div className="drawer-waypoint-list">
                    {activeSite.waypoints.map((waypoint, index) => (
                      <button
                        key={waypoint.id}
                        type="button"
                        className={`drawer-waypoint-button${mapState.waypointIndex === index ? ' is-active' : ''}`}
                        aria-pressed={mapState.waypointIndex === index}
                        onClick={() => selectWaypoint(index)}
                      >
                        <span className="drawer-waypoint-title">{waypoint.title}</span>
                        <span className="drawer-waypoint-phase">
                          SOL {waypoint.sol} · {waypoint.date} · {waypoint.phase}
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              </>
            )}
            {!activeSite && !mapAvailable && (
              <p className="drawer-summary">
                Map services could not be initialized. Reload the page to try again.
              </p>
            )}
          </aside>
        </div>
      </section>

      <div className={`video-layer${videoVisible ? '' : ' hidden'}${videoFading ? ' fading-out' : ''}`}>
        <video
          ref={videoRef}
          className={videoFailed ? 'hidden' : ''}
          autoPlay
          muted
          playsInline
          preload="auto"
          onLoadedData={handleVideoLoaded}
          onTimeUpdate={handleVideoTimeUpdate}
          onEnded={() => {
            if (introStore.getState().phase === 'video') introStore.setPhase('transition');
          }}
          onError={handleVideoError}
        >
          <source src="/INTRO.mp4" type="video/mp4" />
          <source src="./video/landing.webm" type="video/webm" />
          <source src="./video/landing.mp4" type="video/mp4" />
        </video>
        <canvas
          ref={edlCanvasRef}
          className={`edl-sim-canvas${hasRealVideo ? ' hidden' : ''}`}
          aria-hidden="true"
        />
        <div className="video-hud">
          <div className="edl-readout">
            <span className="rec-pill">EDL CAM // MARS 2020</span>
            <span ref={edlTimerRef} id="edl-timer">T+ 00.0s — HYPERSONIC ENTRY</span>
          </div>
          <div className="video-controls">
            <button
              type="button"
              className={`hud-btn${showPlayButton ? '' : ' hidden'}`}
              onClick={playVideo}
            >
              Play Intro
            </button>
            <button
              type="button"
              className="hud-btn skip-btn"
              onClick={() => introStore.setPhase('transition')}
            >
              Skip intro
            </button>
          </div>
        </div>
      </div>

      <div className={`dust-flash${dustFlashVisible ? '' : ' hidden'}`} aria-hidden="true" />
      <div className="sr-only" aria-live="polite">{announcement}</div>
      <footer className="hud-footer" id="hud-footer">
        <span>Imagery &amp; EDL: NASA / JPL-Caltech / USGS</span>
        <span>Scroll to zoom • Drag to orbit</span>
      </footer>
    </div>
  );
}

export default App;
