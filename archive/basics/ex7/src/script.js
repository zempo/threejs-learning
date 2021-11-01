import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

/**===========================
 * GEOMETRIES
 * ===========================
 *
 * Creating a house
 * ----------------
 * Cube for the walls,
 * Other boxes and planes for rooms/windows/panels
 * Sphere for bushes
 * Cylinder w/ sphere on top for tree
 *
 *
 * Built-In Geometries
 * --------------
 * BoxGeometry
 * BufferGeometry
 * PlaneGeometry
 * CircleGeometry
 * ConeGeometry
 * CylinderGeometry
 * RingGeometry
 * TorusGeometry
 * DodecahedronGeometry
 * OctahedronGeometry
 * TetrahedronGeometry
 * ShapeGeometry
 * SphereGeometry
 * TubeGeometry
 * ExtrudeGeometry
 * TextGeometry
 * LatheGeometry
 * Face3
 *
 */

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Object
/**
 * DEEP DIVE INTO BOX GEOMETRY
 *
 * Not just x,y,z width (1,1,1)...
 *
 * But the number of faces/segments, as well
 * widthSegments/heightSegments/depthSegments
 *
 * (1,1,1,2,2,2)
 */
// const geometry = new THREE.BoxGeometry(1, 1, 1, 4, 4, 4);

/**
 * CREATING OUR OWN TRIANGLE
 * FLOAT32 Array
 * - Can store only floats
 * - Fixed length
 * - Easier for the computer to handle
 *
 * Convert to Buffer Attr
 */
// PART 1 (CREATE SINGLE TRIANGLE FACE FROM 3X3 VERTICES)
// const positionsArr = new Float32Array([
//   -1,
//   0,
//   0, // vertex 1 (-1,0,0)
//   0,
//   1,
//   0, // vertex 2 (0,1,0)
//   1,
//   0,
//   0, // vertex 3 (1,0,0)
// ]);

// // 1 vertex contains 3 values (x,y,z)
// const positionsAttr = new THREE.BufferAttribute(positionsArr, 3);

const geometry = new THREE.BufferGeometry();

// number of triangles
const count = 50;
// Each of the triangles will be composed of 3 vertices and 3 points (x,y,z)
const positionsArr = new Float32Array(count * 3 * 3);

for (let i = 0; i < count * 3 * 3; i++) {
  positionsArr[i] = 4 * (Math.random() - 0.5);
}

const positionsAttr = new THREE.BufferAttribute(positionsArr, 3);

geometry.setAttribute("position", positionsAttr);

const material = new THREE.MeshBasicMaterial({
  color: 0xff00ff,
  wireframe: true,
});
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// Sizes
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

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.z = 3;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Animate
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
