import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'

/**
 * =================
 * LIGHTING
 * =================
 * 
 * Adding lights is as simple as adding a mesh
 * You just need the correct classes and you add it to the scene.
 * 
 * 
 * AMBIANT LIGHT: provides omnidirectional lighting
 * Simulates light being scattered and bounced around an object
 * from the sun/light source
 * 
 * DIRECTIONAL LIGHT: Has a sun-like effect as if sun-rays were traveling in parrellel.
 * 
*/

/**
 * Base 
 */
// Debug
const gui = new dat.GUI()

const controlNodes = {
    color: 0xffffff,
    ambColor: 0xffffff,
    dirColor: 0x00fffc,
    hemiSkyColor: 0x00fffc,
    hemiGroundColor: 0x00fffc,
    wireframe: false,
    roughness: .4,
    metalness: .4,
    ambIntensity: .5,
    dirIntensity: .3,
    hemiIntensity: .01,
    pointIntensity: .5
}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Lights
 */
// Starter
//--------------------------------------
// const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
// scene.add(ambientLight)

// const pointLight = new THREE.PointLight(0xffffff, 0.5)
// pointLight.position.x = 2
// pointLight.position.y = 3
// pointLight.position.z = 4
// scene.add(pointLight)
// ------------------------------------------

// comes from the surroundings
const ambiantLight = new THREE.AmbientLight(controlNodes.ambColor, controlNodes.ambIntensity)
scene.add(ambiantLight)

// from a specific direction 
const directionalLight = new THREE.DirectionalLight(controlNodes.dirColor, controlNodes.dirIntensity)
scene.add(directionalLight)

// different sky && ground colors, unlike ambiant light 
const hemisphereLight = new THREE.HemisphereLight(
    controlNodes.hemiSkyColor,
    controlNodes.hemiGroundColor,
    controlNodes.hemiIntensity
    );
scene.add(hemisphereLight);

/**
 * Objects
 */
// Material
const material = new THREE.MeshStandardMaterial({
    roughness: .4,
    color: controlNodes.color,
    side: THREE.DoubleSide
})

// Objects
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 32),
    material
)
sphere.position.x = - 1.5

const cube = new THREE.Mesh(
    new THREE.BoxGeometry(0.75, 0.75, 0.75),
    material
)

const torus = new THREE.Mesh(
    new THREE.TorusGeometry(0.3, 0.2, 32, 64),
    material
)
torus.position.x = 1.5

const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 5),
    material
)
plane.rotation.x = - Math.PI * 0.5
plane.position.y = - 0.65


scene.add(sphere, cube, torus, plane)

let f1 = gui.addFolder('Adjust Light Intensity')
f1.add(ambiantLight, "intensity").min(0).max(1).step(0.01).name("Ambiant Light Intensity");
f1.add(directionalLight, "intensity").min(0).max(1).step(0.01).name("Directional Light Intensity");
f1.add(hemisphereLight, "intensity").min(0).max(1).step(0.01).name("Hemispheric Light Intensity");

let f2 = gui.addFolder('Adjust Light Positions')
f2.add(directionalLight.position, "y").min(-3).max(3).step(0.01).name("Directional Light Y");
f2.add(directionalLight.position, "x").min(-3).max(3).step(0.01).name("Directional Light X");
f2.add(directionalLight.position, "z").min(-3).max(3).step(0.01).name("Directional Light Z");

let f3 = gui.addFolder('Adjust Colors')
gui.addColor(controlNodes, "color").onChange(() => {
    material.color.set(controlNodes.color);
  });

gui.addColor(controlNodes, "ambColor").onChange(() => {
    ambiantLight.color.set(controlNodes.ambColor)
})

gui.addColor(controlNodes, "dirColor").onChange(() => {
    directionalLight.color.set(controlNodes.dirColor)
})

gui.addColor(controlNodes, "hemiSkyColor").onChange(() => {
    hemisphereLight.color.set(controlNodes.hemiSkyColor)
})

gui.addColor(controlNodes, "hemiGroundColor").onChange(() => {
    hemisphereLight.groundColor.set(controlNodes.hemiGroundColor)
})

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 1
camera.position.y = 1
camera.position.z = 2
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update objects
    sphere.rotation.y = 0.1 * elapsedTime
    cube.rotation.y = 0.1 * elapsedTime
    torus.rotation.y = 0.1 * elapsedTime

    sphere.rotation.x = 0.15 * elapsedTime
    cube.rotation.x = 0.15 * elapsedTime
    torus.rotation.x = 0.15 * elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()