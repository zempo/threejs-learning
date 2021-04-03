import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
// This is 1 approach
// import typacefaceFont from 'three/examples/fonts/helvetiker_regular.typeface.json'
// Or you can use the cmd line to do this
/**
 * # From project dir
 * # DONT FORGET TO INCLUDE THE LISENCE within static
 * $ cp node_modules/three/examples/font/my_regular_typeface.butt /static
 * $ cp node_modules/three/exmples/font/LISENCE
 */
/**
 * ======================
 * CREATING 3D TEXT
 * ======================
 *
 * TextBufferGeometry | We need a typeface format
 *
 * How to get a typeface font
 * ------------------------------
 * Typeface generator (http://gero3.github.io/facetype.js/)
 * Threejs also provides some fonts
 *
 * We must take the license with the font
 * From nodemodules/three/examples/font
 *
 * FRUSTUM CULLING
 * ----------------
 * Selectively not rendering to save performance
 * Calculate if obj in screen
 * We will center the object w/ this property
 */

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

const controlNodes = {
  color: 0xffffff,
  wireframe: false,
  fontSize: 0.5,
  fontHeight: 0.1,
  curveSegments: 5,
  //   curveSegments: 32,
  bevelThickness: 0.015,
  bevelSize: 0.02,
  bevelOffset: 0,
  bevelSegments: 4,
  //   bevelSegments: 12,
};

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();
const axesHelper = new THREE.AxesHelper();
// Debug
// scene.add(axesHelper)
/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();
const matcapTexture = textureLoader.load("/textures/matcaps/5.png");
/**
 * FONTS LOADED HERE
 */
const fontLoader = new THREE.FontLoader();

fontLoader.load("/fonts/helvetiker_regular.typeface.json", (font) => {
  // console.log('font loaded')
  const fontProps = {
    font,
    size: controlNodes.fontSize,
    height: controlNodes.fontHeight,
    curveSegments: controlNodes.curveSegments,
    bevelEnabled: true,
    bevelThickness: controlNodes.bevelThickness,
    bevelSize: controlNodes.bevelSize,
    bevelOffset: controlNodes.bevelOffset,
    bevelSegments: controlNodes.bevelSegments,
  };

  const textGeometry = new THREE.TextBufferGeometry(
    "Solomon Zelenko",
    fontProps
  );

  // THE HARD WAY
  ////----------------
  // textGeometry.computeBoundingBox()
  // // console.log(textGeometry.boundingBox)
  // textGeometry.translate(
  //     -((textGeometry.boundingBox.max.x - .02) * .5),
  //     -((textGeometry.boundingBox.max.y - .02) * .5)
  //     -((textGeometry.boundingBox.max.z - .03) * .5)
  // )
  textGeometry.center();

  const textMaterial = new THREE.MeshMatcapMaterial({
    color: controlNodes.color,
    matcap: matcapTexture,
    // wireframe: controlNodes.wireframe
  });

  gui
    .addColor(controlNodes, "color")
    .onChange(() => {
      textMaterial.color.set(controlNodes.color);
    })
    .name("Update Text Color");

  // gui.add(textMaterial, "wireframe").name("Toggle Wireframe")

  // -----------------
  // gui.add(controlNodes, "fontSize")
  // .min(0)
  // .max(3)
  // .step(.0001)
  // .onChange(() => {

  // })
  // gui.add(textGeometry, "height").min(0).max(3).step(.0001).name("Line Height")
  // gui.add(textGeometry, "curveSegments").min(0).max(25).step(1).name("Font Segments")
  // gui.add(textGeometry, "bevelSize").min(0).max(3).step(.0001).name("Bevel Size")
  // gui.add(textGeometry, "bevelThickness").min(0).max(3).step(.0001).name("Bevel Thickness")
  // // gui.add(textGeometry, "bevelOffset").min(0).max(3).step(.0001).name("Bevel Offset")
  // gui.add(textGeometry, "bevelSegments").min(0).max(25).step(1).name("Bevel Segments")
  //-----------------------

  const text = new THREE.Mesh(textGeometry, textMaterial);

  scene.add(text);

  const donutGeometry = new THREE.TorusBufferGeometry(0.3, 0.2, 20, 45);
  const donutMaterial = new THREE.MeshMatcapMaterial({ matcap: matcapTexture });
  for (let i = 0; i < 300; i++) {
    const donut = new THREE.Mesh(donutGeometry, donutMaterial);

    donut.position.y = (Math.random() - 0.5) * 10;
    donut.position.x = (Math.random() - 0.5) * 10;
    donut.position.z = (Math.random() - 0.5) * 10;

    donut.rotation.y = (Math.random() - 0.5) * Math.PI;
    donut.rotation.x = (Math.random() - 0.5) * Math.PI;

    const scale = Math.random();

    donut.scale.set(scale, scale, scale);

    scene.add(donut);
  }
});

/**
 * Object
 */
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial()
);

// scene.add(cube)

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
camera.position.x = 1;
camera.position.y = 1;
camera.position.z = 4;
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
