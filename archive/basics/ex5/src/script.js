import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

/**
 * ================
 * SECTION NOTES
 * ____________________________
 * 
 * - CAMERA | Abstract class, don't use directly
 * ------------------------------
 * - Array Cameras | Renders scene from multiple cameras
 *   on specific areas of the render (Multiplayer).
 * 
 * - Stereo Camera | Render through 2 cameras
 *   This mimics the eyes to create a parallax effect.
 *   Use with VR, cardboard, red/blue glasses
 * 
 * - Cube Camera | 6 renders, each facing different directions
 *   Can render the surroundings, environment map
 *   Reflection or shadow map
 * 
 * - Orthographic Camera | Renders without perspective
 *   Image remains the same size regardless of distance
 * 
 * - Perspective Camera | Renders with perspective
 *   Image size changes with distance
 * 
 *   CAMERA CONTROLS
 *   -----------------------------
 *  - Fly Controls (up/down/left/right/barrel roll)
 *    Like You are in a spaceship
 * 
 *  - First person (left/right, cannot change vertical access, no vertical flips)
 *    Like you are a flying bird
 *  
 *  - Pointer Lock (look around, fwd/backward, WASD)
 *    Like a videogame firstperson
 * 
 *  - Orbit Control (Can't go below the floor, or above a certain angle)
 *    Zoom in/Zoom out, 
 * 
 *  - Trackball Control (Orbit without limits)
 *    Using trackball and looping
 * 
 *   - Transform Control (Move objects)
 *    along axis 
 *   
 *   - Drag Control (Move objects)
 *    click and drag
 * /
 
/**
 * CURSOR TRACKING
*/
const cursor = {
  x: 0,
  y: 0,
  scale: 1,
};

const trackCursor = (e) => {
  // creates an optimized ratio (0-1)
  cursor.x = e.clientX / sizes.width - 0.5;
  cursor.y = -(e.clientY / sizes.height - 0.5);
};
window.addEventListener("mousemove", trackCursor);

const zoom = (e) => {
  //   e.preventDefault();
  //   console.log(e.deltaY, cursor.scale);
  cursor.scale += e.deltaY * -0.01;

  cursor.scale = Math.min(Math.max(1, cursor.scale), 6);

  console.log(cursor.scale);
};

document.querySelector("body").addEventListener("wheel", zoom);

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Scene
const scene = new THREE.Scene();

// Object
const mesh = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1, 5, 5, 5),
  new THREE.MeshBasicMaterial({ color: 0xff0000 })
);
scene.add(mesh);

// PERSPECTIVE CAMERA
/**
 * .PerspectiveCamera(
 *  vertical fieldOfView in deg,
 *  aspect ratio or width / height,
 *  near clip out of frame,
 *  far clip out of frame
 *  );
 *
 * A large field of view creates distortion
 * A small field of view minimizes distortion
 * 45-75 is recommended
 *
 * DONT FUCKING USE LARGE VALUES FOR NEAR/FAR CLIP
 * IT CREATES A "Z-FIGHTING BUG"
 * Strange video game glitch
 *
 *  Good -> .PerspectiveCamera(45, w / h, 0.1, 200)
 *  Bad -> .PerspectiveCamera(45, w / h, 0.00001, 99999)
 */
const aspectRatio = sizes.width / sizes.height;
const camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 100);

// ORTHOGRAPHIC CAMERA
/**
 * .OrthographicCamera(left, right, top, bottom, nearclip, farclip)
 *
 *  You might have SCENE distortion
 *  Unless you calculate a proper aspect ratio
 */
// proper configuration for orthographic camera
// const camera = new THREE.OrthographicCamera(
//   -2 * aspectRatio,
//   2 * aspectRatio,
//   2,
//   -2,
//   0.1,
//   100
// );
// camera.position.x = 2;
// camera.position.y = 2;
camera.position.z = 2;
camera.lookAt(mesh.position);
scene.add(camera);

/*
 * ORBIT CONTROLS
 */
const controls = new OrbitControls(camera, canvas);
// controls.target.y = 1;
// controls.update();
controls.enableDamping = true;

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);

// Animate
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update objects
  //   mesh.rotation.y = elapsedTime;

  // UPDATE CAMERA
  // Standard Rotation
  //   camera.position.y = cursor.y * 3;
  //   camera.position.x = cursor.x * 3;
  //   camera.position.z = cursor.scale * 2;
  // camera.lookAt(new THREE.Vector3());

  // Mathematical Rotation
  //   camera.position.x = Math.sin(cursor.x * Math.PI * 2) * 3;
  //   camera.position.z = Math.cos(cursor.x * Math.PI * 2) * 3;
  //   camera.position.y = cursor.y * 5;
  //   camera.lookAt(mesh.position);

  // Update Controls to use damping
  controls.update();
  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
