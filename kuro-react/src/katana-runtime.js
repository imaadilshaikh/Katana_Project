
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js";

const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;
gsap.registerPlugin(ScrollTrigger);

const canvas = document.querySelector("#webgl");
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0b0a09, 0.055);

const camera = new THREE.PerspectiveCamera(32, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 0.1, 11);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const world = new THREE.Group();
scene.add(world);

const ink = new THREE.MeshStandardMaterial({ color: 0x11100f, roughness: 0.42, metalness: 0.15 });
const blackLacquer = new THREE.MeshPhysicalMaterial({ color: 0x080808, roughness: 0.22, metalness: 0.08, clearcoat: 1, clearcoatRoughness: 0.14 });
const steel = new THREE.MeshPhysicalMaterial({
  color: 0xbfc4c2,
  metalness: 1,
  roughness: 0.2,
  clearcoat: 0.65,
  clearcoatRoughness: 0.12,
  envMapIntensity: 1.4,
  side: THREE.DoubleSide,
});
steel.emissive.set(0x000000);
steel.emissiveIntensity = 0;
const edgeSteel = new THREE.MeshPhysicalMaterial({ color: 0xe8ece7, metalness: 1, roughness: 0.08, clearcoat: 1 });
edgeSteel.emissive.set(0x000000);
edgeSteel.emissiveIntensity = 0;
const bronze = new THREE.MeshStandardMaterial({ color: 0x7f653b, metalness: 0.86, roughness: 0.3 });
const wrapMat = new THREE.MeshStandardMaterial({ color: 0x241914, roughness: 0.82 });
const rayMat = new THREE.MeshBasicMaterial({ color: 0xcfc3a8, transparent: true, opacity: 0.75 });
const red = new THREE.MeshStandardMaterial({ color: 0x7d1d15, roughness: 0.65 });

function roundedShape(width, height, radius) {
  const s = new THREE.Shape();
  const x = -width / 2, y = -height / 2;
  s.moveTo(x + radius, y);
  s.lineTo(x + width - radius, y); s.quadraticCurveTo(x + width, y, x + width, y + radius);
  s.lineTo(x + width, y + height - radius); s.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  s.lineTo(x + radius, y + height); s.quadraticCurveTo(x, y + height, x, y + height - radius);
  s.lineTo(x, y + radius); s.quadraticCurveTo(x, y, x + radius, y);
  return s;
}

function extrude(shape, depth, material, bevel = 0.03) {
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize: bevel,
    bevelThickness: bevel,
  });
  geometry.center();
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function makeBlade() {
  const group = new THREE.Group();
  const shape = new THREE.Shape();
  shape.moveTo(-0.135, -2.6);
  shape.bezierCurveTo(-0.15, -1.2, -0.12, 1.45, -0.03, 2.5);
  shape.bezierCurveTo(0.0, 2.77, 0.11, 2.9, 0.18, 3.02);
  shape.bezierCurveTo(0.19, 2.0, 0.18, -0.8, 0.14, -2.6);
  shape.closePath();
  const blade = extrude(shape, 0.075, steel, 0.018);
  blade.name = "blade";
  group.add(blade);

  const edgeShape = new THREE.Shape();
  edgeShape.moveTo(0.09, -2.55);
  edgeShape.bezierCurveTo(0.13, -0.8, 0.145, 1.9, 0.16, 2.82);
  edgeShape.bezierCurveTo(0.17, 2.94, 0.18, 3.0, 0.18, 3.02);
  edgeShape.bezierCurveTo(0.135, 2.91, 0.055, 2.79, 0.01, 2.55);
  edgeShape.bezierCurveTo(0.075, 1.35, 0.07, -1.1, 0.05, -2.55);
  edgeShape.closePath();
  const edge = extrude(edgeShape, 0.082, edgeSteel, 0.006);
  edge.name = "edge";
  group.add(edge);

  const points = [];
  for (let i = 0; i <= 64; i++) {
    const t = i / 64;
    const y = -2.38 + t * 5.12;
    const x = 0.035 + Math.sin(t * Math.PI * 8) * 0.025 + t * 0.05;
    points.push(new THREE.Vector3(x, y, 0.087));
  }
  const hamon = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 96, 0.009, 5, false),
    new THREE.MeshBasicMaterial({ color: 0xf3ead4, transparent: true, opacity: 0.52 })
  );
  hamon.name = "hamon";
  group.add(hamon);
  return group;
}

function makeTsuba() {
  const group = new THREE.Group();
  const outer = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.072, 10, 48), bronze);
  outer.scale.y = 0.8;
  outer.rotation.x = Math.PI / 2;
  group.add(outer);
  for (let i = 0; i < 4; i++) {
    const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.055, 0.09), bronze);
    spoke.rotation.z = i * Math.PI / 4;
    spoke.castShadow = true;
    group.add(spoke);
  }
  const center = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.13, 32), bronze);
  center.rotation.x = Math.PI / 2;
  group.add(center);
  return group;
}

function makeHandle() {
  const group = new THREE.Group();
  const core = extrude(roundedShape(0.37, 1.68, 0.16), 0.19, rayMat, 0.025);
  group.add(core);
  for (let i = 0; i < 11; i++) {
    const y = -0.73 + i * 0.145;
    const a = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.065, 0.235), wrapMat);
    a.position.y = y;
    a.rotation.z = i % 2 ? 0.58 : -0.58;
    a.castShadow = true;
    group.add(a);
  }
  const pommel = extrude(roundedShape(0.43, 0.2, 0.08), 0.23, bronze, 0.018);
  pommel.position.y = -0.91;
  group.add(pommel);
  const mekugi = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.27, 16), red);
  mekugi.position.set(0, 0.28, 0);
  mekugi.rotation.x = Math.PI / 2;
  group.add(mekugi);
  return group;
}

function makeSword() {
  const group = new THREE.Group();
  const blade = makeBlade();
  blade.position.y = 1.38;
  group.add(blade);

  const habaki = extrude(roundedShape(0.34, 0.31, 0.035), 0.14, bronze, 0.015);
  habaki.position.y = -1.33;
  group.add(habaki);

  const tsuba = makeTsuba();
  tsuba.position.y = -1.58;
  group.add(tsuba);

  const handle = makeHandle();
  handle.position.y = -2.42;
  group.add(handle);
  return group;
}

function makeSaya() {
  const group = new THREE.Group();
  const sayaShape = new THREE.Shape();
  sayaShape.moveTo(-0.22, -3.02);
  sayaShape.bezierCurveTo(-0.24, -1.3, -0.22, 1.55, -0.13, 2.63);
  sayaShape.quadraticCurveTo(-0.07, 2.98, 0.02, 3.12);
  sayaShape.quadraticCurveTo(0.2, 2.91, 0.27, 2.6);
  sayaShape.bezierCurveTo(0.25, 1.3, 0.24, -1.45, 0.22, -3.02);
  sayaShape.closePath();
  const scabbard = extrude(sayaShape, 0.2, blackLacquer, 0.035);
  group.add(scabbard);
  const mouth = extrude(roundedShape(0.49, 0.2, 0.07), 0.22, bronze, 0.018);
  mouth.position.y = -3.0;
  group.add(mouth);
  const cord = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.035, 8, 28), red);
  cord.position.y = -2.15;
  cord.rotation.x = Math.PI / 2;
  cord.scale.y = 0.65;
  group.add(cord);
  const kojiri = extrude(roundedShape(0.42, 0.16, 0.07), 0.2, bronze, 0.014);
  kojiri.position.y = 3.0;
  group.add(kojiri);
  return group;
}

const sword = makeSword();
sword.rotation.z = -0.18;
sword.rotation.y = -0.18;
sword.position.set(0.6, 0, 0);
world.add(sword);

const sayaSeated = { x: 0.6, y: 1.42, z: 0.16 };
const sayaDrawn = { x: 1.59, y: 6.84, z: 0.16 };
const saya = makeSaya();
saya.position.set(sayaSeated.x, sayaSeated.y, sayaSeated.z);
saya.rotation.z = -0.18;
saya.rotation.y = -0.18;
world.add(saya);

const energyGroup = new THREE.Group();
const energyCoreMaterial = new THREE.MeshBasicMaterial({ color: 0xc8f4ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
const energyCore = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.055, 5.55, 8), energyCoreMaterial);
energyCore.position.set(0.08, 1.58, 0.23);
energyGroup.add(energyCore);

const electricMaterials = [];
const energyArcs = [];
for (let arcIndex = 0; arcIndex < 4; arcIndex++) {
  const arcPoints = [];
  for (let pointIndex = 0; pointIndex <= 20; pointIndex++) {
    const t = pointIndex / 20;
    const y = -1.17 + t * 5.55;
    const envelope = Math.sin(t * Math.PI);
    const x = 0.08 + Math.sin(t * 31 + arcIndex * 1.7) * 0.11 * envelope;
    const z = 0.23 + Math.cos(t * 27 + arcIndex) * 0.08 * envelope;
    arcPoints.push(new THREE.Vector3(x, y, z));
  }
  const material = new THREE.MeshBasicMaterial({ color: arcIndex % 2 ? 0x5bb8ff : 0xe4fbff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  const arc = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(arcPoints), 80, 0.012 + arcIndex * 0.002, 5, false), material);
  electricMaterials.push(material);
  energyArcs.push(arc);
  energyGroup.add(arc);
}

const energyRings = [];
for (let ringIndex = 0; ringIndex < 3; ringIndex++) {
  const material = new THREE.MeshBasicMaterial({ color: 0x76c9ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  const pulseRing = new THREE.Mesh(new THREE.TorusGeometry(0.32 + ringIndex * 0.06, 0.014, 6, 48), material);
  pulseRing.position.set(0.08, -0.35 + ringIndex * 1.85, 0.2);
  pulseRing.rotation.x = Math.PI / 2;
  energyRings.push(pulseRing);
  energyGroup.add(pulseRing);
}
const energyLight = new THREE.PointLight(0x69caff, 0, 9, 1.4);
energyLight.position.set(0.1, 1.7, 0.8);
energyGroup.add(energyLight);
sword.add(energyGroup);

const pedestal = new THREE.Group();
const base = new THREE.Mesh(new THREE.CylinderGeometry(1.65, 1.85, 0.22, 64), ink);
base.receiveShadow = true;
pedestal.add(base);
const ring = new THREE.Mesh(new THREE.TorusGeometry(1.67, 0.012, 4, 90), new THREE.MeshBasicMaterial({ color: 0x79623d }));
ring.rotation.x = Math.PI / 2;
ring.position.y = 0.12;
pedestal.add(ring);
pedestal.position.set(0, -3.25, 0);
pedestal.scale.set(0, 0, 0);
world.add(pedestal);

const ground = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshStandardMaterial({ color: 0x0b0a09, roughness: 1 }));
ground.rotation.x = -Math.PI / 2;
ground.position.y = -3.38;
ground.receiveShadow = true;
scene.add(ground);

const particlesCount = 170;
const positions = new Float32Array(particlesCount * 3);
const speeds = [];
for (let i = 0; i < particlesCount; i++) {
  positions[i * 3] = (Math.random() - 0.5) * 12;
  positions[i * 3 + 1] = (Math.random() - 0.5) * 9;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 7 - 1;
  speeds.push(0.0015 + Math.random() * 0.004);
}
const particleGeo = new THREE.BufferGeometry();
particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
const particles = new THREE.Points(particleGeo, new THREE.PointsMaterial({ color: 0xb37b4d, size: 0.018, transparent: true, opacity: 0.48, depthWrite: false }));
scene.add(particles);

const ambient = new THREE.HemisphereLight(0x9ba6b1, 0x180e08, 0.78);
scene.add(ambient);
const key = new THREE.DirectionalLight(0xffead1, 5.2);
key.position.set(-3.2, 3.2, 5);
key.castShadow = true;
key.shadow.mapSize.set(1024, 1024);
scene.add(key);
const rim = new THREE.SpotLight(0xb32618, 28, 18, Math.PI / 6, 0.8, 1.2);
rim.position.set(4, 1, -1.5);
rim.target = sword;
scene.add(rim);
const cold = new THREE.PointLight(0x6e9bb7, 5, 12, 2);
cold.position.set(-4, -1, 3);
scene.add(cold);
const forgeLight = new THREE.PointLight(0xff3c20, 0, 15, 1.35);
forgeLight.position.set(0, 0.4, 4.5);
scene.add(forgeLight);

const redMoon = new THREE.Mesh(
  new THREE.CircleGeometry(1.55, 64),
  new THREE.MeshBasicMaterial({ color: 0x8c2418, transparent: true, opacity: 0.13, depthWrite: false })
);
redMoon.position.set(0, 0.6, -4);
scene.add(redMoon);

const scrollState = { progress: 0 };
const master = gsap.timeline({
  defaults: { ease: "none" },
  scrollTrigger: {
    trigger: ".story",
    start: "top top",
    end: "bottom bottom",
    scrub: 1.15,
    onUpdate: self => {
      scrollState.progress = self.progress;
    },
  },
});
master
  .to(saya.position, { ...sayaDrawn, duration: 0.55, ease: "power3.inOut" }, 0.02)
  .to(saya.rotation, { y: -0.18, z: -0.18, duration: 0.55, ease: "power3.inOut" }, 0.02)
  .to(sword.position, { x: 2.15, y: 0.05, z: 0, duration: 0.75 }, 0.8)
  .to(sword.rotation, { x: 0.05, y: 0.65, z: 0.12, duration: 0.75 }, 0.8)
  .to(redMoon.material, { opacity: 0.04, duration: 0.7 }, 0.8)
  .to(sword.position, { x: -2.2, y: -0.15, z: 0.4, duration: 0.7 }, 1.55)
  .to(sword.rotation, { x: -0.08, y: -0.75, z: Math.PI / 2, duration: 0.7 }, 1.55)
  .to(camera.position, { z: 9.2, duration: 0.7 }, 1.55)
  .to(".panel--edge", { backgroundColor: "rgba(25,10,7,0.1)", duration: 0.7 }, 1.55)
  .to(sword.position, { x: 0.1, y: -0.1, z: 1.1, duration: 0.9 }, 2.35)
  .to(sword.rotation, { x: 0.2, y: 0.15, z: Math.PI / 2, duration: 0.9 }, 2.35)
  .to(sword.scale, { x: 1.22, y: 1.22, z: 1.22, duration: 0.9 }, 2.35)
  .to(camera.position, { z: 8.7, duration: 0.9 }, 2.35)
  .to(redMoon.material, { opacity: 0.08, duration: 0.8 }, 2.35)
  .to(sword.position, { x: 0, y: -0.05, z: -0.8, duration: 0.85 }, 4.15)
  .to(sword.rotation, { x: 0, y: 1.45, z: 0, duration: 0.85 }, 4.15)
  .to(sword.scale, { x: 0.82, y: 0.82, z: 0.82, duration: 0.85 }, 4.15)
  .to(camera.position, { z: 11.7, duration: 0.85 }, 4.15)
  .to(redMoon.material, { opacity: 0.22, duration: 0.85 }, 4.15)
  .to(sword.position, { x: 0, y: -0.15, z: -1, duration: 0.7 }, 5.05)
  .to(sword.rotation, { x: 0, y: 0, z: 0, duration: 0.7 }, 5.05)
  .to(camera.position, { z: 12.2, duration: 0.7 }, 5.05)
  .to(saya.position, { x: -1.45, y: 1.0, z: -0.4, duration: 0.85 }, 5.92)
  .to(saya.rotation, { y: 0.25, z: -0.1, duration: 0.85 }, 5.92)
  .to(sword.position, { x: 1.45, y: 0.05, z: 0, duration: 0.85 }, 5.92)
  .to(sword.rotation, { y: -0.35, z: 0.1, duration: 0.85 }, 5.92)
  .to(sword.position, { x: 0, y: 0, z: 1.15, duration: 0.8 }, 7.15)
  .to(sword.rotation, { x: 0.08, y: 0.12, z: Math.PI / 2, duration: 0.8 }, 7.15)
  .to(sword.scale, { x: 1.15, y: 1.15, z: 1.15, duration: 0.8 }, 7.15)
  .to(camera.position, { z: 8.6, duration: 0.8 }, 7.15)
  .to(energyCoreMaterial, { opacity: 1, duration: 0.16, ease: "power4.in" }, 7.62)
  .to(electricMaterials, { opacity: 0.95, duration: 0.12, stagger: 0.025 }, 7.68)
  .to(energyRings.map(ring => ring.material), { opacity: 0.82, duration: 0.12, stagger: 0.04 }, 7.7)
  .to(energyRings.map(ring => ring.scale), { x: 3.4, y: 3.4, z: 3.4, duration: 0.5, stagger: 0.05, ease: "power3.out" }, 7.72)
  .to(".energy-flash", { opacity: 0.72, duration: 0.08 }, 7.72)
  .to(".energy-flash", { opacity: 0, duration: 0.34, ease: "power3.out" }, 7.8)
  .to(".raijin-callout", { opacity: 1, x: -20, duration: 0.3, ease: "power3.out" }, 7.75)
  .to(electricMaterials, { opacity: 0, duration: 0.45, stagger: 0.02 }, 8.25)
  .to(energyCoreMaterial, { opacity: 0, duration: 0.5 }, 8.3)
  .to(energyRings.map(ring => ring.material), { opacity: 0, duration: 0.42, stagger: 0.03 }, 8.3)
  .to(".raijin-callout", { opacity: 0, x: 10, duration: 0.35 }, 8.45)
  .to(forgeLight, { intensity: 42, distance: 18, duration: 0.55 }, 7.35)
  .to(forgeLight.color, { r: 1, g: 0.035, b: 0.01, duration: 0.55 }, 7.35)
  .to(steel.color, { r: 0.95, g: 0.1, b: 0.035, duration: 0.55 }, 7.35)
  .to(steel.emissive, { r: 0.8, g: 0.025, b: 0.006, duration: 0.55 }, 7.35)
  .to(steel, { emissiveIntensity: 0.7, duration: 0.55 }, 7.35)
  .to(edgeSteel.emissive, { r: 1, g: 0.12, b: 0.025, duration: 0.55 }, 7.35)
  .to(edgeSteel, { emissiveIntensity: 1.2, duration: 0.55 }, 7.35)
  .to(forgeLight.color, { r: 0.1, g: 0.45, b: 1, duration: 0.6 }, 8.05)
  .to(steel.color, { r: 0.12, g: 0.42, b: 0.95, duration: 0.6 }, 8.05)
  .to(steel.emissive, { r: 0.02, g: 0.2, b: 0.8, duration: 0.6 }, 8.05)
  .to(edgeSteel.emissive, { r: 0.18, g: 0.6, b: 1, duration: 0.6 }, 8.05)
  .to(forgeLight, { intensity: 54, duration: 0.6 }, 8.05)
  .to(forgeLight.color, { r: 1, g: 0.58, b: 0.12, duration: 0.6 }, 8.7)
  .to(steel.color, { r: 0.95, g: 0.48, b: 0.09, duration: 0.6 }, 8.7)
  .to(steel.emissive, { r: 0.8, g: 0.3, b: 0.02, duration: 0.6 }, 8.7)
  .to(edgeSteel.emissive, { r: 1, g: 0.72, b: 0.2, duration: 0.6 }, 8.7)
  .to(forgeLight, { intensity: 62, duration: 0.6 }, 8.7)
  .to(sword.position, { x: -1.5, y: 0.2, z: 0.3, duration: 0.75 }, 9.25)
  .to(sword.rotation, { x: -0.18, y: 0.55, z: -0.72, duration: 0.75 }, 9.25)
  .to(sword.scale, { x: 0.92, y: 0.92, z: 0.92, duration: 0.75 }, 9.25)
  .to(camera.position, { z: 10.4, duration: 0.75 }, 9.25)
  .to(steel.color, { r: 0.52, g: 0.56, b: 0.55, duration: 0.7 }, 9.25)
  .to(steel.emissive, { r: 0, g: 0, b: 0, duration: 0.7 }, 9.25)
  .to(edgeSteel.emissive, { r: 0, g: 0, b: 0, duration: 0.7 }, 9.25)
  .to(steel, { emissiveIntensity: 0, duration: 0.7 }, 9.25)
  .to(edgeSteel, { emissiveIntensity: 0, duration: 0.7 }, 9.25)
  .to(forgeLight, { intensity: 10, duration: 0.7 }, 9.25)
  .to(forgeLight.color, { r: 0.1, g: 0.48, b: 1, duration: 0.7 }, 9.25)
  .to(sword.position, { x: 0, y: -0.08, z: -0.7, duration: 0.8 }, 10.15)
  .to(sword.rotation, { x: 0, y: 0.1, z: 0, duration: 0.8 }, 10.15)
  .to(camera.position, { z: 11.6, duration: 0.8 }, 10.15)
  .to(forgeLight, { intensity: 18, duration: 0.8 }, 10.15)
  .to(saya.position, { ...sayaDrawn, duration: 0.8 }, 10.25)
  .to(saya.rotation, { x: 0, y: -0.18, z: -0.18, duration: 0.8 }, 10.25)
  .to(sword.position, { x: 0.6, y: 0, z: 0, duration: 0.75 }, 11.05)
  .to(sword.rotation, { x: 0, y: -0.18, z: -0.18, duration: 0.75 }, 11.05)
  .to(sword.scale, { x: 1, y: 1, z: 1, duration: 0.75 }, 11.05)
  .to(camera.position, { z: 10.8, duration: 0.75 }, 11.05)
  .to(forgeLight, { intensity: 0, duration: 0.75 }, 11.05)
  .to(saya.position, { ...sayaSeated, duration: 1.05, ease: "power3.inOut" }, 11.55)
  .to(redMoon.material, { opacity: 0.08, duration: 0.9 }, 11.55)
  .to(pedestal.scale, { x: 1, y: 1, z: 1, duration: 0.7 }, 11.65);

document.querySelectorAll(".panel").forEach((panel) => {
  const content = panel.querySelectorAll(".chapter-copy > *, .oath-copy > *, .legacy-copy > *, .balance-copy > *, .ritual-head > *, .light-intro > *, .motion-copy > *, .echo-copy > *, .annotation, .seal");
  if (content.length) {
    gsap.fromTo(content, { y: 34, opacity: 0 }, {
      y: 0, opacity: 1, stagger: 0.08, ease: "power3.out",
      scrollTrigger: { trigger: panel, start: "top 62%", end: "top 25%", scrub: 1 },
    });
  }
});

gsap.to(".anatomy-track", {
  xPercent: -54,
  ease: "none",
  scrollTrigger: { trigger: ".panel--anatomy", start: "top top", end: "bottom bottom", scrub: 1 },
});
gsap.to(".anatomy-progress b", {
  scaleX: 1,
  ease: "none",
  scrollTrigger: { trigger: ".panel--anatomy", start: "top top", end: "bottom bottom", scrub: true },
});
gsap.from(".anatomy-card", {
  y: 100,
  rotate: 2,
  opacity: 0,
  stagger: 0.15,
  scrollTrigger: { trigger: ".panel--anatomy", start: "top 55%", end: "top 5%", scrub: 1 },
});
gsap.to(".balance-orbit", {
  rotation: 135,
  scale: 1.16,
  ease: "none",
  scrollTrigger: { trigger: ".panel--balance", start: "top bottom", end: "bottom top", scrub: 1.2 },
});
gsap.fromTo(".balance-scale i b", { left: "4%" }, {
  left: "72%",
  ease: "power2.inOut",
  scrollTrigger: { trigger: ".panel--balance", start: "top 65%", end: "center 35%", scrub: 1 },
});
gsap.from(".ritual-steps article", {
  yPercent: index => index % 2 ? 28 : -28,
  clipPath: "inset(50% 0 50% 0)",
  opacity: 0,
  stagger: 0.12,
  ease: "power3.out",
  scrollTrigger: { trigger: ".ritual-steps", start: "top 85%", end: "top 35%", scrub: 1 },
});
gsap.to(".ritual-ring", {
  rotation: 210,
  ease: "none",
  scrollTrigger: { trigger: ".panel--ritual", start: "top bottom", end: "bottom top", scrub: 1 },
});
const lightStory = gsap.timeline({
  scrollTrigger: { trigger: ".panel--light", start: "top top", end: "bottom bottom", scrub: 1 },
});
lightStory
  .to(".light-state--ember", { opacity: 1, duration: .5 }, 0)
  .to(".light-state--ember", { opacity: 0, duration: .45 }, .7)
  .to(".light-state--moon", { opacity: 1, duration: .5 }, .72)
  .to(".light-state--moon", { opacity: 0, duration: .45 }, 1.45)
  .to(".light-state--dawn", { opacity: 1, duration: .5 }, 1.48)
  .to(".spectrum i:nth-of-type(1) b", { scaleX: 1, duration: 1 }, 0)
  .to(".spectrum i:nth-of-type(2) b", { scaleX: 1, duration: 1 }, 1);
gsap.to(".motion-marquee > div:first-child", {
  xPercent: -28,
  ease: "none",
  scrollTrigger: { trigger: ".panel--motion", start: "top bottom", end: "bottom top", scrub: 1 },
});
gsap.fromTo(".motion-marquee > div:last-child", { xPercent: -34 }, {
  xPercent: -4,
  ease: "none",
  scrollTrigger: { trigger: ".panel--motion", start: "top bottom", end: "bottom top", scrub: 1 },
});
gsap.to(".cut-lines i", {
  scaleX: 1,
  stagger: .18,
  ease: "power3.inOut",
  scrollTrigger: { trigger: ".panel--motion", start: "top 65%", end: "center 30%", scrub: 1 },
});
gsap.from(".cut-count article", {
  y: 38,
  opacity: 0,
  stagger: .12,
  scrollTrigger: { trigger: ".cut-count", start: "top 92%", end: "top 64%", scrub: 1 },
});
gsap.fromTo(".echo-rings i", { scale: .35, opacity: 0 }, {
  scale: 1.22,
  opacity: 1,
  stagger: .12,
  ease: "power2.out",
  scrollTrigger: { trigger: ".panel--echo", start: "top 75%", end: "center 35%", scrub: 1 },
});
gsap.from(".echo-poem > *", {
  scaleX: 0,
  opacity: 0,
  stagger: .08,
  transformOrigin: "left center",
  scrollTrigger: { trigger: ".echo-poem", start: "top 92%", end: "top 65%", scrub: 1 },
});
const collectionCards = gsap.utils.toArray(".blade-card");
const collectionStory = gsap.timeline({
  scrollTrigger: { trigger: ".collection", start: "top top", end: "bottom bottom", scrub: 1 },
});
collectionStory
  .fromTo(collectionCards, {
    yPercent: 95,
    xPercent: index => (index - 1) * 42,
    rotationX: 34,
    rotationY: index => (index - 1) * -36,
    rotationZ: index => (index - 1) * 8,
    z: -520,
    opacity: 0,
  }, {
    yPercent: 0,
    xPercent: 0,
    rotationX: 0,
    rotationY: index => (index - 1) * 12,
    rotationZ: index => (index - 1) * -2.5,
    z: 0,
    opacity: 1,
    stagger: .08,
    duration: 1,
    ease: "power3.out",
  })
  .to(collectionCards, {
    rotationY: index => (1 - index) * 24,
    rotationX: index => index === 1 ? -4 : 8,
    xPercent: index => (index - 1) * 16,
    z: index => index === 1 ? 120 : -80,
    stagger: .06,
    duration: .75,
    ease: "power2.inOut",
  })
  .to(".collection__head", { y: -36, opacity: .16, duration: .45 }, .9)
  .to(".collection__hint", { opacity: 0, duration: .3 }, 1.35);
gsap.to(".legacy-copy", {
  y: -70,
  opacity: 0,
  ease: "power2.in",
  scrollTrigger: { trigger: ".panel--legacy", start: "top top", end: "45% top", scrub: 1 },
});
gsap.from(".sheath-text > span, .sheath-text > small", {
  y: 80,
  clipPath: "inset(0 0 100% 0)",
  opacity: 0,
  stagger: .09,
  ease: "power4.out",
  scrollTrigger: { trigger: ".sheath-text", start: "top 82%", end: "top 32%", scrub: 1 },
});
gsap.from(".sheath-text b", {
  rotation: -30,
  scale: .3,
  opacity: 0,
  scrollTrigger: { trigger: ".sheath-text", start: "top 75%", end: "top 38%", scrub: 1 },
});
gsap.from(".footer__word span", {
  yPercent: index => index % 2 ? 115 : -115,
  rotationX: index => index % 2 ? 62 : -62,
  opacity: 0,
  filter: "blur(14px)",
  stagger: .055,
  ease: "power3.out",
  scrollTrigger: { trigger: ".site-footer", start: "top 88%", end: "55% 58%", scrub: 1 },
});
gsap.from(".footer__grid > div", {
  y: 40,
  opacity: 0,
  stagger: .08,
  scrollTrigger: { trigger: ".footer__grid", start: "top 88%", end: "top 58%", scrub: 1 },
});

const intro = gsap.timeline({ delay: 0.15 });
intro
  .to(".loader__line i", { scaleX: 1, duration: 1.05, ease: "power3.inOut" })
  .to(".loader__mark", { rotation: 225, scale: 0.82, duration: 0.7, ease: "power3.inOut" }, "-=.35")
  .to(".loader", { yPercent: -100, duration: 0.9, ease: "power4.inOut" })
  .from(".hero-title", { scale: .82, opacity: 0, duration: 1.1, ease: "power4.out" }, "-=.35")
  .from(sword.scale, { x: 0.3, y: 0.3, z: 0.3, duration: 1.4, ease: "expo.out" }, "<")
  .from(sword.rotation, { z: -1.2, y: 1.4, duration: 1.5, ease: "expo.out" }, "<")
  .from(".panel--hero .eyebrow", { y: 18, opacity: 0, duration: 0.7 }, "-=.7");

const heroDoors = gsap.timeline({
  scrollTrigger: { trigger: ".panel--hero", start: "top top", end: () => `+=${window.innerHeight}`, scrub: 1 },
});
heroDoors
  .to(".title-left", { xPercent: -220, duration: 1, ease: "power2.inOut" }, 0)
  .to(".title-right", { xPercent: 220, duration: 1, ease: "power2.inOut" }, 0)
  .to(".title-kanji", { scale: 1.32, opacity: 0, duration: .9, ease: "power2.in" }, 0)
  .to(".hero-doors i:first-child", { xPercent: -102, duration: 1, ease: "power3.inOut" }, 0)
  .to(".hero-doors i:nth-child(2)", { xPercent: 102, duration: 1, ease: "power3.inOut" }, 0)
  .to(".hero-doors b", { opacity: 0, scaleY: .3, duration: .55, ease: "power2.in" }, .05)
  .to(".hero-copy, .discover, .scroll-cue", { opacity: 0, y: -24, duration: .6, ease: "power2.in" }, .18)
  .to({}, { duration: .65 });

const cursor = document.querySelector(".cursor");
const pointer = new THREE.Vector2();
const targetPointer = new THREE.Vector2();
window.addEventListener("pointermove", (event) => {
  targetPointer.x = (event.clientX / innerWidth - 0.5) * 2;
  targetPointer.y = (event.clientY / innerHeight - 0.5) * 2;
  gsap.to(cursor, { x: event.clientX, y: event.clientY, duration: 0.25, ease: "power2.out" });
});
document.querySelectorAll("button, a").forEach(el => {
  el.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
  el.addEventListener("mouseleave", () => cursor.classList.remove("is-hover"));
});
document.querySelector(".discover").addEventListener("click", () => document.querySelector("#steel").scrollIntoView({ behavior: "smooth" }));
document.querySelectorAll(".site-nav a").forEach(link => link.addEventListener("click", event => {
  event.preventDefault();
  document.querySelector(link.getAttribute("href")).scrollIntoView({ behavior: "smooth" });
}));

document.querySelectorAll(".blade-card").forEach(card => {
  const inner = card.querySelector(".blade-card__inner");
  card.addEventListener("pointermove", event => {
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5;
    const y = (event.clientY - rect.top) / rect.height - .5;
    gsap.to(inner, { rotationY: x * 13, rotationX: y * -11, transformPerspective: 900, duration: .45, ease: "power2.out" });
  });
  card.addEventListener("pointerleave", () => gsap.to(inner, { rotationY: 0, rotationX: 0, duration: .7, ease: "power3.out" }));
});

let inspecting = false;
let dragStart = null;
let inspectRotation = { x: 0, y: 0 };
const inspectOverlay = document.querySelector(".inspect");
document.querySelector("#inspectButton").addEventListener("click", () => {
  inspecting = true;
  inspectOverlay.classList.add("is-open");
  inspectOverlay.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  gsap.to(".story", { opacity: 0, duration: .5 });
  gsap.to(sword.position, { x: 0, y: 0, z: 1.2, duration: 1, ease: "power4.inOut" });
  gsap.to(sword.rotation, { x: 0, y: 0.25, z: Math.PI / 2, duration: 1, ease: "power4.inOut" });
  gsap.to(sword.scale, { x: 1.35, y: 1.35, z: 1.35, duration: 1, ease: "power4.inOut" });
  gsap.to(pedestal.scale, { x: 0, y: 0, z: 0, duration: .5 });
});
document.querySelector(".inspect__close").addEventListener("click", closeInspect);
function closeInspect() {
  inspecting = false;
  inspectOverlay.classList.remove("is-open");
  inspectOverlay.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  gsap.to(".story", { opacity: 1, duration: .5 });
  ScrollTrigger.refresh();
}
window.addEventListener("pointerdown", e => { if (inspecting) dragStart = { x: e.clientX, y: e.clientY }; });
window.addEventListener("pointermove", e => {
  if (inspecting && dragStart) {
    inspectRotation.y += (e.clientX - dragStart.x) * 0.008;
    inspectRotation.x += (e.clientY - dragStart.y) * 0.004;
    dragStart = { x: e.clientX, y: e.clientY };
  }
});
window.addEventListener("pointerup", () => dragStart = null);
window.addEventListener("wheel", e => {
  if (inspecting) camera.position.z = THREE.MathUtils.clamp(camera.position.z + e.deltaY * .004, 7.5, 14);
}, { passive: true });

const clock = new THREE.Clock();
function render() {
  const t = clock.getElapsedTime();
  pointer.lerp(targetPointer, 0.035);
  if (inspecting) {
    sword.rotation.y += (inspectRotation.y - sword.rotation.y) * 0.08;
    sword.rotation.x += (inspectRotation.x - sword.rotation.x) * 0.08;
  } else {
    world.rotation.y += (pointer.x * 0.06 - world.rotation.y) * 0.025;
    world.rotation.x += (-pointer.y * 0.035 - world.rotation.x) * 0.025;
  }
  const attr = particles.geometry.attributes.position;
  for (let i = 0; i < particlesCount; i++) {
    attr.array[i * 3 + 1] += speeds[i];
    attr.array[i * 3] += Math.sin(t * .3 + i) * .0005;
    if (attr.array[i * 3 + 1] > 4.5) attr.array[i * 3 + 1] = -4.5;
  }
  attr.needsUpdate = true;
  particles.rotation.y = t * 0.008;
  const energyLevel = energyCoreMaterial.opacity;
  energyArcs.forEach((arc, index) => {
    arc.rotation.y = Math.sin(t * 14 + index * 1.3) * 0.11;
    arc.scale.x = 1 + Math.sin(t * 22 + index) * 0.13;
  });
  energyRings.forEach((pulseRing, index) => {
    pulseRing.rotation.z = t * (index % 2 ? -2.8 : 3.4) + index;
  });
  energyLight.intensity = energyLevel * (34 + Math.sin(t * 37) * 12);
  rim.intensity = 24 + Math.sin(t * 1.7) * 3;
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
render();

window.addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
});

    