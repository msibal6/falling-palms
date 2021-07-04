// can now import code from other js files 
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js';

import { getNormalizedVector } from './vectorHelper.js';
import { OrbitZCamera } from './OrbitCamera.js';
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
const material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);

// scene.add automatically places the cube at (0, 0, 0)

scene.add(cube);
cube.position.set(0, 0, 10);
cube.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), Math.PI / 3);


const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);
// X towards preferences bar
// Y towards widget bar
// Z towards user
// Changing camera position
camera.position.set(-10, 10, 0);
console.log(camera.position);
camera.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), Math.PI / 3);
console.log(camera);
console.log(camera.getWorldDirection(new THREE.Vector3(0, 0, 0)));

const testOrbitZCamera = new OrbitZCamera(camera, new THREE.Vector3(0, 0, 0))

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
	new THREE.PlaneGeometry(10, 100),
	new THREE.MeshLambertMaterial({
		color: 0x000000,
	}));
plane.castShadow = false;
plane.receiveShadow = true;
plane.rotation.x = -Math.PI / 2;
scene.add(plane);
// Add another box
const box = new THREE.Mesh(
	new THREE.BoxGeometry(2, 2, 2),
	new THREE.MeshLambertMaterial({
		color: 0xFFFFFF,
	}));
box.position.set(0, 1, 0);
box.castShadow = true;
box.receiveShadow = true;
scene.add(box);

// Add light
const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.5);
scene.add(ambientLight);

const sun = new THREE.DirectionalLight(0xFFFFFF0, 0.5);
sun.position.set(20, 1000, 10);
sun.target.position.set(0, 0, 0);
sun.castShadow = true;
sun.shadow.bias = -0.001;
sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;
sun.shadow.camera.near = 0.1;
sun.shadow.camera.far = 500.0;
sun.shadow.camera.near = 0.5;
sun.shadow.camera.far = 500.0;
sun.shadow.camera.left = 100;
sun.shadow.camera.right = -100;
sun.shadow.camera.top = 100;
sun.shadow.camera.bottom = -100;
scene.add(sun);
// Rendering loop
function animate() {
	// renders every time the screen refreshes only when 
	// we are the current browser tab
	requestAnimationFrame(animate);
	renderer.render(scene, camera);
	testOrbitZCamera.update();
}
animate();