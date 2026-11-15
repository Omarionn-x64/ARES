import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MOONS } from './moonFacts.js';
import { introStore } from './store.js';
import { SURFACE_MARKERS } from './siteData.js';

const START_POS = { x: 0, y: 0.15, z: 1.12 };
const ORBIT_POS = { x: 0, y: 0.9, z: 5.2 };
const DIVE_POS = { x: 0, y: 0.1, z: 1.08 };
const MARS_AXIAL_TILT = (25.19 * Math.PI) / 180;

export class MarsSceneController {
  constructor(canvas, onDiveComplete) {
    this.canvas = canvas;
    this.onDiveComplete = onDiveComplete;
    this.isMobile = window.innerWidth < 768;
    this.marsHovered = false;
    this.hoveredMoonId = null;
    this.hoveredSurfaceMarkerIndex = null;
    this.surfaceMarkerTooltip = document.getElementById('surface-marker-tooltip');
    this.surfaceMarkerTooltipKicker = this.surfaceMarkerTooltip.querySelector('.fact-kicker');
    this.surfaceMarkerTooltipTitle = this.surfaceMarkerTooltip.querySelector('h2');
    this.surfaceMarkerTooltipDetails = this.surfaceMarkerTooltip.querySelector('p');
    this.surfaceMarkers = [];
    this.moonObjects = new Map();
    this.interactiveMeshes = [];
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.pointerDownPos = new THREE.Vector2();
    this.clock = new THREE.Clock();
    this.disposed = false;

    this.initRenderer();
    this.initScene();
    this.initLighting();
    this.initStars();
    this.initMars();
    this.initMoons();
    this.initControls();
    this.bindEvents();
    this.animate = this.animate.bind(this);
    this.rafId = requestAnimationFrame(this.animate);
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.01,
      200
    );
    this.camera.position.set(START_POS.x, START_POS.y, START_POS.z);
    this.camera.lookAt(0, 0, 0);
  }

  initLighting() {
    const ambient = new THREE.AmbientLight(0xffd7c2, 0.16);
    this.scene.add(ambient);

    const sunLight = new THREE.DirectionalLight(0xfff4ea, 2.35);
    sunLight.position.set(5, 2, 4);
    this.scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x7a3418, 0.28);
    rimLight.position.set(-4, -1.5, -3);
    this.scene.add(rimLight);
  }

  initStars() {
    const count = this.isMobile ? 2200 : 4000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const r = 45 + Math.random() * 90;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      const tint = 0.82 + Math.random() * 0.18;
      colors[i * 3] = tint;
      colors[i * 3 + 1] = tint * (0.92 + Math.random() * 0.08);
      colors[i * 3 + 2] = tint * (0.88 + Math.random() * 0.12);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    this.starMaterial = new THREE.PointsMaterial({
      size: 0.24,
      vertexColors: true,
      transparent: true,
      opacity: 0.25,
      sizeAttenuation: true,
    });

    this.stars = new THREE.Points(geometry, this.starMaterial);
    this.scene.add(this.stars);
  }

  initMars() {
    this.marsTiltGroup = new THREE.Group();
    this.marsTiltGroup.rotation.set(0, 0, MARS_AXIAL_TILT);
    this.scene.add(this.marsTiltGroup);

    this.marsSpinGroup = new THREE.Group();
    this.marsTiltGroup.add(this.marsSpinGroup);

    this.markerGroup = new THREE.Group();
    this.marsSpinGroup.add(this.markerGroup);

    const modelUrl = new URL('../3d model/24881_Mars_1_6792.glb', import.meta.url);
    new GLTFLoader().load(
      modelUrl.href,
      ({ scene: model }) => {
        if (this.disposed) {
          this.disposeMarsModel(model);
          return;
        }

        const bounds = new THREE.Box3().setFromObject(model);
        const size = bounds.getSize(new THREE.Vector3());
        const center = bounds.getCenter(new THREE.Vector3());
        const scale = 2 / Math.max(size.x, size.y, size.z);
        model.scale.setScalar(scale);
        model.position.copy(center).multiplyScalar(-scale);

        model.traverse((object) => {
          if (!object.isMesh) return;
          object.userData.type = 'mars';
          this.interactiveMeshes.push(object);
        });

        this.marsMesh = model;
        this.marsModel = model;
        this.marsSpinGroup.add(model);
        this.addSurfaceMarkers();
      },
      undefined,
      (error) => {
        console.error('Failed to load NASA Mars model:', error);
      }
    );

    this.atmosphereMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uOpacity: { value: 0.35 },
      },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uOpacity;
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.66 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
          gl_FragColor = vec4(1.0, 0.55, 0.35, 1.0) * intensity * uOpacity;
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });

    const atmoGeo = new THREE.SphereGeometry(1, 64, 64);
    this.atmosphereMesh = new THREE.Mesh(atmoGeo, this.atmosphereMaterial);
    this.atmosphereMesh.scale.setScalar(1.06);
    this.marsTiltGroup.add(this.atmosphereMesh);
  }

  addSurfaceMarkers() {
    if (!this.marsSpinGroup) return;

    this.markerGroup.clear();
    this.surfaceMarkers = [];

    SURFACE_MARKERS.forEach(({ lat, lon, id }, index) => {
      const latRad = (lat * Math.PI) / 180;
      const lonRad = (lon * Math.PI) / 180;
      const marker = new THREE.Group();
      const isGale = id === 'gale';
      const markerScale = isGale ? 1.32 : 1;

      const outline = new THREE.Mesh(
        new THREE.CircleGeometry(0.032 * markerScale, 24),
        new THREE.MeshBasicMaterial({
          color: 0x080808,
        })
      );
      const fill = new THREE.Mesh(
        new THREE.CircleGeometry(0.024 * markerScale, 24),
        new THREE.MeshBasicMaterial({
          color: 0xf4b000,
        })
      );

      const radius = 1.02 + index * 0.005;
      const normal = new THREE.Vector3(
        Math.cos(latRad) * Math.cos(lonRad),
        Math.sin(latRad),
        Math.cos(latRad) * Math.sin(lonRad)
      ).normalize();

      marker.position.copy(normal).multiplyScalar(radius);
      marker.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);

      outline.userData = { type: 'surfaceMarker', markerIndex: index, siteId: id };
      fill.position.z = 0.001;
      outline.renderOrder = 1;
      fill.renderOrder = 2;
      marker.add(outline, fill);

      this.markerGroup.add(marker);
      this.surfaceMarkers.push(marker);
      this.interactiveMeshes.push(outline);
    });
  }

  createPotatoGeometry(radius, seedOffset = 0) {
    const geo = new THREE.SphereGeometry(radius, 28, 28);
    const pos = geo.attributes.position;
    const v = new THREE.Vector3();

    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const dir = v.clone().normalize();
      const lump =
        1 +
        0.18 * Math.sin(dir.x * 3.1 + seedOffset) * Math.cos(dir.y * 2.4) +
        0.1 * Math.sin(dir.z * 5.2 - seedOffset);
      v.multiplyScalar(lump);
      v.x *= 1.24;
      v.y *= 0.86;
      pos.setXYZ(i, v.x, v.y, v.z);
    }

    geo.computeVertexNormals();
    return geo;
  }

  initMoons() {
    MOONS.forEach((moon, idx) => {
      const inclinationGroup = new THREE.Group();
      inclinationGroup.rotation.x = moon.inclination;
      this.scene.add(inclinationGroup);

      const ringPoints = [];
      for (let i = 0; i <= 128; i++) {
        const a = (i / 128) * Math.PI * 2;
        ringPoints.push(
          new THREE.Vector3(Math.cos(a) * moon.orbitRadius, 0, Math.sin(a) * moon.orbitRadius)
        );
      }
      const ringGeo = new THREE.BufferGeometry().setFromPoints(ringPoints);
      const ringMat = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.16,
      });
      const ringLine = new THREE.Line(ringGeo, ringMat);
      inclinationGroup.add(ringLine);

      const pivot = new THREE.Group();
      pivot.rotation.y = idx === 0 ? 0.65 : 2.4;
      inclinationGroup.add(pivot);

      const moonHolder = new THREE.Group();
      moonHolder.position.set(moon.orbitRadius, 0, 0);
      pivot.add(moonHolder);

      const mesh = new THREE.Mesh(
        this.createPotatoGeometry(moon.size, idx * 2.5),
        new THREE.MeshStandardMaterial({
          color: idx === 0 ? 0x9b8b7e : 0xb3a598,
          roughness: 0.95,
          metalness: 0.02,
        })
      );
      moonHolder.add(mesh);

      const hitTarget = new THREE.Mesh(
        new THREE.SphereGeometry(moon.size * 3.2, 16, 16),
        new THREE.MeshBasicMaterial({ visible: false })
      );
      hitTarget.userData = { type: 'moon', moonId: moon.id };
      moonHolder.add(hitTarget);
      this.interactiveMeshes.push(hitTarget);

      this.moonObjects.set(moon.id, {
        data: moon,
        pivot,
        holder: moonHolder,
        mesh,
        hitTarget,
      });
    });
  }

  initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.enablePan = false;
    this.controls.minDistance = 2.6;
    this.controls.maxDistance = 8.5;
    this.controls.minPolarAngle = Math.PI * 0.2;
    this.controls.maxPolarAngle = Math.PI * 0.8;
    this.controls.enabled = false;
  }

  setOrbitImmediate() {
    this.camera.position.set(ORBIT_POS.x, ORBIT_POS.y, ORBIT_POS.z);
    this.camera.lookAt(0, 0, 0);
    this.starMaterial.opacity = 0.95;
    this.atmosphereMaterial.uniforms.uOpacity.value = 1.0;
    this.controls.enabled = true;
    this.controls.update();
  }

  resetToStart() {
    gsap.killTweensOf(this.camera.position);
    gsap.killTweensOf(this.starMaterial);
    gsap.killTweensOf(this.atmosphereMaterial.uniforms.uOpacity);
    this.controls.enabled = false;
    this.camera.position.set(START_POS.x, START_POS.y, START_POS.z);
    this.camera.lookAt(0, 0, 0);
    this.starMaterial.opacity = 0.25;
    this.atmosphereMaterial.uniforms.uOpacity.value = 0.35;
  }

  playPullBackTransition(reduceMotion = false) {
    if (reduceMotion) {
      this.setOrbitImmediate();
      introStore.setPhase('orbit');
      return;
    }

    this.controls.enabled = false;
    const tl = gsap.timeline({
      onComplete: () => {
        this.controls.enabled = true;
        this.controls.update();
        introStore.setPhase('orbit');
      },
    });

    tl.to(
      this.camera.position,
      {
        x: ORBIT_POS.x,
        y: ORBIT_POS.y,
        z: ORBIT_POS.z,
        duration: 3.5,
        ease: 'power3.inOut',
        onUpdate: () => this.camera.lookAt(0, 0, 0),
      },
      0
    );

    tl.to(
      this.starMaterial,
      {
        opacity: 0.95,
        duration: 2.8,
        ease: 'power2.out',
      },
      0.4
    );

    tl.to(
      this.atmosphereMaterial.uniforms.uOpacity,
      {
        value: 1.0,
        duration: 2.5,
        ease: 'power2.out',
      },
      0.3
    );
  }

  focusOnMoon(moonId) {
    const moonObj = this.moonObjects.get(moonId);
    if (!moonObj) return;

    const worldPos = new THREE.Vector3();
    moonObj.holder.getWorldPosition(worldPos);

    const targetCam = worldPos
      .clone()
      .normalize()
      .multiplyScalar(moonObj.data.orbitRadius + 2.35);
    targetCam.y += 0.45;

    gsap.to(this.camera.position, {
      x: targetCam.x,
      y: targetCam.y,
      z: targetCam.z,
      duration: 1.1,
      ease: 'power2.out',
      onUpdate: () => this.camera.lookAt(0, 0, 0),
    });
  }

  playDiveTransition(reduceMotion = false) {
    this.controls.enabled = false;
    gsap.to(this.camera.position, {
      x: DIVE_POS.x,
      y: DIVE_POS.y,
      z: DIVE_POS.z,
      duration: reduceMotion ? 0.5 : 2.5,
      ease: 'power2.in',
      onUpdate: () => this.camera.lookAt(0, 0, 0),
      onComplete: () => {
        if (this.onDiveComplete) this.onDiveComplete();
      },
    });
  }

  updateSurfaceMarkerTooltip(markerIndex, event) {
    const tooltip = this.surfaceMarkerTooltip;
    const marker = SURFACE_MARKERS[markerIndex];

    if (!marker || !marker.title || !event) {
      tooltip.classList.add('hidden');
      tooltip.setAttribute('aria-hidden', 'true');
      return;
    }

    this.surfaceMarkerTooltipKicker.textContent = marker.kicker;
    this.surfaceMarkerTooltipTitle.textContent = marker.title;
    this.surfaceMarkerTooltipDetails.textContent = marker.details;
    tooltip.classList.remove('hidden');
    tooltip.setAttribute('aria-hidden', 'false');

    const gap = 14;
    const margin = 12;
    const bounds = tooltip.getBoundingClientRect();
    let left = event.clientX + gap;
    let top = event.clientY + gap;

    if (left + bounds.width > window.innerWidth - margin) {
      left = event.clientX - bounds.width - gap;
    }
    if (top + bounds.height > window.innerHeight - margin) {
      top = event.clientY - bounds.height - gap;
    }

    tooltip.style.left = `${Math.max(margin, left)}px`;
    tooltip.style.top = `${Math.max(margin, top)}px`;
  }

  bindEvents() {
    this.onResize = () => {
      if (this.disposed) return;
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    };

    this.onPointerMove = (e) => {
      const { phase } = introStore.getState();
      if (phase !== 'orbit' && phase !== 'moonFact') {
        this.marsHovered = false;
        this.hoveredMoonId = null;
        this.hoveredSurfaceMarkerIndex = null;
        this.updateSurfaceMarkerTooltip(null);
        document.body.style.cursor = 'auto';
        return;
      }

      this.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;

      this.raycaster.setFromCamera(this.pointer, this.camera);
      const hits = this.raycaster.intersectObjects(this.interactiveMeshes, false);

      if (hits.length > 0) {
        const hitData = hits[0].object.userData;
        if (hitData.type === 'moon') {
          this.hoveredMoonId = hitData.moonId;
          this.hoveredSurfaceMarkerIndex = null;
          this.marsHovered = false;
          this.updateSurfaceMarkerTooltip(null);
          document.body.style.cursor = 'pointer';
          return;
        }
        if (hitData.type === 'surfaceMarker') {
          this.hoveredSurfaceMarkerIndex = hitData.markerIndex;
          this.hoveredMoonId = null;
          this.marsHovered = false;
          this.updateSurfaceMarkerTooltip(hitData.markerIndex, e);
          document.body.style.cursor = 'pointer';
          return;
        }
        if (hitData.type === 'mars' && phase === 'orbit') {
          this.marsHovered = true;
          this.hoveredMoonId = null;
          this.hoveredSurfaceMarkerIndex = null;
          this.updateSurfaceMarkerTooltip(null);
          document.body.style.cursor = 'pointer';
          return;
        }
      }

      this.marsHovered = false;
      this.hoveredMoonId = null;
      this.hoveredSurfaceMarkerIndex = null;
      this.updateSurfaceMarkerTooltip(null);
      document.body.style.cursor = 'auto';
    };

    this.onPointerDown = (e) => {
      this.pointerDownPos.set(e.clientX, e.clientY);
    };

    this.onPointerUp = (e) => {
      const dist = Math.hypot(
        e.clientX - this.pointerDownPos.x,
        e.clientY - this.pointerDownPos.y
      );
      if (dist > 6) return;

      const { phase } = introStore.getState();
      if (phase !== 'orbit' && phase !== 'moonFact') return;

      this.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
      this.raycaster.setFromCamera(this.pointer, this.camera);

      const hits = this.raycaster.intersectObjects(this.interactiveMeshes, false);
      if (hits.length === 0) return;

      const hitData = hits[0].object.userData;

      if (hitData.type === 'moon') {
        introStore.selectMoon(hitData.moonId);
        return;
      }

      if (hitData.type === 'surfaceMarker' && phase === 'orbit') {
        const marker = SURFACE_MARKERS[hitData.markerIndex];
        if (marker) introStore.setPhase('entering', marker.id);
        return;
      }

      if (hitData.type === 'mars' && phase === 'orbit') {
        introStore.setPhase('entering');
      }
    };

    window.addEventListener('resize', this.onResize);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointerup', this.onPointerUp);
  }

  animate() {
    this.rafId = requestAnimationFrame(this.animate);

    const { phase } = introStore.getState();
    if (
      this.marsSpinGroup &&
      phase !== 'video' &&
      this.hoveredSurfaceMarkerIndex === null
    ) {
      this.marsSpinGroup.rotation.y += 0.0022;
    }

    if (this.controls && this.controls.enabled) {
      this.controls.update();
    }

    this.renderer.render(this.scene, this.camera);
  }

  disposeMarsModel(model) {
    model.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => material.dispose());
      }
    });
  }
}
