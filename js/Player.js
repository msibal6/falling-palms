import { almostZero } from './helper.js';
import { SphericalPanCamera } from './SphericalPanCamera.js';
import * as CANNON from './cannon-es.js';
import { Airstream } from './Airstream.js';
import { Palm } from './Palm.js';
export class Player {
	constructor() {
		// visual THREE mesh
		this.mesh = null;
		// physics CANNON body
		this.body = null;
		this.maxSpeed = 80.0;
		this.acceleration = 4.0;
		this.xAcceleration = 0.0;
		this.zAcceleration = 0.0;
		this.damping = 0.85;
		this.camera = null;
	}

	create() {
		// Add visual player placeholder
		const tempPlayerMesh = new THREE.Mesh(
			new THREE.BoxGeometry(2, 2, 2),
			new THREE.MeshLambertMaterial({
				color: 0xFFFFFF,
			}));
		tempPlayerMesh.castShadow = true;
		tempPlayerMesh.receiveShadow = true;
		this.mesh = tempPlayerMesh;
		// TODO raycasting for shooting palms
		this.mesh.raycast = function (raycaster, intersects) {

		}
		// // Physical player placeholder
		const size = 1;
		const halfExtents = new CANNON.Vec3(size, size, size);
		const boxShape = new CANNON.Box(halfExtents);
		const tempPlayerBody = new CANNON.Body({
			mass: 1,
			shape: boxShape,
			material: game._cannonManager.planeMaterial
		});
		tempPlayerBody.position.set(0, 100, 0);
		this.body = tempPlayerBody;
		this.body.addEventListener('collide', function (e) {
			// console.log(e);
		});
		// console.log(window.game._threeManager);
		window.game.addMeshBody(this.mesh, this.body);

		// Camera
		const orbitCamera = new SphericalPanCamera(window.game._threeManager.camera, this.mesh);
		orbitCamera.setPhiPan(Math.PI, Math.PI);
		orbitCamera.setThetaPan(Math.PI / 4 * 3, Math.PI / 4);
		orbitCamera.setRadius(20);
		this.camera = orbitCamera;

		// Add AirStreams
		this.airstreams = [];
		this.addAirstream(new THREE.Vector3(5, 0, 10),
			new THREE.Vector3(5, 10, 10), 75);
		this.addAirstream(new THREE.Vector3(5, 0, -10),
			new THREE.Vector3(5, 10, -10), 100);
	}
	shootPalm(targetPoint) {
		let targetVector = new THREE.Vector3();
		targetVector.subVectors(targetPoint, this.mesh.position);
		targetVector.normalize();

		const palmShot = new Palm(this.mesh.position, targetVector.multiplyScalar(50));
		palmShot.setFiringLocation(this.mesh.position.x, this.mesh.position.y - 10, this.mesh.position.z);
		// palmShot.setFiringLocation(this.mesh.position);
		palmShot.setDirection(targetVector);
		palmShot.setSpeed(5);
	}
	addAirstream(start, end, delta) {
		const newAirstream = new Airstream(this.mesh);
		this.airstreams.push(newAirstream);
		newAirstream.setStart(start);
		newAirstream.setEnd(end);
		newAirstream.setDelta(delta);
		newAirstream.start();
		window.game._threeManager.addToScene(newAirstream.mesh);
	}
	updateAirstreams() {
		if (this.airstreams === undefined) {
			return;
		}
		for (let i = 0; i < this.airstreams.length; i++) {
			this.airstreams[i].update();
		}
	}
	allAirstreamsStopped() {
		if (this.airstreams === undefined) {
			return true;
		}
		for (let i = 0; i < this.airstreams.length; i++) {
			if (!this.airstreams[i].isStopped()) {
				return false;
			}
		}
		return true;
	}
	updateForwardAccelaration(axis, key) {
		if (keyboardController.pressed[key]) {
			if (this[axis] > this.maxSpeed) {
				this[axis] = this.maxSpeed;
			} else {
				this[axis] += this.acceleration;
			}
		}
	}
	updateBackwardAcceleration(axis, key) {
		if (keyboardController.pressed[key]) {
			if (this[axis] < -this.maxSpeed) {
				this[axis] = -this.maxSpeed;
			} else {
				this[axis] -= this.acceleration;
			}
		}
	}
	update() {
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
	}
	dampenAcceleration() {
		if (almostZero(this.zAcceleration) && almostZero(this.xAcceleration)) {
			return;
		}
		this.zAcceleration *= this.damping;
		this.xAcceleration *= this.damping;
	}
}