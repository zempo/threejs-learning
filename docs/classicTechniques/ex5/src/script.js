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
    count: 200000,
    radius: 5,
    randomness: 0.3,
    randomnessPower: 4,
    size: 0.005,
    spin: 1,
    angleX: 0,
    angleY: 0,
    angleZ: 0,
    // 30ff91 1
    // ffff30
    insideColor: 0xff6030,
    // ff30e3 1
    // 1b3984
    outsideColor: 0x1b3984,
  },
  space: {
    background: "/textures/bg.jpg",
    rotation: 0.25,
  },
};

const loader = new THREE.TextureLoader();
loader.setCrossOrigin("");

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();
let bgWidth, bgHeight;
let bgTexture = loader.load(PARAMS.space.background, function (texture) {
  let img = texture.image;
  bgWidth = img.width;
  bgHeight = img.height;
  //   resize();
});
scene.background = bgTexture;
bgTexture.wrapS = THREE.MirroredRepeatWrapping;
bgTexture.wrapT = THREE.MirroredRepeatWrapping;

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
let pointsGroup = null;

//==============================================================

// GALAXY HELPERS
// -------------
const initializeGeo = () => {
  GEOS.galaxy = new THREE.BufferGeometry();
  pointsGroup = new THREE.Group();
};

const initializeMat = () => {
  const { size } = PARAMS.galaxy;

  MATS.galaxy = new THREE.PointsMaterial({
    size,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  });
};

// NOTES
/**
 * GALAXY LAYOUT NOTES
 * ------------------------
 * We can use Math.cos(...) and Math.sin(...) to position the particles on those branches.
 * -> We first calculate an angle with the modulo (%)
 * -> Divide the result by the branches count parameter to get an angle between 0 and 1
 * -> multiply this value by Math.PI * 2 to get an angle between 0 and a full circle.
 *
 * -> We then use that angle with Math.cos(...) and Math.sin(...) for the x and the z axis
 * -> Then we finally multiply by the radius:
 *
 * Then we can multiply the spinAngle by that spin parameter.
 * To put it differently, the further each particle is from the center, the more spin it'll endure:
 *
 *     Just spin, radius and branches
 *   ------------
 *  positions[i3] = Math.cos(branchAngle + spinAngle) * galaxyRadius;
 *  positions[i3 + 1] = 0;
 *  positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * galaxyRadius;
 *
 */
const generateGalaxy = () => {
  const {
    branches,
    count,
    radius,
    randomness,
    randomnessPower,
    spin,
    angleX,
    angleY,
    angleZ,
  } = PARAMS.galaxy;

  // Disposal
  if (points !== null) {
    GEOS.galaxy.dispose();
    MATS.galaxy.dispose();
    scene.remove(pointsGroup);
  }
  //------------------------
  // initial new geometries/material inside function
  initializeGeo();

  let positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const galaxyRadius = Math.random() * radius;
    const branchAngle = ((i % branches) / branches) * Math.PI * 2;
    const spinAngle = galaxyRadius * spin;

    // Randomness and exponential spread
    const randPos = {
      //   x/y/z: (Math.random() - 0.5) * randomness * galaxyRadius,
      x:
        Math.pow(Math.random(), randomnessPower) *
        (Math.random() < 0.5 ? 1 : -1) *
        randomness *
        galaxyRadius,
      y:
        Math.pow(Math.random(), randomnessPower) *
        (Math.random() < 0.5 ? 1 : -1) *
        randomness *
        galaxyRadius,
      z:
        Math.pow(Math.random(), randomnessPower) *
        (Math.random() < 0.5 ? 1 : -1) *
        randomness *
        galaxyRadius,
    };

    positions[i3] =
      Math.cos(branchAngle + spinAngle) * galaxyRadius + randPos.x;
    positions[i3 + 1] = randPos.y;
    positions[i3 + 2] =
      Math.sin(branchAngle + spinAngle) * galaxyRadius + randPos.z;

    // Color
    let colorInside = new THREE.Color(PARAMS.galaxy.insideColor);
    let colorOutside = new THREE.Color(PARAMS.galaxy.outsideColor);

    const mixedColor = colorInside.clone();
    mixedColor.lerp(colorOutside, galaxyRadius / PARAMS.galaxy.radius);

    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;
  }

  GEOS.galaxy.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  GEOS.galaxy.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  // initialize the material with the new colors
  initializeMat();

  points = new THREE.Points(GEOS.galaxy, MATS.galaxy);
  pointsGroup.add(points);
  pointsGroup.rotation.set(
    Math.PI * 0.5 * angleX,
    Math.PI * 0.5 * angleY,
    Math.PI * 0.5 * angleZ
  );
  scene.add(pointsGroup);
};

generateGalaxy();
// ===================================================

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
f3.add(PARAMS.galaxy, "randomnessPower")
  .min(1)
  .max(10)
  .step(0.001)
  .onFinishChange(generateGalaxy);

let f4 = gui.addFolder("Galaxy Orientation");
f4.add(PARAMS.galaxy, "angleX")
  .min(-2)
  .max(2)
  .step(0.001)
  .name("Rotation X")
  .onFinishChange(generateGalaxy);
f4.add(PARAMS.galaxy, "angleY")
  .min(-2)
  .max(2)
  .step(0.001)
  .name("Rotation Y")
  .onFinishChange(generateGalaxy);
f4.add(PARAMS.galaxy, "angleZ")
  .min(-2)
  .max(2)
  .step(0.001)
  .name("Rotation Z")
  .onFinishChange(generateGalaxy);

let f5 = gui.addFolder("Galaxy Colors");
f5.addColor(PARAMS.galaxy, "insideColor").onFinishChange(generateGalaxy);
f5.addColor(PARAMS.galaxy, "outsideColor").onFinishChange(generateGalaxy);

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

  var aspect = window.innerWidth / window.innerHeight;
  var texAspect = bgWidth / bgHeight;
  var relAspect = aspect / texAspect;

  bgTexture.repeat = new THREE.Vector2(
    Math.max(relAspect, 1),
    Math.max(1 / relAspect, 1)
  );
  bgTexture.offset = new THREE.Vector2(
    -Math.max(relAspect - 1, 0) / 2,
    -Math.max(1 / relAspect - 1, 0) / 2
  );

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
controls.autoRotate = true;
controls.autoRotateSpeed = PARAMS.space.rotation;
controls.enableDamping = true;
f4.add(PARAMS.space, "rotation")
  .min(-5)
  .max(5)
  .onFinishChange(function () {
    controls.autoRotateSpeed = PARAMS.space.rotation;
    controls.update();
  })
  .name("Galaxy Rotation");

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
