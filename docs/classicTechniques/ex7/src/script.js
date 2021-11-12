import "./style.css";
import * as THREE from "three";
// lil-gui works with current node 17,
// import * as dat from "lil-gui";
// dat.gui is better, but only works with node 16
import * as dat from "dat.gui";
import gsap from "gsap";

/**
 * HTML + THREE JS
 * ----------------------------
 *
 * To fix that, we could have set the background-color of the page to the same color as the clearColor of the renderer.
 * Instead, we are going to make the clearColor transparent and only set the background-color on the page.
 *
 * To do that, in /src/script.js, you need to set the alpha property to true on the WebGLRenderer:
 *
 * Unfortunately, it seems that the objects are now black.
 * The reason is that the MeshToonMaterial is one of the Three.js materials that appears only when there is light.
 *
 */

/**
 * Debug
 */
const gui = new dat.GUI();

const parameters = {
  materialColor: 0x9c12e8,
  objDistance: 4,
  particleCount: 500,
  particlesColor: 0xffffff,
  particleSize: 0.015,
};

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Texture
/**
 * Not the toon effect we were expecting.
 * The reason is that the texture is a very small image composed of 3 pixels going from dark to bright.
 *  By default, instead of picking the nearest pixel on the texture, WebGL will try to interpolate the pixels.
 *  That's usually a good idea for the look of our experiences, but in this case, it creates a gradient instead of a toon effect.
 * To fix that, we need to set the magFilter of the texture to THREE.NearestFilter
 *  so that the closest pixel is used without interpolating it with neighbor pixels:
 *
 */
const textureLoader = new THREE.TextureLoader();
const TEXTURES = {
  gradient: textureLoader.load("textures/gradients/3.jpg"),
};
TEXTURES.gradient.magFilter = THREE.NearestFilter;

const GEOS = {
  torus: new THREE.TorusGeometry(1, 0.4, 16, 60),
  cone: new THREE.ConeGeometry(1, 2, 32),
  torusKnot: new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
  particles: null,
};

const MATS = {
  m1: new THREE.MeshToonMaterial({
    color: parameters.materialColor,
    gradientMap: TEXTURES.gradient,
  }),
  p1: null,
};

const MESHES = {
  obj1: new THREE.Mesh(GEOS.torus, MATS.m1),
  obj2: new THREE.Mesh(GEOS.cone, MATS.m1),
  obj3: new THREE.Mesh(GEOS.torusKnot, MATS.m1),
  obj4: null,
};

const sectionMeshes = [MESHES.obj1, MESHES.obj2, MESHES.obj3];
let pointsGroup = null;
// new THREE.Points(GEOS.particles, MATS.p1)
const initializePoints = () => {
  GEOS.particles = new THREE.BufferGeometry();

  pointsGroup = new THREE.Group();
};

const initializeMats = () => {
  const { particlesColor, particleSize } = parameters;
  MATS.p1 = new THREE.PointsMaterial({
    color: particlesColor,
    sizeAttenuation: true,
    size: particleSize,
  });
};

/**
 * For the y (vertical) it's a bit more tricky.
 *  We need to make the particles start high enough
 *  and then spread far enough below so that we reach the end with the scroll.
 *
 * To do that, we can use the objectsDistance variable
 * and multiply by the number of objects which is the length of the sectionMeshes array:
 *
 */
const generatePoints = () => {
  const { particleCount, objDistance } = parameters;
  // disposal
  if (MESHES.obj4 !== null) {
    GEOS.particles.dispose();
    MATS.p1.dispose();
    scene.remove(pointsGroup);
  }

  initializePoints();

  let positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 1] =
      objDistance * 0.5 - Math.random() * objDistance * sectionMeshes.length;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
  }

  GEOS.particles.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );

  initializeMats();

  MESHES.obj4 = new THREE.Points(GEOS.particles, MATS.p1);
  pointsGroup.add(MESHES.obj4);
  scene.add(pointsGroup);
};

generatePoints();

// scene.add(MESHES.obj4);

/**
 * POSITIONING
 *
 * By default, in Three.js, the field of view is vertical.
 *  This means that if you put one object on the top part of the render
 * and one object on the bottom part of the render and then you resize the window,
 *  you'll notice that the objects stay put at the top and at the bottom.
 *
 */
for (let i = 0; i < sectionMeshes.length; i++) {
  scene.add(sectionMeshes[i]);
}

function positionObjects(distance) {
  let i = 0;
  for (const mesh of sectionMeshes) {
    mesh.position.y = -(distance * i);
    i % 2 === 0 ? (mesh.position.x = 2) : (mesh.position.x = -2);
    // console.log(mesh.position.y);
    i++;
    // add meshes
  }
}

positionObjects(parameters.objDistance);

const f1 = gui.addFolder("Object Properties");

f1.addColor(parameters, "materialColor")
  .onChange(() => {
    MATS.m1.color.set(parameters.materialColor);
  })
  .name("Color");

const f2 = gui.addFolder("Particle Properties");

f2.addColor(parameters, "particlesColor")
  .onChange(() => {
    MATS.p1.color.set(parameters.particlesColor);
  })
  .name("Color");

f2.add(parameters, "particleSize")
  .min(0.001)
  .max(0.1)
  .step(0.001)
  .name("Size")
  .onFinishChange(generatePoints);
f2.add(parameters, "particleCount")
  .min(100)
  .max(10000)
  .step(50)
  .name("count")
  .onFinishChange(generatePoints);

// f1.add(parameters, "objDistance").min(0).max(5).step(0.01).name("Distance");
// .onChange(positionObjects(parameters.objDistance));

/**
 * Lights
 */
const LIGHTS = {
  dir: new THREE.DirectionalLight("#ffffff", 1),
};
LIGHTS.dir.position.set(1, 1, 0);
scene.add(LIGHTS.dir);

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
 *
 * For the second issue, the problem is that we update
 *  the camera.position.y twice and the second one will replace the first one.
 *
 * To fix that, we are going to put the camera in a Group and apply the parallax on the group and not the camera itself.
 *
 * Right before instantiating the camera, create the Group, add it to the scene and add the camera to the Group:
 *
 */
// Group
const cameraGroup = new THREE.Group();
scene.add(cameraGroup);

// Base camera
const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.z = 6;
cameraGroup.add(camera);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
});
// 0, by default, but we can also set this ourselves
renderer.setClearAlpha(0);

renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

const animateMeshes = (time) => {
  for (const mesh of sectionMeshes) {
    mesh.rotation.x = time * 0.1;
    mesh.rotation.y = time * 0.12;
  }
};

/**
 * Scroll
 *
 * scrollY contains the amount of pixels that have been scrolled.
 * If we scroll 1000 pixels (which is not that much),
 *  the camera will go down of 1000 units in the scene (which is a lot).
 *
 * Each section has exactly the same size as the viewport.
 * This means that when we scroll the distance of one viewport height,
 *  the camera should reach the next object.
 *
 * To do that, we need to divide scrollY by the height of the viewport which is sizes.height:
 *
 */
let scrollY = window.scrollY;
let currentSection = 0;

window.addEventListener("scroll", () => {
  scrollY = window.scrollY;

  // divide viewport into sections for animation purposes
  const newSection = Math.round(scrollY / sizes.height);

  if (newSection != currentSection) {
    currentSection = newSection;

    // console.log("changed", currentSection);
    gsap.to(sectionMeshes[currentSection].rotation, {
      duration: 1.5,
      ease: "power2.inOut",
      x: "+=6",
      y: "+=3",
      z: "+=1.5",
    });
  }
});

/**
 * PARALLAX
 * ------------
 *
 * We call parallax the action of seeing one object through different observation points.
 *  This is done naturally by our eyes and it's how we feel the depth of things.
 *
 * To make our experience more immersive,
 * we are going to apply this parallax effect by making the camera move
 * horizontally and vertically according to the mouse movements.
 *  It'll create a natural interaction, and help the user feel the depth.
 *
 * We know that the camera will be able to go as much on the left as on the right.
 *  This is why, instead of a value going from 0 to 1 it's better to have a value going from -0.5 to 0.5.
 */
const cursor = {};
cursor.x = 0;
cursor.y = 0;

const animateCamera = (time) => {
  // camera.position.y = -scrollY;
  // camera.position.y = - scrollY / sizes.height
  camera.position.y = (-scrollY / sizes.height) * parameters.objDistance;

  const parallaxX = cursor.x * 0.5;
  const parallaxY = -cursor.y * 0.5;
  // cameraGroup.position.x = parallaxX;
  // cameraGroup.position.y = parallaxY;

  // recursive camera motion seems more natural to the eyes
  // cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 0.1;
  // cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 0.1;

  // time optimization
  cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 5 * time;
  cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 5 * time;
};

window.addEventListener("mousemove", (event) => {
  // cursor.x = event.clientX;
  // cursor.y = event.clientY;
  // cursor.x = event.clientX / sizes.width;
  // cursor.y = event.clientY / sizes.height;

  // from -.5,.5 vs 0-1
  cursor.x = event.clientX / sizes.width - 0.5;
  cursor.y = event.clientY / sizes.height - 0.5;

  // console.log(cursor);
});

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  animateMeshes(elapsedTime);
  animateCamera(deltaTime);
  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
