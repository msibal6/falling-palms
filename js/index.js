// can now import code from other js files 
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js';
// import { consoleLog } from "./test.js";
// Scene
const scene = new THREE.Scene();
// Camera
const camera = new THREE.PerspectiveCamera(75,
	window.innerWidth / window.innerHeight, 0.1, 1000);

// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
// Resizing the window on resize 
// might delete
window.addEventListener('resize', handleWindowResize, false);
function handleWindowResize() {
	// update height and width of the renderer and the camera
	const windowHeight = window.innerHeight;
	const windowWidth = window.innerWidth;
	renderer.setSize(windowWidth, windowHeight);
	camera.aspect = windowWidth / windowHeight;
	camera.updateProjectionMatrix();
}

// Placing a cube in the scene
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);

// scene.add automatically places the cube at (0, 0, 0)
scene.add(cube);

// X towards preferences bar
// Y towards widget bar
// Z towards user
// Changing camera position
camera.position.set(75, 20, 0);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 5);
controls.update();

// Adds red skybox
const loader = new THREE.CubeTextureLoader();
const texture = loader.load([
	'../images/red_background.png',
	'../images/red_background.png',
	'../images/red_background.png',
	'../images/red_background.png',
	'../images/red_background.png',
	'../images/red_background.png',
]);
scene.background = texture;
// Add the floor
const plane = new THREE.Mesh(
	new THREE.PlaneGeometry(100, 100, 10, 10),
	new THREE.MeshStandardMaterial({
		color: 0x000000,
	}));
plane.castShadow = false;
plane.receiveShadow = true;
plane.rotation.x = -Math.PI / 2;
scene.add(plane);
// Add another box
const box = new THREE.Mesh(
	new THREE.BoxGeometry(2, 2, 2),
	new THREE.MeshStandardMaterial({
		color: 0xFFFFFF,
	}));
box.position.set(0, 1, 0);
box.castShadow = true;
box.receiveShadow = true;
scene.add(box);

// Add light
const light = new THREE.AmbientLight(0xFFFFFF);
scene.add(light);
// Rendering loop
function animate() {
	// renders everytime the screen refreshes only when 
	// we are the current browser tab
	requestAnimationFrame(animate);
	renderer.render(scene, camera);
}

animate();