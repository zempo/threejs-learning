import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import { RectAreaLightHelper } from "three/examples/jsm/helpers/RectAreaLightHelper.js";

/**
 * =================
 * LIGHTING
 * =================
 *
 * Adding lights is as simple as adding a mesh
 * You just need the correct classes and you add it to the scene.
 *
 *
 * AMBIANT LIGHT: provides omnidirectional lighting
 * Simulates light being scattered and bounced around an object
 * from the sun/light source
 *
 * DIRECTIONAL LIGHT: Has a sun-like effect as if sun-rays were traveling in parrellel.
 * from a specific direction
 *
 * HEMISPHERE LIGHT: A light source positioned directly above the scene, with color fading from the sky color to the ground color.
 *
 * POINT LIGHT: A light that gets emitted from a single point in all directions.
 *  A common use case for this is to replicate the light emitted from a bare lightbulb.
 *
 * RECT AREA LIGHT: RectAreaLight emits light uniformly across the face a rectangular plane.
 * This light type can be used to simulate light sources such as bright windows or strip lighting.
 *
 * SPOT LIGHT: This light gets emitted from a single point in one direction,
 *  along a cone that increases in size the further from the light it gets.
 *
 * ---------------------------------
 * Lights are EXPENSIVE
 *
 * Low cost lights: ambient/hemisphere (25-50)
 * Moderate Light: directional, point (5-15)
 * High cost lights: rect area, spot (2-3)
 *
 * -----------------------------
 * BAKING LIGHT: bake light into texture, 3d software, cannot move the light around anymore (baked inside the textures)
 *--------------------------------------------
 * HELPERS: assist us positioning lights
 *
 *
 */

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

const controlNodes = {
  color: 0xffffff,
  ambColor: 0xffffff,
  dirColor: 0x00fffc,
  hemiSkyColor: 0xff0000,
  hemiGroundColor: 0x0000ff,
  pointColor: 0xff9000,
  rectAreaColor: 0x4e00ff,
  spotColor: 0x78ff00,
  wireframe: false,
  roughness: 0.4,
  metalness: 0.4,
  ambIntensity: 0.5,
  dirIntensity: 0.3,
  hemiIntensity: 0.3,
  pointIntensity: 0.5,
  rectAreaIntensity: 2,
  spotIntensity: 0.5,
  rectWidth: 1,
  rectHeight: 1,
  pointDistance: 3,
  pointDecay: 2,
  spotCastShadow: true,
  spotDistance: 10,
  spotAngle: Math.PI * 0.1,
  spotPenumbra: 0.25,
  spotDecay: 1,
};

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Lights
 */
// Starter
//--------------------------------------
// const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
// scene.add(ambientLight)

// const pointLight = new THREE.PointLight(0xffffff, 0.5)
// pointLight.position.x = 2
// pointLight.position.y = 3
// pointLight.position.z = 4
// scene.add(pointLight)
// ------------------------------------------

// comes from the surroundings
const ambiantLight = new THREE.AmbientLight(
  controlNodes.ambColor,
  controlNodes.ambIntensity
);
scene.add(ambiantLight);

// from a specific direction
const directionalLight = new THREE.DirectionalLight(
  controlNodes.dirColor,
  controlNodes.dirIntensity
);

scene.add(directionalLight);

// different sky && ground colors, unlike ambiant light
const hemisphereLight = new THREE.HemisphereLight(
  controlNodes.hemiSkyColor,
  controlNodes.hemiGroundColor,
  controlNodes.hemiIntensity
);
scene.add(hemisphereLight);

// from a specific point, "intensity" is controlled by relative position and distance, not actual intensity
const pointLight = new THREE.PointLight(
  controlNodes.pointColor,
  controlNodes.pointIntensity,
  controlNodes.pointDistance,
  controlNodes.pointDecay
);
pointLight.position.set(1, -0.25, 1);
scene.add(pointLight);

// a mix of direction and diffuse light, color/intensity/width/height
// works like big rectangle lights from photoshoots
// **only works with meshstandardmaterial and meshphysicalmaterial
const rectAreaLight = new THREE.RectAreaLight(
  controlNodes.rectAreaColor,
  controlNodes.rectAreaIntensity,
  controlNodes.rectWidth,
  controlNodes.rectHeight
);
rectAreaLight.position.set(-1.5, 0, 1.5);
// MUST set position first
rectAreaLight.lookAt(new THREE.Vector3());
scene.add(rectAreaLight);

// spotlight is like a "flashlight" or cone of light
// staring at a point and oriented in a direction
const spotLight = new THREE.SpotLight(
  controlNodes.spotColor,
  controlNodes.spotIntensity,
  controlNodes.spotDistance,
  // from spotlight origin
  controlNodes.spotAngle,
  // light edge "sharpness"
  controlNodes.spotPenumbra,
  controlNodes.spotDecay
);
spotLight.position.set(0, 2, 3);
scene.add(spotLight);

// the target is a theoretical object, we have to add to the scene
spotLight.target.position.x = -0.75;
scene.add(spotLight.target);

///====================================================================
// ------------------------ helper(light, relative size of helper)
const hemiLightHelper = new THREE.HemisphereLightHelper(hemisphereLight, 0.2);
scene.add(hemiLightHelper);

const dirLightHelper = new THREE.DirectionalLightHelper(directionalLight, 0.2);
scene.add(dirLightHelper);

const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.2);
scene.add(pointLightHelper);

const spotLightHelper = new THREE.SpotLightHelper(spotLight);
scene.add(spotLightHelper);
window.requestAnimationFrame(() => {
  spotLightHelper.update();
  hemiLightHelper.update();
});

const rectLightHelper = new RectAreaLightHelper(rectAreaLight);
scene.add(rectLightHelper);
// ===========================================================================================
/**
 * Objects
 */
// Material
const material = new THREE.MeshStandardMaterial({
  roughness: controlNodes.roughness,
  wireframe: controlNodes.wireframe,
  color: controlNodes.color,
  side: THREE.DoubleSide,
});

// Objects
const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), material);
sphere.position.x = -1.5;

const cube = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.75, 0.75), material);

const torus = new THREE.Mesh(
  new THREE.TorusGeometry(0.3, 0.2, 32, 64),
  material
);
torus.position.x = 1.5;

const plane = new THREE.Mesh(new THREE.PlaneGeometry(7, 7), material);
plane.rotation.x = -Math.PI * 0.5;
plane.position.y = -0.65;

scene.add(sphere, cube, torus, plane);

// ------------------------------------------
let f0 = gui.addFolder("Material Props");
f0.add(material, "roughness")
  .min(0)
  .max(1)
  .step(0.01)
  .name("Material Roughness");
f0.add(material, "wireframe").name("wireframe toggle");
f0.addColor(controlNodes, "color").onChange(() => {
  material.color.set(controlNodes.color);
});

//--------------------------------------
let f1 = gui.addFolder("Ambiant Light");
f1.add(ambiantLight, "intensity")
  .min(0)
  .max(1)
  .step(0.01)
  .name("Amb Intensity");
f1.addColor(controlNodes, "ambColor")
  .onChange(() => {
    ambiantLight.color.set(controlNodes.ambColor);
  })
  .name("Amb Color");

//--------------------------------------
let f2 = gui.addFolder("Directional Light");
f2.add(directionalLight, "intensity")
  .min(0)
  .max(1)
  .step(0.01)
  .name("Dir Intensity");
f2.add(directionalLight.position, "y").min(-3).max(3).step(0.01).name("Dir Y");
f2.add(directionalLight.position, "x").min(-3).max(3).step(0.01).name("Dir X");
f2.add(directionalLight.position, "z").min(-3).max(3).step(0.01).name("Dir Z");
f2.addColor(controlNodes, "dirColor")
  .onChange(() => {
    directionalLight.color.set(controlNodes.dirColor);
  })
  .name("Dir Color");

//--------------------------------------
let f3 = gui.addFolder("Hemisphere Light");
f3.add(hemisphereLight, "intensity")
  .min(0)
  .max(1)
  .step(0.01)
  .name("Hemi Intensity");
f3.addColor(controlNodes, "hemiSkyColor")
  .onChange(() => {
    hemisphereLight.color.set(controlNodes.hemiSkyColor);
  })
  .name("Hemi Sky");

f3.addColor(controlNodes, "hemiGroundColor")
  .onChange(() => {
    hemisphereLight.groundColor.set(controlNodes.hemiGroundColor);
  })
  .name("Hemi Ground");

//--------------------------------------
let f4 = gui.addFolder("Point Light");
f4.add(pointLight, "intensity")
  .min(0)
  .max(1)
  .step(0.01)
  .name("Point Intensity");
f4.add(pointLight, "distance").min(0).max(10).step(0.01).name("Point Distance");
f4.add(pointLight, "decay").min(0).max(5).step(1).name("Point Decay");
f4.add(pointLight.position, "y").min(-10).max(10).step(0.01).name("Point Y");
f4.add(pointLight.position, "x").min(-10).max(10).step(0.01).name("Point X");
f4.add(pointLight.position, "z").min(-10).max(10).step(0.1).name("Point Z");
f4.addColor(controlNodes, "pointColor")
  .onChange(() => {
    pointLight.color.set(controlNodes.pointColor);
  })
  .name("Point Color");

//--------------------------------------
let f5 = gui.addFolder("Rect Area Light");
f5.add(rectAreaLight, "intensity")
  .min(0)
  .max(10)
  .step(0.01)
  .name("Rect Intensity");
f5.add(rectAreaLight, "width").min(0).max(20).step(0.01).name("Rect Width");
f5.add(rectAreaLight, "height").min(0).max(20).step(0.01).name("Rect Height");
f5.addColor(controlNodes, "rectAreaColor")
  .onChange(() => {
    rectAreaLight.color.set(controlNodes.rectAreaColor);
  })
  .name("Rect color");

//--------------------------------------
let f6 = gui.addFolder("Spot Light");
f6.add(spotLight, "intensity").min(0).max(1).step(0.01).name("Spot Intensity");
f6.add(spotLight, "distance").min(0).max(10).step(0.01).name("Spot Distance");
f6.add(spotLight, "angle").min(0).max(Math.PI).step(0.01).name("Spot Angle");
f6.add(spotLight, "distance").min(0).max(10).step(0.01).name("Spot Distance");
f6.add(spotLight, "penumbra").min(0).max(1).step(0.01).name("Spot Penumbra");
f6.addColor(controlNodes, "spotColor")
  .onChange(() => {
    spotLight.color.set(controlNodes.spotColor);
  })
  .name("Spot Color");

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

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update objects
  sphere.rotation.y = 0.1 * elapsedTime;
  cube.rotation.y = 0.1 * elapsedTime;
  torus.rotation.y = 0.1 * elapsedTime;

  sphere.rotation.x = 0.15 * elapsedTime;
  cube.rotation.x = 0.15 * elapsedTime;
  torus.rotation.x = 0.15 * elapsedTime;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
