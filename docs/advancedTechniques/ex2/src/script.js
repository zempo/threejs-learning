import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
// import * as dat from 'lil-gui'
import * as dat from "dat.gui";

/**
 * 3D MODEL FORMATS
 * =============================
 *
 * GLTF stands for GL Transmission Format.
 * It's made by the Khronos Group (the guys behind
 * OpenGL, WebGL, Vulkan, Collada and with many members like AMD / ATI, Nvidia, Apple, id Software, Google, Nintendo, etc.)
 *
 * GLTF has become very popular these past few years.
 * It supports very different sets of data.
 * You can obviously have data like the geometries
 * and the materials but you can also have data like cameras,
 * lights, scene graph, animations, skeletons, morphing and even multiple scene.
 *
 * It also supports various file formats like json, binary, embed textures.
 * GLTF has become the standard when it comes to real-time.
 * And because it's becoming a standard, most 3D softwares, game engines, and libraries support it.
 * That means that you can easily have a similar result in different environments.
 *
 * That doesn't mean that you have to use GLTF in all cases.
 * If you merely need a geometry, you better use another format like OBJ, FBX, STL, or PLY.
 * ----------------------------------
 * GLTF (GL Transmission Format) | standard, binary, draco, embedded
 *
 * --> glTF: Default format, JSON file containing standard info on cameras/lights/scenes/materials/transformations.
 *           usually, this file contains references to other files that will be loaded automatically.
 *           DOES NOT CONTAIN geometries or textures
 *
 * --> glTF Binary: Composed of 1 file. Contains all the data in the glTF format. DIFFICULT to edit
 *
 * --> glTF Draco: Buffer data (typically the geometry) is compressed using the Draco algo.
 *     https://github.com/google/draco
 *
 * --> glTF Embedded: Similar to binary file (b/c it's just a 1 file system), but this one is editable JSON
 *
 * If you want to be able to alter the textures or the coordinates of the lights after exporting,
 * you better go for the glTF-default.
 *
 * It also presents the advantage of loading the different files separately,
 * resulting in a load speed improvement.
 *
 * If you want only one file per model and don't care about modifying the assets,
 * you better go for glTF-Binary.
 *
 * In both cases, you must decide if you want to use the Draco compression or not.
 *
 */

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

const PARAMS = {
  fxn: {},
};

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Models
 *
 * All we want is to get our duck in the scene. We have multiples ways of doing it:
 *
 * --> Add the whole scene in our scene. We can do that because even if its name is scene, it's in fact a Group.
 * --> Add the children of the scene to our scene and ignore the unused PerspectiveCamera.
 * --> Filter the children before adding to the scene to remove the unwanted objects like the PerspectiveCamera.
 * --> Add only the Mesh but end up with a duck that could be wrongly scaled, positioned or rotated.
 * --> Open the file in a 3D software and remove the PerspectiveCamera then export it again.
 *
 * Because our model structure is simple, we will add the Object3D to our scene,
 * and ignore the unused PerspectiveCamera inside.
 *
 * In future lessons, we will add the whole scene as one object:
 *
 */

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");

const gltfLoader = new GLTFLoader();
// gltfLoader.load(
//   "/models/Duck/glTF/Duck.gltf", // default
//   "/models/Duck/glTF-Binary/Duck.glb", // glTF-Binary
//   "/models/Duck/glTF-Embedded/Duck.gltf", // glTF-Embedded
//   '/models/Duck/glTF-Draco/Duck.gltf', // draco
// "/models/FlightHelmet/glTF/FlightHelmet.gltf",
//   (gltf) => {
// console.log("success!");
// console.log(gltf);
// scene.add(gltf.scene.children[0]);

// const children = [...gltf.scene.children];
// for (const child of children) {
//   scene.add(child);
// }

// scene.add(gltf.scene);
//   }
//   (progress) => {
//     console.log("progress");
//     console.log(progress);
//   },
//   (err) => {
//     console.log("error");
//     console.log(err);
//   }
// );

/**
 * ANIMATIONS
 */
let mixer = null;
let actions = null;

gltfLoader.load("/models/Fox/glTF/Fox.gltf", (gltf) => {
  gltf.scene.scale.set(0.025, 0.025, 0.025);
  scene.add(gltf.scene);

  mixer = new THREE.AnimationMixer(gltf.scene);
  actions = gltf.animations;
  console.log(actions);
  // 3 animations in the list
  const action = mixer.clipAction(gltf.animations[2]);
  action.play();
});

/**
 * Floor
 */
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshStandardMaterial({
    color: "#444444",
    metalness: 0,
    roughness: 0.5,
  })
);
floor.receiveShadow = true;
floor.rotation.x = -Math.PI * 0.5;
scene.add(floor);

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = -7;
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.bottom = -7;
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

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
camera.position.set(2, 2, 2);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 0.75, 0);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

const animateFox = (time) => {
  if (mixer) {
    mixer.update(time);
  }
};

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  animateFox(deltaTime);

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
