import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

const PARAMS = {
  galaxy: {
    branches: 3,
    count: 100000,
    radius: 5,
    randomness: 0.2,
    randomnessPower: 3,
    size: 0.01,
    spin: 1,
  },
};

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Test cube
 */
// const cube = new THREE.Mesh(
//     new THREE.BoxGeometry(1, 1, 1),
//     new THREE.MeshBasicMaterial()
// )
// scene.add(cube)
const GEOS = {
  galaxy: null,
};

const MATS = {
  galaxy: null,
};

let points = null;

const generateGalaxy = () => {
  const { branches, count, radius, randomness, randomnessPower, size, spin } =
    PARAMS.galaxy;

  // Disposal
  if (points !== null) {
    GEOS.galaxy.dispose();
    MATS.galaxy.dispose();
    scene.remove(points);
  }
  //------------------------
  // initial new geometries/material inside function (for debugging controls)
  GEOS.galaxy = new THREE.BufferGeometry();
  MATS.galaxy = new THREE.PointsMaterial({
    size,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  let positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    /**
     * We can use Math.cos(...) and Math.sin(...) to position the particles on those branches.
     * -> We first calculate an angle with the modulo (%)
     * -> Divide the result by the branches count parameter to get an angle between 0 and 1
     * -> multiply this value by Math.PI * 2 to get an angle between 0 and a full circle.
     *
     * -> We then use that angle with Math.cos(...) and Math.sin(...) for the x and the z axis
     * -> Then we finally multiply by the radius:
     */
    const galaxyRadius = Math.random() * radius;
    const branchAngle = ((i % branches) / branches) * Math.PI * 2;
    /**
     * Then we can multiply the spinAngle by that spin parameter.
     * To put it differently, the further each particle is from the center, the more spin it'll endure:
     */
    const spinAngle = galaxyRadius * spin;

    positions[i3] = Math.cos(branchAngle + spinAngle) * galaxyRadius;
    positions[i3 + 1] = 0;
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * galaxyRadius;
  }

  galaxy.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  points = new THREE.Points(GEOS.galaxy, MATS.galaxy);
  scene.add(points);
};

generateGalaxy();

let f1 = gui.addFolder("Star Traits");
f1.add(PARAMS.galaxy, "count")
  .min(100)
  .max(1000000)
  .step(100)
  .onFinishChange(generateGalaxy);
f1.add(PARAMS.galaxy, "size")
  .min(0.001)
  .max(0.1)
  .step(0.001)
  .onFinishChange(generateGalaxy);

let f2 = gui.addFolder("Galaxy Dimensions");
f2.add(PARAMS.galaxy, "radius")
  .min(0.01)
  .max(20)
  .step(0.01)
  .onFinishChange(generateGalaxy);
f2.add(PARAMS.galaxy, "branches")
  .min(2)
  .max(20)
  .step(1)
  .onFinishChange(generateGalaxy);
f2.add(PARAMS.galaxy, "spin")
  .min(-5)
  .max(5)
  .step(0.001)
  .onFinishChange(generateGalaxy);

let f3 = gui.addFolder("Galaxy Spread");
f3.add(PARAMS.galaxy, "randomness")
  .min(0)
  .max(2)
  .step(0.001)
  .onFinishChange(generateGalaxy);
// f3.add(PARAMS.galaxy, 'randomnessPower').min(0).max(2).step(.001).onFinishChange(generateGalaxy)

let f4 = gui.addFolder("Galaxy Colors");

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
camera.position.x = 3;
camera.position.y = 3;
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
