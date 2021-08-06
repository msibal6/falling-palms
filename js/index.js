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

window.addEventListener('resize', game.threeManager.handleWindowResize(), false);

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

// Add ambient light
const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.5);
game.threeManager.addToScene(ambientLight);

// Add sunlight
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

// Creating the player
game.player.create();


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
	game.player.mesh.position.copy(game.player.body.position);

	// done by cannonManager
	game.cannonManager.update();

	// Player update
	game.player.update();

	// Finally, render
	game.threeManager.render();
}

animate();