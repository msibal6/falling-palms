import { getNormalizedVector, almostZero } from './helper.js';
import { SphericalPanCamera } from './OrbitCamera.js';
import * as CANNON from './cannon-es.js';
import { printo, KeyboardController } from './events.js';
import { ThreeManager } from './ThreeManager.js';
import { CannonManager } from './CannonManager.js';


class Game {
	constructor() {
		// visual  is managed by _three manager of the game 
		this.threeManager = new ThreeManager();

		// World is managed by cannon manager of the game
		this.cannonManager = new CannonManager(CANNON);

		/* Game world the intersection between the two
			is managed by the game
			ie copying position from cannon to three
		*/
		this.player = {
			// visual THREE mesh
			mesh: null,
			// physics CANNON body
			body: null,
			maxSpeed: 20.0,
			acceleration: 1.0,
			xAcceleration: 0.0,
			zAcceleration: 0.0,
			damping: 0.9,
			camera: null,
			create: function () {
				// Add visual player placeholder
				const tempPlayerMesh = new THREE.Mesh(
					new THREE.BoxGeometry(2, 2, 2),
					new THREE.MeshLambertMaterial({
						color: 0xFFFFFF,
					}));
				tempPlayerMesh.castShadow = true;
				tempPlayerMesh.receiveShadow = true;
				game.threeManager.addToScene(tempPlayerMesh)
				this.mesh = tempPlayerMesh;

				// // Physical player placeholder
				const size = 1;
				const halfExtents = new CANNON.Vec3(size, size, size);
				const boxShape = new CANNON.Box(halfExtents);
				const tempPlayerBody = new CANNON.Body({ mass: 1, shape: boxShape, material: game.cannonManager.planeMaterial });
				tempPlayerBody.position.set(0, 100, 0);
				this.body = tempPlayerBody;
				game.cannonManager.world.addBody(tempPlayerBody);

				// Camera
				const threeCamera = new THREE.PerspectiveCamera(75,
					window.innerWidth / window.innerHeight, 0.1, 1000);
				// Orbit camera tracks position of player mesh in the visual scene
				const orbitCamera = new SphericalPanCamera(threeCamera, this.mesh);
				orbitCamera.setPhiPan(Math.PI, Math.PI);
				orbitCamera.setThetaPan(Math.PI / 4 * 3, Math.PI / 4);
				orbitCamera.setRadius(10);
				this.camera = orbitCamera;
				game.threeManager.camera = threeCamera;
			},
			update: function () {
				if (keyboardController.pressed["w"]) {
					if (this.xAcceleration > this.maxSpeed) {
						this.xAcceleration = this.maxSpeed;
					} else {
						this.xAcceleration += this.acceleration;
					}
				}
				if (keyboardController.pressed["s"]) {
					if (this.xAcceleration < -this.maxSpeed) {
						this.xAcceleration = -this.maxSpeed;
					} else {
						this.xAcceleration -= this.acceleration;
					}
				}
				if (keyboardController.pressed["a"]) {
					if (this.zAcceleration < -this.maxSpeed) {
						this.zAcceleration = -this.maxSpeed;
					} else {
						this.zAcceleration -= this.acceleration;
					}
				}
				if (keyboardController.pressed["d"]) {
					if (this.zAcceleration > this.maxSpeed) {
						this.zAcceleration = this.maxSpeed;
					} else {
						this.zAcceleration += this.acceleration;
					}
				}
				// if (keyboardController.pressed["space"]) {
				// 	console.log(boxBody.position);
				// 	console.log(boxBody.velocity);
				// }
				this.body.velocity.set(this.xAcceleration, this.body.velocity.y, this.zAcceleration);
				this.dampenAcceleration();
				this.camera.update();
			},
			dampenAcceleration: function () {
				if (keyboardController.hasNoKeysDown()) {
					if (almostZero(this.zAcceleration) && almostZero(this.xAcceleration)) {
						return;
					}
					this.zAcceleration *= this.damping;
					this.xAcceleration *= this.damping;
				}
			},
		}
	}
}

// Window variables 
const game = new Game();
// Setting up keyboard events
const keyboardController = new KeyboardController();
keyboardController.init();

// setting up the visual in three
// Scene
// const scene = game.threeManager.createScene();
// Camera
// const camera = new THREE.PerspectiveCamera(75,
// 	window.innerWidth / window.innerHeight, 0.1, 1000);
// Renderer
// const renderer = new THREE.WebGLRenderer();
// renderer.setSize(window.innerWidth, window.innerHeight);
// document.body.appendChild(renderer.domElement);
// Resizing the window on resize 
// might delete

// TODO put this in three manager 
window.addEventListener('resize', game.threeManager.handleWindowResize(), false);
// function handleWindowResize() {
// 	// update height and width of the renderer and the camera
// 	console.log("resizing in index");
// 	const windowHeight = window.innerHeight;
// 	const windowWidth = window.innerWidth;
// 	renderer.setSize(windowWidth, windowHeight);
// 	camera.aspect = windowWidth / windowHeight;
// 	camera.updateProjectionMatrix();
// }

// Placing a cube in the scene
// const geometry = new THREE.BoxGeometry();
// const material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
// const cube = new THREE.Mesh(geometry, material);

// const player = {
// 	// visual
// 	// THREE mesh
// 	mesh: null,
// 	// physics
// 	// cannon body
// 	body: null,
// 	maxSpeed: 20.0,
// 	acceleration: 1.0,
// 	xAcceleration: 0.0,
// 	zAcceleration: 0.0,
// 	damping: 0.9,
// 	camera: null,

// }

// Scene

// const axesHelper = new THREE.AxesHelper(5);
// scene.add(axesHelper);

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
game.threeManager.scene.background = texture;
// Add the visual floor
const plane = new THREE.Mesh(
	new THREE.PlaneGeometry(10, 100),
	new THREE.MeshLambertMaterial({
		color: 0x000000,
	}));
plane.castShadow = false;
plane.receiveShadow = true;
plane.rotation.x = -Math.PI / 2;
game.threeManager.addToScene(plane);

// Add visual player placeholder
// const box = new THREE.Mesh(
// 	new THREE.BoxGeometry(2, 2, 2),
// 	new THREE.MeshLambertMaterial({
// 		color: 0xFFFFFF,
// 	}));
// box.castShadow = true;
// box.receiveShadow = true;
// scene.add(box);
// player.mesh = box;

// Orbit camera tracks position of player mesh in the visual scene
// const orbitCamera = new SphericalPanCamera(camera, player.mesh);
// orbitCamera.setPhiPan(Math.PI, Math.PI);
// orbitCamera.setThetaPan(Math.PI / 4 * 3, Math.PI / 4);
// orbitCamera.setRadius(10);
// player.camera = orbitCamera;

// Add light
const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.5);
game.threeManager.addToScene(ambientLight);

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
game.threeManager.addToScene(sun);

// Cannon-es physics
// const world = new CANNON.World({
// 	gravity: new CANNON.Vec3(0, -10, 0), // m/s²
// });

// // Program contact between floor material and itself
// const planeMaterial = new CANNON.Material({ friction: 0, });
// const contactMaterial = new CANNON.ContactMaterial(planeMaterial, planeMaterial,
// 	{ friction: 0, restitution: 0.1, });
// world.addContactMaterial(contactMaterial);
// console.log(world);

// Physical floor
const planeShape = new CANNON.Plane();
const planeBody = new CANNON.Body({
	mass: 0,
	shape: planeShape,
	material: game.cannonManager.planeMaterial,
});
planeBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0); // make it face up
planeBody.position.set(0, 0, 0);
game.cannonManager.world.addBody(planeBody);

// Physical player placeholder
// const size = 1
// const halfExtents = new CANNON.Vec3(size, size, size);
// const boxShape = new CANNON.Box(halfExtents);
// const boxBody = new CANNON.Body({ mass: 1, shape: boxShape, material: planeMaterial });
// boxBody.position.set(0, 100, 0);
// world.addBody(boxBody);
// player.body = boxBody;

game.player.create();

// console.log(game.threeManager);
const timeStep = 1 / 60; // seconds
let lastCallTime;

// Rendering loop
function animate() {
	requestAnimationFrame(animate);

	// Stops the player body vertically  when it reaches a certain point
	// noticed by the game 
	// done by the player
	// if (boxBody.position.y <= 30) {
	// 	boxBody.mass = 0;
	// 	boxBody.velocity.y = 0;
	// }
	// done by the game 

	// box.position.copy(boxBody.position);
	game.player.mesh.position.copy(game.player.body.position);
	// done by cannonManager
	game.cannonManager.update();
	// const time = performance.now() / 1000; // seconds
	// if (!lastCallTime) {
	// 	world.step(timeStep);
	// } else {
	// 	const dt = time - lastCallTime;
	// 	world.step(timeStep, dt);
	// }
	// lastCallTime = time;

	// Player update
	// done by the player in game
	// updatePlayer();
	game.player.update();

	// Finally, render
	// Done by the threeManager
	// renderer.render(scene, camera);
	game.threeManager.render();
}

// function updatePlayer() {
// 	if (keyboardController.pressed["w"]) {
// 		if (player.xAcceleration > player.maxSpeed) {
// 			player.xAcceleration = player.maxSpeed;
// 		} else {
// 			player.xAcceleration += player.acceleration;
// 		}
// 	}
// 	if (keyboardController.pressed["s"]) {
// 		if (player.xAcceleration < -player.maxSpeed) {
// 			player.xAcceleration = -player.maxSpeed;
// 		} else {
// 			player.xAcceleration -= player.acceleration;
// 		}
// 	}
// 	if (keyboardController.pressed["a"]) {
// 		if (player.zAcceleration < -player.maxSpeed) {
// 			player.zAcceleration = -player.maxSpeed;
// 		} else {
// 			player.zAcceleration -= player.acceleration;
// 		}
// 	}
// 	if (keyboardController.pressed["d"]) {
// 		if (player.zAcceleration > player.maxSpeed) {
// 			player.zAcceleration = player.maxSpeed;
// 		} else {
// 			player.zAcceleration += player.acceleration;
// 		}
// 	}
// 	// if (keyboardController.pressed["space"]) {
// 	// 	console.log(boxBody.position);
// 	// 	console.log(boxBody.velocity);
// 	// }
// 	player.body.velocity.set(player.xAcceleration, player.body.velocity.y, player.zAcceleration);
// 	dampenAcceleration();
// 	player.camera.update();
// }

// function dampenAcceleration() {
// 	if (keyboardController.hasNoKeysDown()) {
// 		if (almostZero(player.zAcceleration) && almostZero(player.xAcceleration)) {
// 			return;
// 		}
// 		player.zAcceleration *= player.damping;
// 		player.xAcceleration *= player.damping;
// 	}
// }

animate();