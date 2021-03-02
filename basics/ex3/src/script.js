import "./style.css";
import * as THREE from "three";

/*
====================================
LESSON NOTES 
----------------------------------

Moving objects
-Apply position to your mesh/camera
mesh.position.x/y/z
camera.position.x/y/z
-----
New Classes
-camera/mesh.position.length()
-camera/mesh.position.distanceTo()
-camera/mesh.position.normalize()
-camera/mesh.position.set(0,0,0) // x,y,z

-mesh.scale.set(0,0,0) // x,y,z
----
Axis Helper

// AxesHelper arguement equals the relative segment length
// Relative to the mesh
const axesHelper = new THREE.AxesHelper(2);
scene.add(axesHelper);
----
Rotation

const PI = Math.PI;
mesh.rotation.set(PI * 0, PI * 0.25, PI * 1);
----

Creating a Scene Graph
GROUP (Object groups, can be moved together)
___________________________________
*/

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Objects (Part 1)
 */
// --------------------------------------
//
// const geometry = new THREE.BoxGeometry(1, 1, 1);
// const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
// const mesh = new THREE.Mesh(geometry, material);
// mesh.position.y = 0;
// mesh.position.x = -0.4;
// mesh.position.z = 1;
// mesh.position.set(0.7, -0.6, 1);
/**
 * Scale
 */
// mesh.scale.set(1, 2, 0.5);

// If the object is stuck in any axis,
// you might need to reorder. This is a gimbal lock.

// If you reorder, reorder before you rotate
// mesh.rotation.reorder('YXZ')
// const PI = Math.PI;
// mesh.rotation.set(PI * 0, PI * 0.75, PI * -0.75);

// scene.add(mesh);

// Distance btwn mesh and center of the scene
// console.log(mesh.position.length());
// 1.0770....

// will center your object position
// mesh.position.normalize();
// console.log(mesh.position.length());
// 1

/**
 * Objects (Part 2: Groups)
 */
// --------------------------------------
const group = new THREE.Group();
scene.add(group);

const cube1 = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: 0x0000ff })
);

const cube2 = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: 0x00ff00 })
);

const cube3 = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: 0x800080 })
);

cube1.position.set(-2, 0, 0);
cube2.position.set(0, 0, 0);
cube3.position.set(2, 0, 0);

group.add(cube1).add(cube2).add(cube3);

group.scale.set(0.5, 2, 2);

/**
 * Axis Helper
 */
const axesHelper = new THREE.AxesHelper(2);
scene.add(axesHelper);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
// camera.position.z = 4;
camera.position.set(0, 0, 4);
scene.add(camera);

// You can move the camera
// To focus on mesh
// camera.lookAt(mesh.position);

// Distance btwn camera and object
// console.log(mesh.position.distanceTo(camera.position));

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.render(scene, camera);
