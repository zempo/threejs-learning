import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import gsap from "gsap";

const gui = new dat.GUI({ closed: false, width: 400 });

const debugObj = {
  color: 0xffffff,
  // Spin button animation
  spinSphere: () => {
    let yDist = sphere.rotation.y;
    gsap.to(sphere.rotation, { duration: 1, y: yDist + Math.PI * 12 });
  },
  spinPlane: () => {
    let xDist = plane.rotation.x;
    gsap.to(plane.rotation, { duration: 1, x: xDist + Math.PI * 12 });
  },
  spinTorus: () => {
    let zDist = torus.rotation.z;
    gsap.to(torus.rotation, { duration: 1, z: zDist + Math.PI * 12 });
  },
  spinAll: () => {
    debugObj.spinPlane();
    debugObj.spinSphere();
    debugObj.spinTorus();
  },
};

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

// Textures
const textureLoader = new THREE.TextureLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();

const doorColorTexture = textureLoader.load("/textures/door/color.jpg");
const doorAlphaTexture = textureLoader.load("/textures/door/alpha.jpg");
const doorAmbientOcclusionTexture = textureLoader.load(
  "/textures/door/ambientOcclusion.jpg"
);
const doorHeightTexture = textureLoader.load("/textures/door/height.jpg");
const doorNormalTexture = textureLoader.load("/textures/door/normal.jpg");
const doorMetalnessTexture = textureLoader.load("/textures/door/metalness.jpg");
const doorRoughnessTexture = textureLoader.load("/textures/door/roughness.jpg");
const matcapTextures = {
  t1: textureLoader.load("/textures/matcaps/1.png"),
  t2: textureLoader.load("/textures/matcaps/2.png"),
  t3: textureLoader.load("/textures/matcaps/3.png"),
  t4: textureLoader.load("/textures/matcaps/4.png"),
  t5: textureLoader.load("/textures/matcaps/5.png"),
  t6: textureLoader.load("/textures/matcaps/6.png"),
  t7: textureLoader.load("/textures/matcaps/7.png"),
  t8: textureLoader.load("/textures/matcaps/8.png"),
};
const gradientTexture = textureLoader.load("/textures/gradients/5.jpg");
// To ensure a cartoonish result
gradientTexture.minFilter = THREE.NearestFilter;
gradientTexture.magFilter = THREE.NearestFilter;
gradientTexture.generateMipmaps = false;

const environmentMapTexture = cubeTextureLoader.load([
  "/textures/environmentMaps/0/px.jpg",
  "/textures/environmentMaps/0/nx.jpg",
  "/textures/environmentMaps/0/py.jpg",
  "/textures/environmentMaps/0/ny.jpg",
  "/textures/environmentMaps/0/pz.jpg",
  "/textures/environmentMaps/0/nz.jpg",
]);
/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * OBJECTS
 * BASIC MATERIAL
 * =============
 *
 */
// const material = new THREE.MeshBasicMaterial({
//   map: doorColorTexture,
//   //   alphaMap: doorAlphaTexture,
//   // Try to avoid using double-side, if possible
//   // Puts a a strain on gpu.
//   side: THREE.DoubleSide,
//   opacity: 0.85,
//   transparent: true,
//   wireframe: false,
// });
/**
 * NORMALS
 * =========
 *
 * Lighting, reflection, refraction
 *
 * Mostly
 * Has a unique "flatShading" property
 */
// Information outside the face
// const material = new THREE.MeshNormalMaterial({
//   side: THREE.DoubleSide,
//   // Flattens the faces, great for debugging
//   //   flatShading: true,
// });

/**
 * MESH MATCAP MATERIAL
 * ============
 *
 * Will display a color by using normals
 * as a reference to pick the right color on a texture
 * that looks like a sphere.
 *
 * Useful Links
 * -------
 * https://github.com/nidorx/matcaps
 *
 */
// const material = new THREE.MeshMatcapMaterial({
//   matcap: matcapTextures.t3,
//   side: THREE.DoubleSide,
//   //   transparent: true,
//   //   opacity: 0.9,
// });

/**
 * MESH DEPTH MATERIAL
 * ===================
 * Colors geometry white when close
 * to camera
 * Black when far
 *
 * This can be useful for fog
 * Or hazes
 *
 */
// const material = new THREE.MeshDepthMaterial({
//   side: THREE.DoubleSide,
// });

/**
 * MESH LAMBERT MATERIAL
 * =============
 *
 * Light-Reactive Material
 * Very Basic
 * Very Performant
 * But has some strange patterns
 */
// const material = new THREE.MeshLambertMaterial({
//   //   map: matcapTextures.t3,
//   color: "pink",
//   side: THREE.DoubleSide,
// });

/**
 * MESH PHONG MATERIAL
 * =============
 *
 * Has a more realistic "reflective"
 * Less performant, but looks sexier
 *
 * Another Light-Reactive Material
 * Looks better than meshLambertMaterial
 */
// const material = new THREE.MeshPhongMaterial({
//   //   map: matcapTextures.t3,
//   color: "lightgray",
//   shininess: 100,
//   // alters reflection color
//   //   specular: new THREE.Color(0x1188ff),
//   side: THREE.DoubleSide,
// });

/**
 * MESH TOON MATERIAL
 * ============
 *
 * Cartoon-ish material
 * Good for gradients
 */
// const material = new THREE.MeshToonMaterial({
//   //   map: matcapTextures.t3,
//   gradientMap: gradientTexture,
//   //   shininess: 100,
//   side: THREE.DoubleSide,
// });

/**
 * MESH STANDARD MATERIAL
 * ================
 *
 * The BEST for light reactivity
 * Least performant
 * Most Realistic
 *
 * Roughness/Metalness
 */
const material = new THREE.MeshStandardMaterial({
  color: debugObj.color,
  side: THREE.DoubleSide,
  // ---------------- comment out below
  //   map: doorColorTexture,
  //     alphaMap: doorAlphaTexture,
  //     transparent: true,
  //   // Shadows
  //   aoMap: doorAmbientOcclusionTexture,
  //   aoMapIntensity: 1,
  //   // Height/Displacement
  //   displacementMap: doorHeightTexture,
  //   displacementScale: 0.05,
  //   metalnessMap: doorMetalnessTexture,
  //   roughnessMap: doorRoughnessTexture,
  //   normalMap: doorNormalTexture,
  //   roughness: 0.9,
  //   metalness: 0.5,
  // ---------------- comment out above
  // If we want a reflection, instead
  envMap: environmentMapTexture,
  roughness: 0.2,
  metalness: 0.9,
});

material.normalScale.set(0.5, 0.5);

gui.add(material, "aoMapIntensity").min(1).max(3).step(0.0001);
gui
  .addColor(debugObj, "color")
  .onChange(() => {
    material.color.set(debugObj.color);
  })
  .name("Change Color");

gui.add(material, "metalness").min(0).max(1).step(0.0001);
gui.add(material, "roughness").min(0).max(1).step(0.0001);
// gui.add(material, "displacementScale").min(0).max(1).step(0.0001);

const sphere = new THREE.Mesh(
  new THREE.SphereBufferGeometry(0.5, 100, 100),
  material
);
sphere.geometry.setAttribute(
  "uv2",
  new THREE.BufferAttribute(sphere.geometry.attributes.uv.array, 2)
);

const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 100, 100), material);
plane.geometry.setAttribute(
  "uv2",
  new THREE.BufferAttribute(plane.geometry.attributes.uv.array, 2)
);
// simple box
const box = new THREE.Mesh(new THREE.BoxBufferGeometry(10, 10, 10), material);
// const box = new THREE.Mesh(new THREE.BoxBufferGeometry(1, 1, 1), material);
box.geometry.setAttribute(
  "uv2",
  new THREE.BufferAttribute(box.geometry.attributes.uv.array, 2)
);

const torus = new THREE.Mesh(
  new THREE.TorusBufferGeometry(0.5, 0.2, 64, 128),
  material
);
torus.geometry.setAttribute(
  "uv2",
  new THREE.BufferAttribute(torus.geometry.attributes.uv.array, 2)
);

sphere.position.x = -1.5;
torus.position.x = 1.5;
box.position.y = 0;

scene.add(sphere, plane, box, torus);

/**
 * BASIC LIGHTS
 * ==========
 * Will expand upon this in later lessons
 *
 * .AmbiantLight(color, intensity (0 - 1))
 */
const ambiantLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambiantLight);

const pointLight = new THREE.PointLight(0xffffff, 0.6);
pointLight.position.x = 2;
pointLight.position.y = 3;
pointLight.position.z = 4;
scene.add(pointLight);
/**
 * CONTROLS
 */
// Toggle visibility
gui.add(sphere, "visible").name("Toggle Sphere Appearance");
gui.add(plane, "visible").name("Toggle Plane Appearance");
gui.add(torus, "visible").name("Toggle Torus Appearance");

// Toggle wireframe
// gui.add(material, "wireframe").name("Toggle Mesh Wireframe");

// Spin on Z
// gui.add(debugObj, "spinSphere").name("Spin Sphere");
// gui.add(debugObj, "spinPlane").name("Spin Plane");
// gui.add(debugObj, "spinTorus").name("Spin Torus");
// gui.add(debugObj, "spinAll").name("Spin All");

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

  // Update Objects
  sphere.rotation.y = elapsedTime * 0.2;
  plane.rotation.x = elapsedTime * 0.2;
  torus.rotation.z = elapsedTime * 0.2;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
