import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

/**
 * ==============
 * TEXTURES
 * ===============
 *
 * Images/colors that cover the surface of the geometry
 *
 * RESOURCES
 * -------------
 * Textures (https://www.poliigon.com/)
 * More Textures (https://3dtextures.me/)
 *
 * João Paulo (https://ko-fi.com/katsukagi)
 * Wooden Door (https://3dtextures.me/2019/04/16/door-wood-001/)
 *
 * TYPES
 * -----------
 * 1. Color (albedo): Most simple texture.
 *    Takes pixels of texture and applies them to geometry
 *
 * 2. Alpha (Grayscale img): White is visible, black is not
 *    Just like the United States Foreign Policy
 *
 * 3. Height (Grayscale img): Moves vertices to create relief
 *    You'll need a "subdivision" if you want to see it
 *
 * 4. Normal (Detailing): It won't move vertices, but will
 *    lure the light into thinking the face is oriented differently
 *    Very useful to add details w/ good performance
 *    Since you don't need to subdivide the geometry!!!
 *
 * 5. Ambient Occlusion (Grayscale img): Fakes shadow in surface crevices
 *    Add black inside convexes, but not right
 *    It's not physically accurate, but helps create contrast
 *
 * 6. Metalness (Grayscale img): Specify which areas are metallic
 *    Metallic = white, Non-Metallic = black.
 *    This creates reflection
 *
 * 7. Roughness (Grayscale img): Grayscale w/ metalness.
 *    Specifies which part is rough (white), and smooth (black)
 *    This helps dissipate the light.
 *    For instance, a carpet is rugged (you won't see light reflected)
 *    Here, the wood is uniform b/c it has a clear coat on it
 *
 *  PBR PRINCIPLES: PHYSICALLY BASED RENDERING
 * ------------------
 *  Becoming the new standard for realistic renders!
 *  Follow real-life directions to get realistic results
 *  Used by many softwares, engines, and libraries
 *
 *  TIPS FOR PREPARING TEXTURES
 *  ---------------------
 *   - Weight
 *  - Size (resolution)
 *  - The Data
 *
 *  WEIGHT
 *  jpg, lossy compression, but lighter
 *  png, lossless compression, but heavier
 *
 *  SIZE
 *  You have to manage your GPU
 *  Resize textures to be as small, as possible
 *  Compress THE FUCK out of small/background imgs
 *  Must be power of 2
 *
 *  DATA
 *  Transparency in png, not jpg
 *
 *
 **/

/**
 * LOADING IMGS
 * -----
 * We Convert imgs to textures
 * Friendlier for GPU
 **/
const loadMngr = new THREE.LoadingManager();
const lFxns = {
  start: () => {
    console.log("starts");
  },
  load: () => {
    console.log("loaded");
  },
  progress: () => {
    console.log("progress");
  },
};

loadMngr.onStart = lFxns.start;
loadMngr.onLoad = lFxns.load;
loadMngr.onProgress = lFxns.progress;

const textureLoader = new THREE.TextureLoader(loadMngr);
// const tFxns = {
//   loads: () => console.log("load"),
//   progress: () => console.log("progress"),
//   err: () => console.log("err"),
// };
const colorTexture = textureLoader.load(
  //   "textures/door/color.jpg"
  // resolution text img
  //   "textures/checkerboard-1024x1024.png"
  // Sharper imgs
  //   "textures/checkerboard-8x8.png"
  "textures/minecraft.png"
  //   tFxns.loads,
  //   tFxns.progress,
  //   tFxns.err
);
const alphaTexture = textureLoader.load("textures/door/alpha.jpg");
const heightTexture = textureLoader.load("textures/door/height.jpg");
const normalTexture = textureLoader.load("textures/door/normal.jpg");
const ambientOcclusionTexture = textureLoader.load(
  "textures/door/ambientOcclusion.jpg"
);
const metalnessTexture = textureLoader.load("textures/door/metalness.jpg");
const roughnessTexture = textureLoader.load("textures/door/roughness.jpg");

/**
 * TRANSFORMING TEXTURES
 * Vector2
 * Subdivisions
 */
//// REPEATWRAPPING
//----------------
//// Now we have a cube, 2 doors wide, 3 tall
// colorTexture.repeat.x = 2;
// colorTexture.repeat.y = 3;
// colorTexture.wrapS = THREE.RepeatWrapping;
// colorTexture.wrapT = THREE.RepeatWrapping;
// colorTexture.wrapS = THREE.MirroredRepeatWrapping;
// colorTexture.wrapT = THREE.MirroredRepeatWrapping;
//// OFFSET
// --------------
// Moves door texture slightly left
// colorTexture.offset.x = 0.1;
//// ROTATION (IN RADIANS)
// ---------------
// colorTexture.center.x = 0.5;
// colorTexture.center.y = 0.5;
// colorTexture.rotation = Math.PI * 0.5;

/**
 * MIPMAPPING
 * ===============
 *
 * Recursively fractaling/fragmenting the edge
 * So that we get a seamless texture
 * At 1x1 pixels
 * */
// MINIFICATION
// --------
colorTexture.minFilter = THREE.NearestFilter;
// // For small checkerboard
// colorTexture.minFilter = THREE.NearestMipmapLinearFilter;
// // IF we are using nearestFilter, we can deactivate minmapping
colorTexture.generateMipmaps = false;

// MAGNIFICATION
// -------
colorTexture.magFilter = THREE.NearestFilter;

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * UV UNWRAPPING
 * ===================================
 * Like orogami, so that we can work with other geometries
 * Each vertex gets mapped to UV Coordinates
 *
 */
const geometry = new THREE.BoxGeometry(1, 1, 1);
// console.log(geometry.attributes.uv);
const material = new THREE.MeshBasicMaterial({ map: colorTexture });
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

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
camera.position.x = 1;
camera.position.y = 1;
camera.position.z = 1;
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
