import { getNormalizedVector, almostZero } from './helper.js';
import { SphericalPanCamera } from './OrbitCamera.js';
import * as CANNON from './cannon-es.js';
import { KeyboardController } from './events.js';

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


const player = {
	maxSpeed: 20.0,
	acceleration: 1.0,
	xAcceleration: 0.0,
	zAcceleration: 0.0,
	damping: 0.9,
}

// scene.add automatically places the cube at (0, 0, 0)
scene.add(cube);
cube.position.set(0, 0, 10);
cube.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), Math.PI / 3);

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

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
box.castShadow = true;
box.receiveShadow = true;
scene.add(box);

const orbitCamera = new SphericalPanCamera(camera, box);
orbitCamera.setPhiPan(Math.PI, Math.PI);
orbitCamera.setThetaPan(Math.PI / 4 * 3, Math.PI / 4);
orbitCamera.setRadius(10);
camera.position.set(0, 5, 10);

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
// Cannon-es physics
const world = new CANNON.World({
	gravity: new CANNON.Vec3(0, -10, 0), // m/s²
});


const size = 1
const halfExtents = new CANNON.Vec3(size, size, size);
const boxShape = new CANNON.Box(halfExtents);
const boxBody = new CANNON.Body({ mass: 1, shape: boxShape, });
boxBody.position.set(0, 100, 0);
world.addBody(boxBody)

const planeShape = new CANNON.Plane();
const planeMaterial = new CANNON.Material({ friction: 0, });
const planeBody = new CANNON.Body({ mass: 0, shape: planeShape, material: planeMaterial, });
planeBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0); // make it face up
world.addBody(planeBody);

const timeStep = 1 / 60; // seconds
let lastCallTime;

const keyboardController = new KeyboardController();
keyboardController.init();

// Rendering loop
function animate() {

	// renders every time the screen refreshes only when 
	// we are the current browser tab
	requestAnimationFrame(animate);

	// Physics update
	// Stops the boxbody when reaches a certain point
	// if (boxBody.position.y <= 30) {
	// 	boxBody.mass = 0;
	// 	boxBody.velocity.y = 0;
	// }
	box.position.copy(boxBody.position);
	const time = performance.now() / 1000; // seconds
	if (!lastCallTime) {
		world.step(timeStep);
	} else {
		const dt = time - lastCallTime;
		world.step(timeStep, dt);
	}
	lastCallTime = time;
	// Player update
	updatePlayer();
	// Finally, render
	renderer.render(scene, camera);
}
animate();

function updatePlayer() {

	// TODO velocity for either direction is not independent
	// and affects each other

	// if (keyboardController.pressed["w"]) {
	// 	boxBody.velocity.x = 10;
	// }
	// if (keyboardController.pressed["s"]) {
	// 	boxBody.velocity.x = -10;
	// }
	// if (keyboardController.pressed["a"]) {
	// 	boxBody.velocity.z = -10;
	// }
	// if (keyboardController.pressed["d"]) {
	// 	boxBody.velocity.z = 10;
	// }
	if (keyboardController.pressed["w"]) {
		if (player.xAcceleration > player.maxSpeed) {
			player.xAcceleration = player.maxSpeed;
		} else {
			player.xAcceleration += player.acceleration;
		}
	}
	if (keyboardController.pressed["s"]) {
		if (player.xAcceleration < -player.maxSpeed) {
			player.xAcceleration = -player.maxSpeed;
		} else {
			player.xAcceleration -= player.acceleration;
		}
	}
	if (keyboardController.pressed["a"]) {
		if (player.zAcceleration < -player.maxSpeed) {
			player.zAcceleration = -player.maxSpeed;
		} else {
			player.zAcceleration -= player.acceleration;
		}
	}
	if (keyboardController.pressed["d"]) {
		if (player.zAcceleration > player.maxSpeed) {
			player.zAcceleration = player.maxSpeed;
		} else {
			player.zAcceleration += player.acceleration;
		}
	}
	if (keyboardController.pressed["space"]) {
		console.log(boxBody.position);
		console.log(boxBody.velocity);
		console.log(player);
	}
	boxBody.velocity.set(player.xAcceleration, boxBody.velocity.y, player.zAcceleration);
	dampen();
	orbitCamera.update();
}

function dampen() {
	if (keyboardController.hasNoKeysDown()) {
		if (almostZero(player.zAcceleration) && almostZero(player.xAcceleration)) {
			return;
		}
		player.zAcceleration *= player.damping;
		player.xAcceleration *= player.damping;
	}
}

