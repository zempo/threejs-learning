import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";
import atmoVertexShader from "./shaders/atmoVertex.glsl";
import atmoFragmentShader from "./shaders/atmoFragment.glsl";
import "./style.css";
import { Float32BufferAttribute } from "three";

// Scene
const scene = new THREE.Scene();
// Canvas
const canvas = document.querySelector("canvas.app-canvas");

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

// camera.position.x = -3;
// camera.position.y = 0;
camera.position.z = 25;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * GEOMETRIES
 */
const mars = new THREE.Mesh(
  new THREE.SphereGeometry(10, 100, 100),
  new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      marsTexture: {
        value: new THREE.TextureLoader().load("./img/mars.jpg"),
      },
    },
  })
);

scene.add(mars);

const marsAtmos = new THREE.Mesh(
  new THREE.SphereGeometry(10, 100, 100),
  new THREE.ShaderMaterial({
    vertexShader: atmoVertexShader,
    fragmentShader: atmoFragmentShader,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
  })
);

marsAtmos.scale.set(1.1, 1.1, 1.1);

scene.add(marsAtmos);

const starsGeo = new THREE.BufferGeometry();
const starsMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
});

const starVertices = [];
for (let i = 0; i < 10000; i++) {
  const x = (Math.random() - 0.5) * 600;
  const y = (Math.random() - 0.5) * 600;
  const z = -Math.random() * 2000;
  starVertices.push(x, y, z);
}

starsGeo.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(starVertices, 3)
);

const stars = new THREE.Points(starsGeo, starsMaterial);

scene.add(stars);

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

  mars.rotation.y += 0.002;

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
