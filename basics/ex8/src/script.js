import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import gsap from "gsap";

/**
 * DEBUG UI: MODIFY VALUES WITH A GUI
 *
 * Range inputs, controls, library
 * To make it easier for your user to navigate the site
 *
 * Different tweaks
 *
 * - Range (min/max)
 * - Color
 * - Text
 * - Checkbox
 * - Select
 * - Button
 * - Folder (to organize elements)
 */
const gui = new dat.GUI({ closed: false, width: 400 });
// Hide on load
// gui.hide();

// Press h twice to open

const debugObj = {
  color: 0xff00ff,
  // Spin button animation
  spin: () => {
    let yDist = mesh.rotation.y;
    gsap.to(mesh.rotation, { duration: 1, y: yDist + 10 });
  },
};

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Object
 */
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: debugObj.color });
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// DEBUG
// gui.add(objectToModify, 'y', min, max, step)
// gui.add(objToMod, 'x').min().max()....
// gui.add(mesh.position, "x", -3, 3, 0.01);
// gui.add(mesh.position, "y", -3, 3, 0.01);
// gui.add(mesh.position, "z", -3, 3, 0.01);
gui.add(mesh.position, "x").min(-3).max(3).step(0.01).name("Left/Right");
gui.add(mesh.position, "y").min(-3).max(3).step(0.01).name("Elevation");
gui.add(mesh.position, "z").min(-3).max(3).step(0.01).name("Front/Back");

// Toggle visibility
gui.add(mesh, "visible");
// Toggle wireframe
gui.add(material, "wireframe");

// Update color
gui.addColor(debugObj, "color").onChange(() => {
  material.color.set(debugObj.color);
});

// Spin animation
gui.add(debugObj, "spin");

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
