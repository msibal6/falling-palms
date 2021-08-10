import { getNormalizedVector, almostZero } from './helper.js';
import { SphericalPanCamera } from './OrbitCamera.js';
import * as CANNON from './cannon-es.js';
import { printo, KeyboardController } from './events.js';
import { ThreeManager } from './ThreeManager.js';
import { CannonManager } from './CannonManager.js';
import { AirStream } from './Airstream.js';


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
				const tempPlayerBody = new CANNON.Body({
					mass: 1,
					shape: boxShape,
					material: game.cannonManager.planeMaterial
				});
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
				orbitCamera.setRadius(20);
				this.camera = orbitCamera;
				game.threeManager.camera = threeCamera;
			},
			updateForwardAccelaration: function (axis, key) {
				if (keyboardController.pressed[key]) {
					if (this[axis] > this.maxSpeed) {
						this[axis] = this.maxSpeed;
					} else {
						this[axis] += this.acceleration;
					}
				}
			},
			updateBackwardAcceleration: function (axis, key) {
				if (keyboardController.pressed[key]) {
					if (this[axis] < -this.maxSpeed) {
						this[axis] = -this.maxSpeed;
					} else {
						this[axis] -= this.acceleration;
					}
				}
			},
			update: function () {
				// Stops the player body vertically  when it reaches a certain point
				// noticed by the game 
				// done by the player
				// if (boxBody.position.y <= 30) {
				// 	boxBody.mass = 0;
				// 	boxBody.velocity.y = 0;
				// }
				this.updateForwardAccelaration("xAcceleration", "w");
				this.updateForwardAccelaration("zAcceleration", "d");
				this.updateBackwardAcceleration("xAcceleration", "s");
				this.updateBackwardAcceleration("zAcceleration", "a");
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

		this.animationLoop = null;

		this.loop = function () {
			this.animationLoop = requestAnimationFrame(this.loop);
			// TODO
			// Managing the position of the player
			this.player.mesh.position.copy(this.player.body.position);
			// done by cannonManager
			this.cannonManager.update();

			// Player update
			this.player.update();

			this.testAirStream.update();
			// Finally, render
			this.threeManager.render();
		}.bind(this);

		this.start = function () {
			this.threeManager.createScene();
			this.cannonManager.createWorld();
			this.player.create();
			this.testAirstream();
			window.addEventListener('mousedown', this.onMouseClick(), false);
			this.loop();
		}
	}

	testAirstream() {
		this.testAirStream = new AirStream(game.player.mesh);
		this.testAirStream.setStart(new THREE.Vector3(5, 0, 10));
		this.testAirStream.setEnd(new THREE.Vector3(5, 10, 10));
		this.testAirStream.setDelta(100);
		this.testAirStream.start();
		this.threeManager.addToScene(this.testAirStream.mesh);
	}

	onMouseClick() {
		return function (event) {
			// calculate mouse position in normalized device coordinates
			// (-1 to +1) for both components
			const raycaster = new THREE.Raycaster();
			const mouse = new THREE.Vector2();
			mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
			mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
			raycaster.setFromCamera(mouse, this.player.camera.threeCamera);
			// calculate objects intersecting the picking ray
			const intersects = raycaster.intersectObject(this.testAirStream.mesh);
			if (intersects.length > 0) {
				console.log(intersects[0]);
			}
		}.bind(this);
	}
}

// Window variables 
const game = new Game();

// Setting up keyboard events
const keyboardController = new KeyboardController();
keyboardController.init();

window.addEventListener('resize', game.threeManager.handleWindowResize(), false);

game.start();