import "./style.css";
import * as THREE from "three";
import gsap from "gsap";

/*
===============================
ANIMATION NOTES
===============================

window.requestAnimationFrame(...)
----------
-the animation actually applies to
the next frame, not the current one
*/

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Object
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.z = 3;
scene.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);

// ANIMATIONS
//
// using vanilla
//-----------
// let t = Date.now();
// const tick = () => {
//   // Calibrate framerate w/ timestamp
//   const currentT = Date.now();
//   const deltaT = currentT - t;
//   t = currentT;

//   // Update objects
//   //   mesh.position.x += 0.001 * deltaT;
//   mesh.rotation.x += 0.002 * deltaT;
//   //   mesh.rotation.z += 0.002 * deltaT;
//   //   mesh.rotation.y += 0.002 * deltaT;
//   // run
//   renderer.render(scene, camera);

//   window.requestAnimationFrame(tick);
// };

// tick();

// using THREE
//-----------
// let clock = new THREE.Clock();
// const tick = () => {
//   // Calibrate framerate w/ timestamp
//   const elapsedT = clock.getElapsedTime();

//   // Update objects
//   // 2 times faster than otherwise
//   //   mesh.rotation.x = elapsedT * 2;

//   // repeating movement
//   mesh.position.y = Math.sin(elapsedT);
//   mesh.position.x = Math.cos(elapsedT);

//   renderer.render(scene, camera);

//   window.requestAnimationFrame(tick);
// };

// tick();

// using GSAP (Green Sock)
//-----------
gsap.to(mesh.position, {
  duration: 1,
  delay: 1,
  x: 2,
});

gsap.to(mesh.position, {
  duration: 1,
  delay: 2,
  x: 0,
});

const tick = () => {
  renderer.render(scene, camera);

  window.requestAnimationFrame(tick);
};

tick();
