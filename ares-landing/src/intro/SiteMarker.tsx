import * as THREE from 'three';
import type { LandingSite, SiteId } from './sites';

export interface SiteMarkerHandle {
  group: THREE.Group;
  hitMesh: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>;
  pin: THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial>;
  ring: THREE.Mesh<THREE.TorusGeometry, THREE.MeshBasicMaterial>;
  label: THREE.Sprite;
  leader: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>;
  setHighlighted: (highlighted: boolean) => void;
  updateLabelScale: (cameraDistance: number) => void;
  updatePulse: (time: number, reducedMotion: boolean, cameraDistance: number) => void;
}

const LABEL_OFFSETS: Record<SiteId, [number, number]> = {
  gale: [-0.85, -0.12],
  jezero: [0.85, 0.12],
  insight: [0.85, 0.12],
};

export function surfaceDirection(latitude: number, longitude: number): THREE.Vector3 {
  const latitudeRadians = THREE.MathUtils.degToRad(latitude);
  const longitudeRadians = THREE.MathUtils.degToRad(longitude);
  return new THREE.Vector3(
    Math.cos(latitudeRadians) * Math.cos(longitudeRadians),
    Math.sin(latitudeRadians),
    Math.cos(latitudeRadians) * Math.sin(longitudeRadians)
  ).normalize();
}

function createLabelTexture(site: LandingSite): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 96;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Unable to create a landing site label.');

  context.fillStyle = 'rgba(8, 11, 17, 0.94)';
  context.strokeStyle = site.accent;
  context.lineWidth = 3;
  context.beginPath();
  context.roundRect(2, 2, 508, 92, 18);
  context.fill();
  context.stroke();
  context.font = '600 31px "JetBrains Mono", monospace';
  context.textBaseline = 'middle';
  context.fillStyle = '#f6f4f0';
  context.fillText(site.displayName.toUpperCase(), 24, 48, 464);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createSiteMarker(site: LandingSite): SiteMarkerHandle {
  const normal = surfaceDirection(site.latitude, site.longitude);
  const group = new THREE.Group();
  group.name = `landing-site-${site.id}`;
  group.position.copy(normal).multiplyScalar(1.012);
  group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
  group.userData.siteId = site.id;

  const color = new THREE.Color(site.accent);
  const pin = new THREE.Mesh(
    new THREE.SphereGeometry(0.018, 16, 12),
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 1.15,
      roughness: 0.35,
    })
  );
  pin.position.z = 0.013;
  group.add(pin);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.031, 0.0035, 8, 28),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.82 })
  );
  ring.position.z = 0.012;
  group.add(ring);

  const hitMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.064, 12, 10),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  hitMesh.userData = { type: 'siteMarker', siteId: site.id };
  group.add(hitMesh);

  const [offsetX, offsetY] = LABEL_OFFSETS[site.id];
  const label = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: createLabelTexture(site),
      transparent: true,
      depthTest: true,
      depthWrite: false,
    })
  );
  label.scale.set(0.9, 0.17, 1);
  label.position.set(offsetX, 0.12 + offsetY, 0.035);
  label.visible = false;
  group.add(label);

  const leaderGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0.025),
    new THREE.Vector3(offsetX * 0.72, 0.12 + offsetY, 0.035),
  ]);
  const leader = new THREE.Line(
    leaderGeometry,
    new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.8, depthWrite: false })
  );
  leader.visible = false;
  group.add(leader);

  const setHighlighted = (highlighted: boolean) => {
    pin.material.emissiveIntensity = highlighted ? 2 : 1.15;
    ring.material.opacity = highlighted ? 1 : 0.72;
    label.visible = highlighted;
    leader.visible = highlighted;
  };

  const updatePulse = (time: number, reducedMotion: boolean, cameraDistance: number) => {
    const markerScale = THREE.MathUtils.clamp(cameraDistance / 3.6, 0.08, 1);
    const pulse = reducedMotion ? 1 : 1 + (Math.sin(time * 2.4) + 1) * 0.09;
    pin.scale.setScalar(markerScale);
    ring.scale.setScalar(markerScale * pulse);
  };

  const updateLabelScale = (cameraDistance: number) => {
    const scale = THREE.MathUtils.clamp(cameraDistance / 3.6, 0.08, 1);
    label.scale.set(0.9 * scale, 0.17 * scale, 1);
    label.position.set(offsetX * scale, (0.12 + offsetY) * scale, 0.035 * scale);
    const leaderPositions = leader.geometry.attributes.position;
    leaderPositions.setXYZ(0, 0, 0, 0.025 * scale);
    leaderPositions.setXYZ(
      1,
      offsetX * 0.72 * scale,
      (0.12 + offsetY) * scale,
      0.035 * scale
    );
    leaderPositions.needsUpdate = true;
    leader.geometry.computeBoundingSphere();
  };

  return {
    group,
    hitMesh,
    pin,
    ring,
    label,
    leader,
    setHighlighted,
    updateLabelScale,
    updatePulse,
  };
}
