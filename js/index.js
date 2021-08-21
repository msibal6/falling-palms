import { almostZero } from './helper.js';
import { SphericalPanCamera } from './SphericalPanCamera.js';
import * as CANNON from './cannon-es.js';
import { KeyboardController } from './events.js';
import { ThreeManager } from './ThreeManager.js';
import { CannonManager } from './CannonManager.js';
import { Airstream } from './Airstream.js';
import { Palm } from './Palm.js';


class Game {
	constructor() {
		// visual  is managed by _three manager of the game 
		this.threeManager = new ThreeManager();

		// World is managed by cannon manager of the game
		this.cannonManager = new CannonManager(CANNON);
		this.onMouseClickHandler = this.onMouseClick.bind(this);

		/* Game world the intersection between the two
			is managed by the game
			ie copying position from cannon to three
		*/
		this.player = {
			// visual THREE mesh
			mesh: null,
			// physics CANNON body
			body: null,
			maxSpeed: 80.0,
			acceleration: 4.0,
			xAcceleration: 0.0,
			zAcceleration: 0.0,
			damping: 0.85,
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
				this.body.addEventListener('collide', function (e) {
					console.log(e)
				})
				window.game.addMeshBody(this.mesh, this.body);

				// Camera
				const threeCamera = new THREE.PerspectiveCamera(75,
					window.innerWidth / window.innerHeight, 0.1, 1000);
				const orbitCamera = new SphericalPanCamera(threeCamera, this.mesh);
				orbitCamera.setPhiPan(Math.PI, Math.PI);
				orbitCamera.setThetaPan(Math.PI / 4 * 3, Math.PI / 4);
				orbitCamera.setRadius(20);
				this.camera = orbitCamera;
				window.game.threeManager.camera = threeCamera;

				// Add AirStreams
				this.airstreams = [];
				this.addAirstream(new THREE.Vector3(5, 0, 10),
					new THREE.Vector3(5, 10, 10));
				this.addAirstream(new THREE.Vector3(5, 0, -10),
					new THREE.Vector3(5, 10, -10));
			},
			shootPalm: function (targetPoint) {
				let targetVector = new THREE.Vector3();
				targetVector.subVectors(targetPoint, this.mesh.position);
				targetVector.normalize();
				// const material = new THREE.LineBasicMaterial({
				// 	color: 0x0000ff
				// });

				// const points = [];
				// points.push(this.mesh.position);
				// const testPoint = new THREE.Vector3();
				// testPoint.addVectors(this.mesh.position, targetVector);
				// points.push(testPoint);

				// const geometry = new THREE.BufferGeometry().setFromPoints(points);
				// const line = new THREE.Line(geometry, material);
				// window.game.threeManager.addToScene(line);

				const palmShot = new Palm(this.mesh.position, targetVector.multiplyScalar(50));
				palmShot.setFiringLocation(this.mesh.position.x, this.mesh.position.y - 10, this.mesh.position.z);
				// palmShot.setFiringLocation(this.mesh.position);
				palmShot.setDirection(targetVector);
				palmShot.setSpeed(5);
			},
			addAirstream: function (start, end) {
				const newAirstream = new Airstream(this.mesh);
				this.airstreams.push(newAirstream);
				newAirstream.setStart(start);
				newAirstream.setEnd(end);
				newAirstream.setDelta(100);
				newAirstream.start();
				window.game.threeManager.addToScene(newAirstream.mesh);
			},
			updateAirstreams: function () {
				if (this.airstreams === undefined) {
					return;
				}
				for (let i = 0; i < this.airstreams.length; i++) {
					this.airstreams[i].update();
				}
			},
			allAirstreamsStopped: function () {
				if (this.airstreams === undefined) {
					return true;
				}
				for (let i = 0; i < this.airstreams.length; i++) {
					if (!this.airstreams[i].isStopped()) {
						return false;
					}
				}
				return true;
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
				if (this.allAirstreamsStopped()) {
					this.camera.setThetaDelta(0.05);
					this.body.mass = 0;
					this.body.velocity.y = 0;
				}

				this.updateAirstreams();
				this.updateForwardAccelaration("xAcceleration", "w");
				this.updateForwardAccelaration("zAcceleration", "d");
				this.updateBackwardAcceleration("xAcceleration", "s");
				this.updateBackwardAcceleration("zAcceleration", "a");
				this.body.velocity.set(this.xAcceleration, this.body.velocity.y,
					this.zAcceleration);
				this.dampenAcceleration();
				this.camera.update();
			},
			dampenAcceleration: function () {
				if (almostZero(this.zAcceleration) && almostZero(this.xAcceleration)) {
					return;
				}
				this.zAcceleration *= this.damping;
				this.xAcceleration *= this.damping;
			},
		};

		this.animationLoop = null;

		this.loop = function () {
			this.animationLoop = requestAnimationFrame(this.loop);
			// game updates mesh position from cannon positions
			this.updateMeshBodies();
			// done by cannonManager
			this.cannonManager.update();
			// Player update
			this.player.update();
			// Finally, render
			this.threeManager.render();
		}.bind(this);
	}

	start() {
		this.threeManager.createScene();
		this.cannonManager.createWorld();
		this.player.create();
		window.addEventListener('mousedown', this.onMouseClickHandler, false);
		this.loop();
	}

	addMeshBody(mesh, body) {
		this.threeManager.addMeshBody(mesh);
		this.cannonManager.addMeshBody(body);
	}

	removeMeshBody(mesh, body) {
		this.threeManager.removeMeshBody(mesh);
		this.cannonManager.removeMeshBody(body);
	}


	updateMeshBodies() {
		const meshes = this.threeManager.meshBodies;
		const bodies = this.cannonManager.meshBodies;
		for (let i = 0; i < bodies.length; i++) {
			meshes[i].position.copy(bodies[i].position);
		}
	}

	onMouseClick(event) {
		// calculate mouse position in normalized device coordinates
		// (-1 to +1) for both components
		const raycaster = new THREE.Raycaster();
		const mouse = new THREE.Vector2();
		mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
		raycaster.setFromCamera(mouse, this.player.camera.threeCamera);
		// calculate objects intersecting the picking ray
		const intersects = raycaster.intersectObjects(this.threeManager.scene.children);
		if (intersects.length) {
			console.log(intersects[0]);
			this.player.shootPalm(intersects[0].point);
		}
	}
}

// Window variables 
window.game = new Game();
window.addEventListener('resize', game.threeManager.handleWindowResize(), false);

// Setting up keyboard events
window.keyboardController = new KeyboardController();
window.keyboardController.init();

window.game.start();