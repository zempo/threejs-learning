import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";

/**
 * Base
 */
// Debug
const gui = new dat.GUI();
const controlNode = {
  patColor: 0xff88cc,
};

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();
const TEXTURES = {
  particle: textureLoader.load("/textures/particles/2.png"),
};

/**
 * BUILDING THE PARTICLES
 * ===============================================
 * Points material
 * -----------------
 *
 * size (control particle size)
 * size attenuation (size as it changes with distance)
 */
const GEOS = {
  sphere: new THREE.SphereGeometry(1.5, 40, 40),
  pyramid: new THREE.ConeGeometry(1, 1, 8),
  particles: new THREE.BufferGeometry(),
};

const MATS = {
  p1: new THREE.PointsMaterial({
    size: 0.1,
    sizeAttenuation: true,
    color: controlNode.patColor,
    map: TEXTURES.particle,
  }),
};

gui
  .addColor(controlNode, "patColor")
  .onChange(() => {
    MATS.p1.color.set(controlNode.patColor);
  })
  .name("Change Particle Color");

function makeParticles(x, s) {
  // multiply by 3 b/c each position is composed of 3 vals (x,y,z)
  let count = x * 3;
  // particle spread
  let spread = s;
  let positions = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    // btwn -.5 and .5
    positions[i] = (Math.random() - 0.5) * spread;
  }

  // create the three.js Buffer attribute and specify that each information is composed of 3 values
  // for type checking, as each point should be in 3d space
  GEOS.particles.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );
}

// makeParticles(count, spread)
makeParticles(5000, 20);

const particles = new THREE.Points(GEOS.particles, MATS.p1);
scene.add(particles);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.z = 3;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
