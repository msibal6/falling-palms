import { almostZero } from './helper.js';
import { SphericalPanCamera } from './SphericalPanCamera.js';
import * as CANNON from './cannon-es.js';
import { Airstream } from './Airstream.js';
import { Medy } from './Medy.js';
import { Palm } from './Palm.js';

export class Player extends Medy {
	constructor() {
		const tempPlayerMesh = new THREE.Mesh(
			new THREE.BoxGeometry(2, 2, 2),
			new THREE.MeshLambertMaterial({
				color: 0xFFFFFF,
			}));
		tempPlayerMesh.castShadow = true;
		tempPlayerMesh.receiveShadow = true;
		// // TODO raycasting for shooting palms
		tempPlayerMesh.raycast = function (raycaster, intersects) {
		}
		// // Physical player placeholder
		const size = 1;
		const halfExtents = new CANNON.Vec3(size, size, size);
		const boxShape = new CANNON.Box(halfExtents);
		const tempPlayerBody = new CANNON.Body({
			mass: 1,
			shape: boxShape,
			material: window.game._cannonManager.planeMaterial
		});
		tempPlayerBody.position.set(0, 100, 0);
		tempPlayerBody.addEventListener('collide', function (e) {
			// player collides with other medy and sees it in event.body
			console.log(e);
			console.log(e.target);
			console.log(e.body);
		});
		super(tempPlayerMesh, tempPlayerBody);
		// visual THREE mesh
		// physics CANNON body
		// Wrapped in this._medy
		this.maxSpeed = 80.0;
		this.acceleration = 4.0;
		this.xAcceleration = 0.0;
		this.zAcceleration = 0.0;
		this.damping = 0.85;
		this.camera = null;
	}

	create() {
		window.game.addMedy(this);

		// Camera
		const orbitCamera = new SphericalPanCamera(window.game._threeManager.camera, this._mesh);
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
		const targetVector = new THREE.Vector3();
		targetVector.subVectors(targetPoint, this._mesh.position);
		targetVector.normalize();

		const palmShot = new Palm();
		window.game.addMedy(palmShot);
		palmShot.setFiringLocation(
			this._mesh.position.x,
			this._mesh.position.y - 10,
			this._mesh.position.z
		);
		palmShot.setDirection(targetVector);
		palmShot.setSpeed(150);
	}

	addAirstream(start, end, delta) {
		const newAirstream = new Airstream(this._mesh);
		this.airstreams.push(newAirstream);
		newAirstream.setStart(start);
		newAirstream.setEnd(end);
		newAirstream.setDelta(delta);
		newAirstream.start();
		window.game._threeManager.addToScene(newAirstream.mesh);
	}

	updateAirstreams() {
		if (this.airstreams === undefined || this.airstreams.length == 0) {
			return;
		}
		for (let i = 0; i < this.airstreams.length; i++) {
			this.airstreams[i].update();
		}
	}

	allAirstreamsStopped() {
		if (this.airstreams === undefined || this.airstreams.length == 0) {
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
		super.update();
		// Stops the player body vertically  when it reaches a certain point
		if (this.allAirstreamsStopped()) {
			this.camera.setThetaDelta(0.05);
			this._body.mass = 0;
			this._body.velocity.y = 0;
		}

		this.updateAirstreams();
		this.updateForwardAccelaration("xAcceleration", "w");
		this.updateForwardAccelaration("zAcceleration", "d");
		this.updateBackwardAcceleration("xAcceleration", "s");
		this.updateBackwardAcceleration("zAcceleration", "a");
		// console.log(this._medy);
		this._body.velocity.set(
			this.xAcceleration,
			this._body.velocity.y,
			this.zAcceleration
		);
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