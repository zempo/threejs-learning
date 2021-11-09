import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";

/**
 * -----------------------------------------------
 * RAYCASTER
 * ---------------------------------------------
 *
 * Raycaster can cast (or shoot) a ray in a specific direction and test what objects intersect with it.
 * You can use that technique to detect if there is a wall in front of the player,
 *  test if the laser gun hit something, test if something is currently under the mouse to simulate mouse events,
 * and many other things.
 *
 * we have 3 red spheres, and we are going to shoot a ray through and see if those spheres intersect.
 *
 *
 * INTERSECTIONS
 * -------------------------
 * The result of an intersection is always an array, even if you are testing only one object.
 *  That is because a ray can go through the same object multiple times. Imagine a donut.
 *  The ray will go through the first part of the ring, then the middle's hole, then again the second part of the ring.
 *
 * distance: the distance between the origin of the ray and the collision point.
 * face: what face of the geometry was hit by the ray.
 * faceIndex: the index of that face.
 * object: what object is concerned by the collision.
 * point: a Vector3 of the exact position in 3D space of the collision.
 * uv: the UV coordinates in that geometry.
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
 * Objects
 */
const object1 = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 16, 16),
  new THREE.MeshBasicMaterial({ color: "#ff0000" })
);
object1.position.x = -2;

const object2 = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 16, 16),
  new THREE.MeshBasicMaterial({ color: "#ff0000" })
);

const object3 = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 16, 16),
  new THREE.MeshBasicMaterial({ color: "#ff0000" })
);
object3.position.x = 2;

scene.add(object1, object2, object3);

/**
 * RAYCASTER
 * ------------------
 * This example of a normalized vector isn't very relevant because we could have set 1 instead of 10,
 *  but if we change the values, we will still have the normalize() 
 * method making sure that the vector is 1 unit long.
 * 
 * Here, the ray position supposedly start a little on the left in our scene,
 *  and the direction seems to go to the right. Our ray should go through all the spheres.
 * 
 * 

 */
const raycaster = new THREE.Raycaster();
const rayOrigin = new THREE.Vector3(-3, -0, 0);
const rayDirection = new THREE.Vector3(10, 0, 0);
rayDirection.normalize();

raycaster.set(rayOrigin, rayDirection);

// intersection object
/**
 * [
    {
        "distance": 2.5,
        "point": {
            "x": -0.5,
            "y": 0,
            "z": 0
        },
        "object": {
            "metadata": {
                "version": 4.5,
                "type": "Object",
                "generator": "Object3D.toJSON"
            },
            "geometries": [
                {
                    "uuid": "F9B2CC99-2D89-47FE-8E50-34208A7A029B",
                    "type": "SphereGeometry",
                    "radius": 0.5,
                    "widthSegments": 16,
                    "heightSegments": 16,
                    "phiStart": 0,
                    "phiLength": 6.283185307179586,
                    "thetaStart": 0,
                    "thetaLength": 3.141592653589793
                }
            ],
            "materials": [
                {
                    "uuid": "4802F29F-1524-4C0E-AD61-BE26BF4E3977",
                    "type": "MeshBasicMaterial",
                    "color": 16711680,
                    "reflectivity": 1,
                    "refractionRatio": 0.98,
                    "depthFunc": 3,
                    "depthTest": true,
                    "depthWrite": true,
                    "colorWrite": true,
                    "stencilWrite": false,
                    "stencilWriteMask": 255,
                    "stencilFunc": 519,
                    "stencilRef": 0,
                    "stencilFuncMask": 255,
                    "stencilFail": 7680,
                    "stencilZFail": 7680,
                    "stencilZPass": 7680
                }
            ],
            "object": {
                "uuid": "73FDF3EB-C982-48F9-AA00-41473A3D8D23",
                "type": "Mesh",
                "layers": 1,
                "matrix": [
                    1,
                    0,
                    0,
                    0,
                    0,
                    1,
                    0,
                    0,
                    0,
                    0,
                    1,
                    0,
                    0,
                    0,
                    0,
                    1
                ],
                "geometry": "F9B2CC99-2D89-47FE-8E50-34208A7A029B",
                "material": "4802F29F-1524-4C0E-AD61-BE26BF4E3977"
            }
        },
        "uv": {
            "x": -1.9038029661559934e-19,
            "y": 0.49999999999999994
        },
        "face": {
            "a": 136,
            "b": 153,
            "c": 154,
            "normal": {
                "x": -0.9762410360422606,
                "y": -0.0961514976490571,
                "z": 0.19418632559214075
            },
            "materialIndex": 0
        },
        "faceIndex": 241
    }
]
 * 
*/
const intersect = raycaster.intersectObject(object2);
console.log(intersect);

const intersects = raycaster.intersectObjects([object1, object2, object3]);
console.log(intersects);

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

function animateObjects(time) {
  // Animate objects
  object1.position.y = Math.sin(time * 0.3) * 1.5;
  object2.position.y = Math.sin(time * 0.8) * 1.5;
  object3.position.y = Math.sin(time * 1.4) * 1.5;
}

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  animateObjects(elapsedTime);
  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
