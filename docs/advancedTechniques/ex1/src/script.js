import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
// import * as dat from 'lil-gui'
import * as dat from "dat.gui";
import CANNON from "cannon";

/**
 * LESSON NOTES
 * -------------------
 * The idea is simple. We are going to create a physics world.
 *  This physics world is purely theoretical, and we cannot see it.
 *  But in this world, things fall, collide, rub, slide, etc.
 *
 * When we create a Three.js mesh, we will also create a version of that mesh inside the physics world.
 *  If we make a Box in Three.js, we also create a box in the physics world.
 *
 * Then, on each frame, before rendering anything, we tell the physics world to update itself;
 * we take the coordinates (position and rotation) of the physics objects and apply them to the corresponding Three.js mesh.
 *
 * For 3D physics, there are three main libraries:
 * ====================
 * Ammo.js
 *      Website: http://schteppe.github.io/ammo.js-demos/
 *      Git repository: https://github.com/kripken/ammo.js/
 *      Documentation: No documentation
 *      Direct JavaScript port of Bullet (a physics engine written in C++), A little heavy, Still updated by a community
 * -----------------
 * Cannon.js
 *      Website: https://schteppe.github.io/cannon.js/
 *      Git repository: https://github.com/schteppe/cannon.js
 *      Documentation: http://schteppe.github.io/cannon.js/docs/
 *      Lighter than Ammo.js, More comfortable to implement than Ammo.js, Mostly maintained by one developer
 *      Hasn't been updated for many years, There is a maintained fork
 * ------------------
 * Oimo.js
 *      Website: https://lo-th.github.io/Oimo.js/
 *      Git repository: https://github.com/lo-th/Oimo.js
 *      Documentation: http://lo-th.github.io/Oimo.js/docs.html
 *      Lighter than Ammo.js, Easier to implement than Ammo.js
 *      Mostly maintained by one developer, Hasn't been updated for 2 years
 *=======================================================

 *  * There are many ways to apply forces to a Body:
 *
 *  - applyForce to apply a force to the Body from a specified point in space
 *    (not necessarily on the Body's surface) like the wind that pushes everything a little all the time,
 *     a small but sudden push on a domino or a greater sudden force to make an angry bird jump toward the enemy castle.
 *
 *  - applyImpulse is like applyForce but instead of adding to the force
 *    that will result in velocity changes, it applies directly to the velocity.
 *
 *  - applyLocalForce is the same as applyForce but the coordinates are local to the Body
 *    (meaning that 0, 0, 0 would be the center of the Body).
 *
 *  - applyLocalImpulse is the same as applyImpulse but the coordinates are local to the Body.
 *
 * 
 */

/**
 * Debug
 */
const gui = new dat.GUI();

const PARAMS = {
  color: 0x777777,
  mass: 1,
  gravX: 0,
  gravY: -9.82,
  gravZ: 0,
  friction: 0.1,
  restitution: 0.7,
};

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();

const environmentMapTexture = cubeTextureLoader.load([
  "/textures/environmentMaps/0/px.png",
  "/textures/environmentMaps/0/nx.png",
  "/textures/environmentMaps/0/py.png",
  "/textures/environmentMaps/0/ny.png",
  "/textures/environmentMaps/0/pz.png",
  "/textures/environmentMaps/0/nz.png",
]);

/**
 * Physics
 * ----------
 *
 * We can add gravity and collision physics
 */
const world = new CANNON.World();
world.gravity.set(PARAMS.gravX, PARAMS.gravY, PARAMS.gravZ);

/**
 * Test sphere
 */
// const sphere = new THREE.Mesh(
//   new THREE.SphereGeometry(0.5, 32, 32),
//   new THREE.MeshStandardMaterial({
//     metalness: 0.3,
//     roughness: 0.4,
//     envMap: environmentMapTexture,
//     envMapIntensity: 0.5,
//   })
// );
// sphere.castShadow = true;
// sphere.position.y = 0.5;
// scene.add(sphere);

/**
 * PHYSICS SPHERE REPRESENTATION
 * ---------
 * Has same radius
 *
 * To do that, we must create a Body.
 * Bodies are simply objects that will fall and collide with other bodies.
 *
 * Before we can create a Body, we must decide on a shape.
 *  There are many available primitive shapes like
 * Box, Cylinder, Plane, etc.
 *
 *  We will go for a Sphere with the same radius as our Three.js sphere:
 */
// const sphereShape = new CANNON.Sphere(0.5);
// const sphereBody = new CANNON.Body({
//   mass: PARAMS.mass,
//   position: new CANNON.Vec3(0, 3, 0),
//   shape: sphereShape,
// });

// world.addBody(sphereBody);

const GEOS = {
  sphere: new THREE.SphereGeometry(),
};

const MATS = {
  sphere: new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.7,
    roughness: 0.4,
    envMap: environmentMapTexture,
    envMapIntensity: 0.5,
  }),
};

// As parameters of this function, we will only pass the radius and the position,
// but feel free to add other parameters such as mass, material, subdivisions, etc.
const objectsToUpdate = [];
const matInstances = [];
const createSphere = (radius, pos) => {
  const newMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.4,
    roughness: 0.4,
    envMap: environmentMapTexture,
    envMapIntensity: 0.5,
  });
  newMat.color.setHex(Math.random() * 0xffffff);
  matInstances.push(newMat);
  const mesh = new THREE.Mesh(GEOS.sphere, newMat);
  mesh.castShadow = true;
  mesh.scale.set(radius, radius, radius);
  mesh.position.copy(pos);
  scene.add(mesh);

  const shape = new CANNON.Sphere(radius);
  const body = new CANNON.Body({
    mass: PARAMS.mass,
    position: new CANNON.Vec3(0, 3, 0),
    shape,
    material: defaultMat,
  });
  body.position.copy(pos);
  objectsToUpdate.push({ mesh, body });
  world.addBody(body);
};

const reset = () => {
  // console.log(objectsToUpdate);
  let len = objectsToUpdate.length;
  let i = 0;
  for (const obj of objectsToUpdate) {
    matInstances[i].dispose();
    scene.remove(obj.mesh);
    scene.remove(obj.body);
    i++;
  }
  console.log(`Yeeted ${len} objects from scene.`);
};

// Now we need to have the ball stop on the floor
const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body();
// mass of zero makes it a static object
floorBody.mass = 0;
floorBody.addShape(floorShape);
world.addBody(floorBody);

/**
 * We set the axis like if it was a spike going through the Body on the negative x axis
 * (to the left relatively to the camera)
 *
 * and we set the Angle to Math.PI * 0.5 (a quarter of a circle).
 * */
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5);

// const f1 = gui.addFolder("Sphere Props");

// f1.add(PARAMS, "mass").min(0).max(50).step(0.001).name("Sphere Mass");
// f1.addColor(PARAMS, "color").onChange(() => {
//   sphere.material.color.set(PARAMS.color);
// });

const f1 = gui.addFolder("Scene Physics");

f1.add(PARAMS, "gravX").min(-50).max(50).step(0.01).name("Grav X");
f1.add(PARAMS, "gravY").min(-50).max(50).step(0.01).name("Grav Y");
f1.add(PARAMS, "gravZ").min(-50).max(50).step(0.01).name("Grav Z");
f1.add(PARAMS, "friction").min(0).max(1).step(0.01).name("Friction");
f1.add(PARAMS, "restitution").min(0).max(1).step(0.01).name("Restitution");

const f2 = gui.addFolder("Scene Events");

/**
 * Floor
 */
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 100),
  new THREE.MeshStandardMaterial({
    color: PARAMS.color,
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentMapTexture,
    envMapIntensity: 0.5,
  })
);
floor.receiveShadow = true;
floor.rotation.x = -Math.PI * 0.5;
scene.add(floor);

/**
 * CONTACT MATERIAL
 * =================================
 * A material is a reference to the type of physics behavior
 *
 * Between these two materials were need to create a contact material,
 * which has collision properties
 *
 */
// const concreteMat = new CANNON.Material("concrete");
// const plasticMat = new CANNON.Material("plastic");
// const concretePlasticContactMat = new CANNON.ContactMaterial(
//   concreteMat,
//   plasticMat,
//   {
//     friction: PARAMS.friction,
//     restitution: PARAMS.restitution,
//   }
// );
// sphereBody.material = plasticMat;
// floorBody.material = concreteMat;
// world.addContactMaterial(concretePlasticContactMat);
const defaultMat = new CANNON.Material("default");
const defaultContactMat = new CANNON.ContactMaterial(defaultMat, defaultMat, {
  friction: PARAMS.friction,
  restitution: PARAMS.restitution,
});
floorBody.material = defaultMat;
// world.addContactMaterial(defaultContactMat)
world.defaultContactMaterial = defaultContactMat;

/**
 * There are many ways to apply forces to a Body:
 *
 *  - applyForce to apply a force to the Body from a specified point in space
 *    (not necessarily on the Body's surface) like the wind that pushes everything a little all the time,
 *     a small but sudden push on a domino or a greater sudden force to make an angry bird jump toward the enemy castle.
 *
 *  - applyImpulse is like applyForce but instead of adding to the force
 *    that will result in velocity changes, it applies directly to the velocity.
 *
 *  - applyLocalForce is the same as applyForce but the coordinates are local to the Body
 *    (meaning that 0, 0, 0 would be the center of the Body).
 *
 *  - applyLocalImpulse is the same as applyImpulse but the coordinates are local to the Body.
 *
 */
// just a spontaneous push
// sphereBody.applyLocalForce(
//   new CANNON.Vec3(150, 0, 0),
//   new CANNON.Vec3(0, 0, 0)
// );

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.22);
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
camera.position.set(-3, 3, 3);
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
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 * --------------
 *
 * We need to use the "Step function" for physics optimizations
 *
 * https://gafferongames.com/post/fix_your_timestep/
 *
 */
const clock = new THREE.Clock();
let oldElapsedTime = 0;

const updatePhysics = (time) => {
  // frame rate (1 / 30) = 30 fps
  world.step(1 / 60, time, 3);

  // get same position
  //     sphere.position.x = sphereBody.position.x
  //     sphere.position.y = sphereBody.position.y
  //     sphere.position.z = sphereBody.position.z
  // sphere.position.copy(sphereBody.position);

  // Spheres,
  for (const obj of objectsToUpdate) {
    obj.mesh.position.copy(obj.body.position);
  }
};

// sphereBody.applyLocalForce(
//   new CANNON.Vec3(150, 0, 0),
//   new CANNON.Vec3(0, 0, 0)
// );
// a steady, ticking wind resistance
const applyForce = () => {
  sphereBody.applyForce(new CANNON.Vec3(-0.5, 0, 0), sphereBody.position);
};

createSphere(0.5, { x: 0, y: 3, z: 0 });

PARAMS.createSphere = () => {
  createSphere(Math.random() * 0.5, {
    x: (Math.random() - 0.5) * 3,
    y: 3,
    z: (Math.random() - 0.5) * 3,
  });
};

PARAMS.reset = () => {
  reset();
};

f2.add(PARAMS, "createSphere").name("Ball is life ⚽⚽");
f2.add(PARAMS, "reset").name("Thanos Snap 👌");
f2.open();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - oldElapsedTime;
  oldElapsedTime = elapsedTime;

  updatePhysics(deltaTime);
  //   applyForce();

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
