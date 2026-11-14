import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MOONS } from './moonFacts.js';
import { introStore } from './store.js';
import { createMarsTextures } from './textures.js';

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

    // Subtle rim light to separate dark hemisphere from deep space
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
    const segments = this.isMobile ? 64 : 128;
    const { colorTexture, bumpTexture } = createMarsTextures(this.isMobile);
    this.marsTextures = [colorTexture, bumpTexture];

    this.marsTiltGroup = new THREE.Group();
    this.marsTiltGroup.rotation.set(0, 0, MARS_AXIAL_TILT);
    this.scene.add(this.marsTiltGroup);

    this.marsSpinGroup = new THREE.Group();
    this.marsTiltGroup.add(this.marsSpinGroup);

    const marsGeo = new THREE.SphereGeometry(1, segments, segments);
    const marsMat = new THREE.MeshStandardMaterial({
      map: colorTexture,
      bumpMap: bumpTexture,
      bumpScale: 0.022,
      roughness: 0.96,
      metalness: 0.0,
    });

    this.marsMesh = new THREE.Mesh(marsGeo, marsMat);
    this.marsMesh.userData = { type: 'mars' };
    this.marsSpinGroup.add(this.marsMesh);
    this.interactiveMeshes.push(this.marsMesh);

    // Fresnel atmosphere glow shader
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

  createPotatoGeometry(radius, seedOffset = 0) {
    const geo = new THREE.SphereGeometry(radius, 28, 28);
    const pos = geo.attributes.position;
    const v = new THREE.Vector3();

    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const dir = v.clone().normalize();
      // Elongated asteroid-like proportions + crater indentations
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

      // Subtle orbital path ring
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

      // Orbit pivot
      const pivot = new THREE.Group();
      pivot.rotation.y = idx === 0 ? 0.65 : 2.4;
      inclinationGroup.add(pivot);

      const moonHolder = new THREE.Group();
      moonHolder.position.set(moon.orbitRadius, 0, 0);
      pivot.add(moonHolder);

      // Irregular potato-shaped moon mesh
      const mesh = new THREE.Mesh(
        this.createPotatoGeometry(moon.size, idx * 2.5),
        new THREE.MeshStandardMaterial({
          color: idx === 0 ? 0x9b8b7e : 0xb3a598,
          roughness: 0.95,
          metalness: 0.02,
        })
      );
      moonHolder.add(mesh);

      // 3x invisible hit target for easy desktop/touch selection
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

    // Gently frame Mars + selected moon
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
          this.marsHovered = false;
          document.body.style.cursor = 'pointer';
          return;
        }
        if (hitData.type === 'mars' && phase === 'orbit') {
          this.marsHovered = true;
          this.hoveredMoonId = null;
          document.body.style.cursor = 'pointer';
          return;
        }
      }

      this.marsHovered = false;
      this.hoveredMoonId = null;
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
      // Ignore camera orbit drags
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
      } else if (hitData.type === 'mars' && phase === 'orbit') {
        introStore.setPhase('entering');
      }
    };

    window.addEventListener('resize', this.onResize);
    this.canvas.addEventListener('pointermove', this.onPointerMove);
    this.canvas.addEventListener('pointerdown', this.onPointerDown);
    this.canvas.addEventListener('pointerup', this.onPointerUp);
  }

  animate() {
    if (this.disposed) return;
    this.rafId = requestAnimationFrame(this.animate);

    const dt = Math.min(this.clock.getDelta(), 0.05);
    const { phase, selectedMoon } = introStore.getState();

    // Rotate Mars (slower on hover to invite click)
    const spinRate = this.marsHovered ? 0.02 : 0.06;
    this.marsSpinGroup.rotation.y += dt * spinRate;

    // Orbit and scale moons
    this.moonObjects.forEach((moonObj, id) => {
      const paused = phase === 'moonFact' && selectedMoon === id;
      if (!paused) {
        moonObj.pivot.rotation.y += dt * moonObj.data.speed;
      }
      moonObj.mesh.rotation.y += dt * 0.25;

      const isHighlighted = this.hoveredMoonId === id || selectedMoon === id;
      const targetScale = isHighlighted ? 1.45 : 1.0;
      moonObj.mesh.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.14);
    });

    if (this.controls.enabled) {
      this.controls.update();
    }

    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.rafId);
    window.removeEventListener('resize', this.onResize);
    this.canvas.removeEventListener('pointermove', this.onPointerMove);
    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    this.canvas.removeEventListener('pointerup', this.onPointerUp);
    this.marsTextures.forEach((t) => t.dispose());
    this.renderer.dispose();
  }
}
