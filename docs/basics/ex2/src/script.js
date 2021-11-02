import "./index.css";
import "./style.css";
import * as THREE from "three";

// Scene
const scene = new THREE.Scene();
// Object
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: "#32a852" });
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// Sizes
const sizes = {
  H: window.innerHeight,
  W: window.innerWidth,
};

// Standard Perspective Camera
const camera = new THREE.PerspectiveCamera(65, sizes.W / sizes.H);
camera.position.z = 3;
camera.position.x = -0.65;
scene.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({
  alpha: true,
  canvas: document.querySelector(".app-scene"),
});
renderer.setSize(sizes.W, sizes.H);
renderer.render(scene, camera);
