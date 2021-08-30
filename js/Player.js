import { almostZero, getRandomInt } from './helper.js';
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
		super(tempPlayerMesh, tempPlayerBody);
		this._body.position.set(0, 100, 0);
		this.collisionHandler = this.collide.bind(this);
		this._body.addEventListener('collide', this.collisionHandler);
		// visual THREE mesh
		// physics CANNON body
		this.maxSpeed = 80.0;
		this.acceleration = 4.0;
		this.xAcceleration = 0.0;
		this.zAcceleration = 0.0;
		this.damping = 0.85;
		this.camera = null;
	}

	collide(event) {
		const bodyHit = event.body;
		// console.log(bodyHit);
		if (bodyHit.collisionFilterGroup === window.game._cannonManager._needleFilterGroup) {
			this.HitByNeedle();
		}
	}

	HitByNeedle() {
		if (!this.allAirstreamsStopped()) {
			const stoppedAirstreams = [];
			for (let i = 0; i < this._airstreams.length; i++) {
				if (this._airstreams[i].isStopped()) {
					stoppedAirstreams.push(i);
				}
			}
			const index = getRandomInt(stoppedAirstreams.length);
			this._airstreams[stoppedAirstreams[index]].start();
		}
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
		this._airstreams = [];
		this.addAirstream(new THREE.Vector3(5, 0, 10),
			new THREE.Vector3(5, 10, 10), 75);
		this.addAirstream(new THREE.Vector3(5, 0, -10),
			new THREE.Vector3(5, 10, -10), 100);
		this.addAirstream(new THREE.Vector3(0, 0, -10),
			new THREE.Vector3(2, 10, -10), 100);
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
		this._airstreams.push(newAirstream);
		newAirstream.setStart(start);
		newAirstream.setEnd(end);
		newAirstream.setDelta(delta);
		newAirstream.start();
		window.game._threeManager.addToScene(newAirstream.mesh);
	}

	updateAirstreams() {
		if (this._airstreams === undefined || this._airstreams.length === 0) {
			return;
		}
		for (let i = 0; i < this._airstreams.length; i++) {
			this._airstreams[i].update();
		}
	}

	allAirstreamsStopped() {
		if (this._airstreams === undefined || this._airstreams.length === 0) {
			return true;
		}
		for (let i = 0; i < this._airstreams.length; i++) {
			if (!this._airstreams[i].isStopped()) {
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