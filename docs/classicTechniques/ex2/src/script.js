import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";

/**
 * SHADOWS (Drop shadows)
 * ---------
 *
 * Shadows need to be a good frame rate
 * Blender (ray-tracing, hour-long rendering)
 * Three.js (a cheaper solution)
 *
 * Shilohuette of objects (Literally an "afterimage")
 *
 * When you do 1 render, Three.js will do a render for each light supporting the shadows.
 * Those renders will simulate what light sees as if it was a camera
 * During these light renders, a MeshDepthMaterial (geometry by depth)
 *
 * Light renders are stored as textures, and we call those "shadow maps"
 *
 * They are used on all materials which are support to receive shadows and projected onto the geometry
 *
 * renderer.shadowMap.enabled = true
 * -----------------------------------------
 *
 * THE ONLY LIGHTS THAT SUPPORT SHADOWS: point, directional, spotlight
 *
 * We can optimize shadows by adjusting the size of the shadow map and/or the shadow camera position around the scene
 *
 *
 * SHADOW MAP TYPES :
 * ----------------------
 * Different types of algorithms can be applied to shadow maps:
 *
 * THREE.BasicShadowMap Very performant but lousy quality
 * THREE.PCFShadowMap Less performant but smoother edges
 * THREE.PCFSoftShadowMap Less performant but even softer edges (most common), however shadow radius/blur does not work
 * THREE.VSMShadowMap Less performant, more constraints, can have unexpected results
 *
 * BAKED SHADOWS :
 * -----------------------
 * Non-dynamic pre-rendered shadow textures that you can add to a mesh (geometry, plus shadow material)
 * However, the shadow won't adapt to its environment. It is VERY contextual
 *
 * NON-BAKED ALTERNATIVE (Billow)
 * -----------------------
 * Use a simple baked shadow (diffuse gradient that can be moved with the shadow)
 * Reduce alpha (if the sphere goes up from the shadow plane)
 * Increase alpha (if the sphere goes down towards the shadow plane)
 * We'll create a simple shadow plane slightly above the floor, but below the sphere
 * (so it doesn't get clipped)
 *
 */

/**
 * Base
 */
// Baked shadow Texture
// Baked shadows won't move with the conditions.
// So you have to decide if you have a dynamic/static project (Blender-generated)
const textureLoader = new THREE.TextureLoader();
const bakedShadow = textureLoader.load(`/textures/bakedShadow.jpg`);
const simpleShadow = textureLoader.load(`/textures/simpleShadow.jpg`);

// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Lights (only point, directional, spot lights support shadows)
 */
// Ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
gui.add(ambientLight, "intensity").min(0).max(1).step(0.001);
scene.add(ambientLight);

// Directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
directionalLight.position.set(2, 2, -1);
gui.add(directionalLight, "intensity").min(0).max(1).step(0.001);
gui.add(directionalLight.position, "x").min(-5).max(5).step(0.001);
gui.add(directionalLight.position, "y").min(-5).max(5).step(0.001);
gui.add(directionalLight.position, "z").min(-5).max(5).step(0.001);

directionalLight.castShadow = true;

// console.log(directionalLight.shadow);
// default height/width of shadow map is 512, let's do by power of 2 to increase resolution
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.camera.top = 2;
directionalLight.shadow.camera.right = 2;
directionalLight.shadow.camera.bottom = -2;
directionalLight.shadow.camera.left = -2;
// boundary near the camera
directionalLight.shadow.camera.near = 1;
// edge boundary from the camera
directionalLight.shadow.camera.far = 6;
// shadow blur
directionalLight.shadow.radius = 3;

scene.add(directionalLight);

const dirHelper = new THREE.DirectionalLightHelper(directionalLight, 0.4);
// scene.add(dirHelper);

const dirLightCameraHelper = new THREE.CameraHelper(
  directionalLight.shadow.camera
);
dirLightCameraHelper.visible = false;
scene.add(dirLightCameraHelper);

// spot light
const spotLight = new THREE.SpotLight(0xffffff, 0.3, 10, Math.PI * 0.3);
spotLight.castShadow = true;
spotLight.position.set(0, 2, 2);

// control the field of view to optimize
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;
spotLight.shadow.camera.fov = 30;
// spotLight.shadow.camera.right = 2;
// spotLight.shadow.camera.bottom = -2;
// spotLight.shadow.camera.left = -2;
// // boundary near the camera
spotLight.shadow.camera.near = 1;
// // edge boundary from the camera
spotLight.shadow.camera.far = 5.5;

// scene.add(spotLight);
// scene.add(spotLight.target);

const spotHelper = new THREE.CameraHelper(spotLight.shadow.camera);
spotHelper.visible = false;
scene.add(spotHelper);

/// Point light
/**
 * Point light has 6 renders in each direction from the shadow map perspective camera
 * It is hence, VERY costly
 *
 * */
const pointLight = new THREE.PointLight(0xffffff, 0.3);
pointLight.castShadow = true;

pointLight.shadow.mapSize.width = 1024;
pointLight.shadow.mapSize.height = 1024;
pointLight.shadow.camera.near = 0.1;
pointLight.shadow.camera.far = 5;

pointLight.position.set(-1, 1, 0);
scene.add(pointLight);

const pointHelper = new THREE.CameraHelper(pointLight.shadow.camera);
pointHelper.visible = false;
scene.add(pointHelper);

/**
 * Materials
 */
const material = new THREE.MeshStandardMaterial();
material.roughness = 0.7;
gui.add(material, "metalness").min(0).max(1).step(0.001);
gui.add(material, "roughness").min(0).max(1).step(0.001);

/**
 * Objects
 */

// casts, but doesn't receive shadow
const sphereGeo = new THREE.SphereGeometry(0.5, 32, 32);
const sphere = new THREE.Mesh(sphereGeo, material);
sphere.castShadow = true;
// sphere.position.set(0, 0.1, 0);

// receives, but does not cast shadow
const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(7, 7),
  // for three.js generated shadows
  material
  // for baked shadows
  // new THREE.MeshBasicMaterial({
  //   map: bakedShadow,
  // })
);
plane.rotation.x = -Math.PI * 0.5;
plane.position.y = -0.5;
plane.receiveShadow = true;

scene.add(sphere, plane);

const sphereShadow = new THREE.Mesh(
  new THREE.PlaneBufferGeometry(1.5, 1.5),
  new THREE.MeshBasicMaterial({
    // color: 0xff00ff,
    color: 0x000000,
    transparent: true,
    alphaMap: simpleShadow,
  })
);
// flip it over
sphereShadow.rotation.x = -Math.PI * 0.5;
sphereShadow.position.y = plane.position.y + 0.01;
scene.add(sphereShadow);
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
camera.position.z = 2;
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
// _______________________ enable
// renderer.shadowMap.enabled = true;
renderer.shadowMap.enabled = false;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

/**
 * Animate
 */
const clock = new THREE.Clock();

console.log(sphereGeo.parameters);
const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // update sphere (up and down for simple shadow texture)
  // x + z (cos/x and sin/z create a horizontal circular movement)
  sphere.position.x = Math.cos(elapsedTime) * 1.5;
  sphere.position.z = Math.sin(elapsedTime) * 1.5;
  // we multiply by 3 and use the absolute (forcing the value to be positive or else it'll clip through the floor)
  sphere.position.y = Math.abs(Math.sin(elapsedTime * 3));

  // animate the shadow in the tick function (to follow the sphere). Reminds me of Peter Pan
  sphereShadow.position.x = sphere.position.x;
  sphereShadow.position.z = sphere.position.z;
  sphereShadow.material.opacity = (1.1 - sphere.position.y) * 0.4;

  // potential bounce mesh animation
  sphereGeo.parameters.radius = 0.5;
  if (sphere.position.y < 0.01) {
    // console.log('bounce')
    // sphereGeo.parameters.radius = 0.48;
  }

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
