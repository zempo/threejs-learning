import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";

/**
 * PROJECT SETUP
 *-----------------------
 * A floor
 * A sphere
 * Some lights
 * House
 * Shadows
 *
 */

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Textures
 * ====================================
 */
const textureLoader = new THREE.TextureLoader();
const TEXTURES = {
  door: {
    color: textureLoader.load("/textures/door/color.jpg"),
    alpha: textureLoader.load("/textures/door/alpha.jpg"),
    ambiantOcclusion: textureLoader.load("/textures/door/ambientOcclusion.jpg"),
    height: textureLoader.load("/textures/door/height.jpg"),
    normal: textureLoader.load("/textures/door/normal.jpg"),
    metalness: textureLoader.load("/textures/door/metalness.jpg"),
    roughness: textureLoader.load("/textures/door/roughness.jpg"),
  },
  roof: {
    color: textureLoader.load("/textures/roof/color.jpg"),
    ambiantOcclusion: textureLoader.load("/textures/roof/ambientOcclusion.jpg"),
    height: textureLoader.load("/textures/roof/height.png"),
    normal: textureLoader.load("/textures/roof/normal.jpg"),
    roughness: textureLoader.load("/textures/roof/roughness.jpg"),
  },
  walls: {
    color: textureLoader.load("/textures/bricks/color.jpg"),
    ambiantOcclusion: textureLoader.load(
      "/textures/bricks/ambientOcclusion.jpg"
    ),
    normal: textureLoader.load("/textures/bricks/normal.jpg"),
    roughness: textureLoader.load("/textures/bricks/roughness.jpg"),
  },
  wallsDark: {
    color: textureLoader.load("/textures/bricksDark/color.jpg"),
    ambiantOcclusion: textureLoader.load(
      "/textures/bricksDark/ambientOcclusion.jpg"
    ),
    height: textureLoader.load("/textures/bricksDark/height.png"),
    normal: textureLoader.load("/textures/bricksDark/normal.jpg"),
    roughness: textureLoader.load("/textures/bricksDark/roughness.jpg"),
  },
  wood: {
    color: textureLoader.load("/textures/wood/color.jpg"),
    ambiantOcclusion: textureLoader.load("/textures/wood/ambientOcclusion.jpg"),
    height: textureLoader.load("/textures/wood/height.png"),
    normal: textureLoader.load("/textures/wood/normal.jpg"),
    roughness: textureLoader.load("/textures/wood/roughness.jpg"),
  },
  moss: {
    color: textureLoader.load("/textures/moss/color.jpg"),
    ambiantOcclusion: textureLoader.load("/textures/moss/ambientOcclusion.jpg"),
    height: textureLoader.load("/textures/moss/height.png"),
    normal: textureLoader.load("/textures/moss/normal.jpg"),
    roughness: textureLoader.load("/textures/moss/roughness.jpg"),
  },
  grass: {
    color: textureLoader.load("/textures/grass/color.jpg"),
    ambiantOcclusion: textureLoader.load(
      "/textures/grass/ambientOcclusion.jpg"
    ),
    normal: textureLoader.load("/textures/grass/normal.jpg"),
    roughness: textureLoader.load("/textures/grass/roughness.jpg"),
  },
  graves: {
    color: textureLoader.load("/textures/graves/color.jpg"),
    ambiantOcclusion: textureLoader.load(
      "/textures/graves/ambientOcclusion.jpg"
    ),
    height: textureLoader.load("/textures/graves/height.png"),
    normal: textureLoader.load("/textures/graves/normal.jpg"),
    roughness: textureLoader.load("/textures/graves/roughness.jpg"),
  },
};

// // Temporary sphere - for testing
// const sphere = new THREE.Mesh(
//     new THREE.SphereGeometry(1, 32, 32),
//     new THREE.MeshStandardMaterial({ roughness: 0.7 })
// )
// sphere.position.y = 1
// scene.add(sphere)

//===========================================================
// GEOS
const GEOS = {
  houseGeo: new THREE.BoxGeometry(4, 2.5, 4),
  // Three.js doesn't have a pyramid, so you need to reduce the number of cone sides to 4
  roofGeo: new THREE.ConeGeometry(3.5, 1, 4),
  // old door
  //   doorGeo: new THREE.PlaneGeometry(2, 2),
  doorGeo: new THREE.PlaneGeometry(2.2, 2.2, 100, 100),
  bushGeo: new THREE.SphereGeometry(1, 16, 16),
  graveGeo: new THREE.BoxGeometry(0.6, 0.8, 0.15),
  groundGeo: new THREE.PlaneGeometry(50, 50),
};

const MATS = {
  houseMat: new THREE.MeshStandardMaterial({
    // color: "#ac8e82",
    map: TEXTURES.walls.color,
    aoMap: TEXTURES.walls.ambiantOcclusion,
    normalMap: TEXTURES.walls.normal,
    roughnessMap: TEXTURES.walls.roughness,
    // side: THREE.DoubleSide,
  }),
  houseMatDark: new THREE.MeshStandardMaterial({
    // color: "#ac8e82",
    map: TEXTURES.wallsDark.color,
    aoMap: TEXTURES.wallsDark.ambiantOcclusion,
    displacementMap: TEXTURES.wallsDark.height,
    displacementScale: 0,
    normalMap: TEXTURES.wallsDark.normal,
    roughnessMap: TEXTURES.wallsDark.roughness,
    roughness: 1,
    metalness: 0,
    // side: THREE.DoubleSide,
  }),
  houseMatWood: new THREE.MeshStandardMaterial({
    // color: "#ac8e82",
    map: TEXTURES.wood.color,
    aoMap: TEXTURES.wood.ambiantOcclusion,
    displacementMap: TEXTURES.wood.height,
    displacementScale: 0,
    normalMap: TEXTURES.wood.normal,
    roughnessMap: TEXTURES.wood.roughness,
    // side: THREE.DoubleSide,
  }),
  roofMat: new THREE.MeshStandardMaterial({
    // color: "#b35f45",
    map: TEXTURES.roof.color,
    aoMap: TEXTURES.roof.ambiantOcclusion,
    displacementMap: TEXTURES.roof.height,
    displacementScale: 0,
    normalMap: TEXTURES.roof.normal,
    roughnessMap: TEXTURES.roof.roughness,
  }),
  doorMat: new THREE.MeshStandardMaterial({
    //   color: "#aa7b7b"
    map: TEXTURES.door.color,
    transparent: true,
    alphaMap: TEXTURES.door.alpha,
    aoMap: TEXTURES.door.ambiantOcclusion,
    displacementMap: TEXTURES.door.height,
    displacementScale: 0.1,
    normalMap: TEXTURES.door.normal,
    metalnessMap: TEXTURES.door.metalness,
    roughnessMap: TEXTURES.door.roughness,
    // side: THREE.DoubleSide,
  }),
  bushMat: new THREE.MeshStandardMaterial({
    // color: "#89c854",
    map: TEXTURES.moss.color,
    aoMap: TEXTURES.moss.ambiantOcclusion,
    displacementMap: TEXTURES.moss.height,
    displacementScale: 0,
    normalMap: TEXTURES.moss.normal,
    roughnessMap: TEXTURES.moss.roughness,
  }),
  graveMat: new THREE.MeshStandardMaterial({
    // color: "#b2b6b1",
    map: TEXTURES.graves.color,
    aoMap: TEXTURES.graves.ambiantOcclusion,
    displacementMap: TEXTURES.graves.height,
    displacementScale: 0,
    normalMap: TEXTURES.graves.normal,
    roughnessMap: TEXTURES.graves.roughness,
  }),
  groundMat: new THREE.MeshStandardMaterial({
    map: TEXTURES.grass.color,
    aoMap: TEXTURES.grass.ambiantOcclusion,
    normalMap: TEXTURES.grass.normal,
    roughnessMap: TEXTURES.grass.roughness,
    roughness: 1,
    metalness: 0.1,
  }),
};

/**
 * Repeat/Modify Textures
 * --------------------
 */
const grassT = TEXTURES.grass;
grassT.color.repeat.set(8, 8);
grassT.ambiantOcclusion.repeat.set(8, 8);
grassT.normal.repeat.set(8, 8);
grassT.roughness.repeat.set(8, 8);
// And don't forget to change the wrapS and wrapT properties to activate the repeat:
grassT.color.wrapS = THREE.RepeatWrapping;
grassT.ambiantOcclusion.wrapS = THREE.RepeatWrapping;
grassT.normal.wrapS = THREE.RepeatWrapping;
grassT.roughness.wrapS = THREE.RepeatWrapping;

grassT.color.wrapT = THREE.RepeatWrapping;
grassT.ambiantOcclusion.wrapT = THREE.RepeatWrapping;
grassT.normal.wrapT = THREE.RepeatWrapping;
grassT.roughness.wrapT = THREE.RepeatWrapping;

const roofT = TEXTURES.roof;
roofT.color.repeat.set(4, 4);
roofT.ambiantOcclusion.repeat.set(4, 4);
roofT.normal.repeat.set(4, 4);
roofT.roughness.repeat.set(4, 4);
// And don't forget to change the wrapS and wrapT properties to activate the repeat:
roofT.color.wrapS = THREE.RepeatWrapping;
roofT.ambiantOcclusion.wrapS = THREE.RepeatWrapping;
roofT.normal.wrapS = THREE.RepeatWrapping;
roofT.roughness.wrapS = THREE.RepeatWrapping;

roofT.color.wrapT = THREE.RepeatWrapping;
roofT.ambiantOcclusion.wrapT = THREE.RepeatWrapping;
roofT.normal.wrapT = THREE.RepeatWrapping;
roofT.roughness.wrapT = THREE.RepeatWrapping;

/**
 * HOUSE GROUP
 * -------------------------
 */
// A house container
const house = new THREE.Group();
scene.add(house);

// Walls, move above floor
const walls = new THREE.Mesh(GEOS.houseGeo, MATS.houseMatWood);
walls.geometry.setAttribute(
  "uv2",
  new THREE.Float32BufferAttribute(walls.geometry.attributes.uv.array, 2)
);
walls.position.y = 1.25 + 0.01;
house.add(walls);

// roof, pyramid shape
const roof = new THREE.Mesh(GEOS.roofGeo, MATS.roofMat);
// y rotation is around a stripper pole, pi times the portion you want to rotate
roof.rotation.y = Math.PI * 0.25;
// walls are 2.5 and we move objects up by half of their height
roof.position.y = 2.5 + 0.5;
roof.geometry.setAttribute(
  "uv2",
  new THREE.Float32BufferAttribute(roof.geometry.attributes.uv.array, 2)
);
house.add(roof);

const door = new THREE.Mesh(GEOS.doorGeo, MATS.doorMat);
// Also, add the uv2 attribute to the geometry for the aoMap as we did in the Materials lesson.
door.geometry.setAttribute(
  "uv2",
  new THREE.Float32BufferAttribute(door.geometry.attributes.uv.array, 2)
);
door.position.y = 1;
// just barely in front of wall
door.position.z = 2 + 0.01;
house.add(door);

// bushes, positioned by the door
const bush1 = new THREE.Mesh(GEOS.bushGeo, MATS.bushMat);
bush1.scale.set(0.5, 0.5, 0.5);
bush1.position.set(0.8, 0.2, 2.2);
const bush2 = new THREE.Mesh(GEOS.bushGeo, MATS.bushMat);
bush2.scale.set(0.25, 0.25, 0.25);
bush2.position.set(1.4, 0.1, 2.1);
const bush3 = new THREE.Mesh(GEOS.bushGeo, MATS.bushMat);
bush3.scale.set(0.4, 0.4, 0.4);
bush3.position.set(-0.8, 0.1, 2.2);
const bush4 = new THREE.Mesh(GEOS.bushGeo, MATS.bushMat);
bush4.scale.set(0.15, 0.15, 0.15);
bush4.position.set(-1, 0.05, 2.6);

house.add(bush1, bush2, bush3, bush4);
console.log(house);
/**
 * GRAVE GROUP
 * -------------------------
 * We will procedurally generate/populate our graves
 */
const graves = new THREE.Group();
scene.add(graves);

/**
 * We are going to create a random angle on a circle.
 * Remember that a full revolution is 2 times π.
 * Then we are going to use that angle on both a sin(...) and a cos(...).
 * This is how you position things on a circle when you have the angle. And finally we also multiply those sin(...) and cos(...)
 *  results by a random value because we don't want the graves to be positioned on a perfect circle.
 *
 * Translation... putting a bunch of graves "around" the house
 */
for (let i = 0; i < 50; i++) {
  // random angle, radius, x/z position
  const deg = Math.random() * Math.PI * 2;
  const radius = 4.5 + Math.random() * 6;
  const xPos = Math.cos(deg) * radius;
  const zPos = Math.sin(deg) * radius;

  const randGrave = new THREE.Mesh(GEOS.graveGeo, MATS.graveMat);

  randGrave.position.set(xPos, 0.3, zPos);
  // askew side/side or around
  randGrave.rotation.z = (Math.random() - 0.5) * 0.4;
  randGrave.rotation.y = (Math.random() - 0.5) * 0.4;

  randGrave.castShadow = true;
  randGrave.receiveShadow = true;

  graves.add(randGrave);
}

// Floor
const floor = new THREE.Mesh(GEOS.groundGeo, MATS.groundMat);
floor.geometry.setAttribute(
  "uv2",
  new THREE.Float32BufferAttribute(floor.geometry.attributes.uv.array, 2)
);
floor.rotation.x = -Math.PI * 0.5;
floor.position.y = 0;
scene.add(floor);

/***
 * GHOSTS
 * ---------------
 * Simple lights floating/passing around
 */
const ghost1 = new THREE.PointLight("#ff00ff", 2, 3);
scene.add(ghost1);

const ghost2 = new THREE.PointLight("#00ffff", 2, 3);
scene.add(ghost2);

const ghost3 = new THREE.PointLight("#ffff00", 2, 3);
scene.add(ghost3);

/**
 * Lights
 */
// Ambient light (dimmed for bluish color)
const ambientLight = new THREE.AmbientLight("#b9d5ff", 0.35);
gui.add(ambientLight, "intensity").min(0).max(1).step(0.001);
scene.add(ambientLight);

// Directional light (dimmed for a bluish color)
const moonLight = new THREE.DirectionalLight("#b9d5ff", 0.35);
moonLight.position.set(4, 5, -2);
gui.add(moonLight, "intensity").min(0).max(1).step(0.001);
gui.add(moonLight.position, "x").min(-5).max(5).step(0.001);
gui.add(moonLight.position, "y").min(-5).max(5).step(0.001);
gui.add(moonLight.position, "z").min(-5).max(5).step(0.001);
scene.add(moonLight);

// Door pointlight above the door
const doorLight = new THREE.PointLight("#ff7d46", 1, 7);
doorLight.position.set(0, 2.2, 2.7);
house.add(doorLight);

/**
 * FOG
 */
const fog = new THREE.Fog("#262837", 1, 15);
scene.fog = fog;

/**
 * SHADOWS
 * =======================
 *
 */
moonLight.castShadow = true;
doorLight.castShadow = true;
ghost1.castShadow = true;
ghost2.castShadow = true;
ghost3.castShadow = true;

walls.castShadow = true;
bush1.castShadow = true;
bush2.castShadow = true;
bush3.castShadow = true;
bush4.castShadow = true;
bush1.receiveShadow = true;
bush2.receiveShadow = true;
bush3.receiveShadow = true;
bush4.receiveShadow = true;

doorLight.receiveShadow = true;

floor.receiveShadow = true;

moonLight.shadow.mapSize.width = 256;
moonLight.shadow.mapSize.height = 256;
moonLight.shadow.camera.far = 15;

// ...

doorLight.shadow.mapSize.width = 256;
doorLight.shadow.mapSize.height = 256;
doorLight.shadow.camera.far = 7;

// ...

ghost1.shadow.mapSize.width = 256;
ghost1.shadow.mapSize.height = 256;
ghost1.shadow.camera.far = 7;

// ...

ghost2.shadow.mapSize.width = 256;
ghost2.shadow.mapSize.height = 256;
ghost2.shadow.camera.far = 7;

// ...

ghost3.shadow.mapSize.width = 256;
ghost3.shadow.mapSize.height = 256;
ghost3.shadow.camera.far = 7;

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
camera.position.x = 4;
camera.position.y = 2;
camera.position.z = 5;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 * !!!WE MODIFY THINGS, HERE
 * =================================================
 * Not bad, but we can see a clean cut between the graves and the black background.
 *
 * To fix that, we must change the clear color of the renderer and use the same color as the fog.
 * Do that after instantiating the renderer:
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
//
renderer.setClearColor("#262837");
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

/**
 * Animate
 */
const clock = new THREE.Clock();

function animateGhostsStrobe() {
  for (let i = 1; i < arguments.length; i++) {
    let currGhost = arguments[i];
    let ghostInterval = arguments[0];
    let ghostDeg = ghostInterval + (Math.random() * 0.75 + 0.2);
    currGhost.position.x =
      Math.cos(ghostDeg) * (Math.floor(Math.random() * 8) + 2);
    currGhost.position.z =
      Math.sin(ghostDeg) * (Math.floor(Math.random() * 5) + 2);
    currGhost.position.y =
      Math.sin(ghostDeg) * (Math.floor(Math.random() * 3) + 2);
  }
}

function animateGhosts(time) {
  // Ghosts
  const ghost1Angle = time * 0.5;
  ghost1.position.x = Math.cos(ghost1Angle) * 4;
  ghost1.position.z = Math.sin(ghost1Angle) * 4;
  ghost1.position.y = Math.sin(time * 3);

  const ghost2Angle = -time * 0.32;
  ghost2.position.x = Math.cos(ghost2Angle) * 5;
  ghost2.position.z = Math.sin(ghost2Angle) * 5;
  ghost2.position.y = Math.sin(time * 4) + Math.sin(time * 2.5);

  const ghost3Angle = -time * 0.18;
  ghost3.position.x = Math.cos(ghost3Angle) * (7 + Math.sin(time * 0.32));
  ghost3.position.z = Math.sin(ghost3Angle) * (7 + Math.sin(time * 0.5));
  ghost3.position.y = Math.sin(time * 4) + Math.sin(time * 2.5);
}

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();

  // animate ghosts, pass in unlimited ghosts
  //   animateGhostsStrobe(elapsedTime, ghost1, ghost2, ghost3);
  animateGhosts(elapsedTime);
  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
