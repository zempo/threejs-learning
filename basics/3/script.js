//==========================
// THE 4 ELEMENTS OF A SCENE CONTAINER

// A "movie set"

// 1. A scene that will contain objects
// 2. Some objects for the scene
// 3. A camera
// 4. A renderer
//==========================

// KEY TERMS
//---------------------------
// OBJECTS:
//
// Primitive geometries, imported modules,
// particles, lights, etc
//
// MESH:
// Combination of a geometry (shape)
// and a material (appearance/texture)
// ------------------------------------------

// Scene
const scene = new THREE.Scene();

// Geometry
const geometry = new THREE.BoxGeometry(1, 1, 1);

// Material
const material = new THREE.MeshBasicMaterial({
  color: "#cc3f35",
});

// Mesh
const mesh = new THREE.Mesh(geometry, material);

scene.add(mesh);

// Camera
// 75 degrees field of view
// Wider = peripheral distortion, bigger appeture
// Narrow = less distortion, small appeture
//
//       /
//    📷/
//      \
//       \
//

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};
// aspect ratio: width/height
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.z = 4;
scene.add(camera);
const canvas = document.querySelector(".scene");
// Renderer
const renderer = new THREE.WebGLRenderer({
  //
  canvas,
});

renderer.setSize(sizes.width, sizes.height);

renderer.render(scene, camera);
