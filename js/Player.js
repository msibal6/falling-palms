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
		tempPlayerMesh.castShaodow = true;
		tempPlayerMesh.receiveShadow = true;
		// // TODO raycasting for shooting palms
		tempPlayerMesh.raycast = function (raycaster, intersects) {
		}
		// // Physical player placeholder
		const size = 1;
		const halfExtents = new CANNON.Vec3(size, size, size);
		const boxShape = new CANNON.Box(halfExtents);
		const tempPlayerBody = new CANNON.Body({
			mass: 5,
			shape: boxShape,
			material: window.game._cannonManager.planeMaterial
		});
		super(tempPlayerMesh, tempPlayerBody);
		this._body.position.set(0, 100, 0);
		this.collisionHandler = this.collide.bind(this);
		this._body.addEventListener('collide', this.collisionHandler);

		this.onMouseClickHandler = this.onMouseClick.bind(this);
		window.addEventListener('mousedown', this.onMouseClickHandler, false);

		// visual THREE mesh
		// physics CANNON body
		this._mesh.name = "ADFADFADFSADFS";
		this.maxSpeed = 80.0;
		this.acceleration = 4.0;
		this.xAcceleration = 0.0;
		this.zAcceleration = 0.0;
		this.damping = 0.85;
		this.camera = null;
	}

	collide(event) {
		// console.log(this._body.velocity);
		// this._body.velocity.set(
		// 	this._body.velocity.x,
		// 	this._body.velocity.y,
		// 	this._body.velocity.z,
		// );
		const bodyHit = event.body;
		if (bodyHit.collisionFilterGroup === window.game._cannonManager._needleFilterGroup) {
			this.HitByNeedle();
		} else if (bodyHit.collisionFilterGroup === window.game._cannonManager._groundFilterGroup) {
			console.log("game over");
			// window.cancelAnimationFrame(window.game._animationLoop);
			window.game.restart();
			// alert("hit the ground")
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
			if (stoppedAirstreams.length > 0) {
				const index = getRandomInt(stoppedAirstreams.length);
				this._airstreams[stoppedAirstreams[index]].start();
			}
		}
	}

	create() {
		window.game.addMedy(this);
		console.log(window.game._medies);

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

	onMouseClick(event) {
		// calculate mouse position in normalized device coordinates
		// (-1 to +1) for both components
		const raycaster = new THREE.Raycaster();
		const mouse = new THREE.Vector2();
		mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
		raycaster.setFromCamera(mouse, this.camera.threeCamera);

		// calculate objects intersecting the picking ray
		const intersects = raycaster.intersectObjects(window.game._threeManager.scene.children);
		// console.log("shjoot");
		if (intersects.length) {
			// console.log("shoootpalm");
			this.shootPalm(intersects[0].point);
		}
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
		window.game._threeManager.addVisual(newAirstream.mesh);
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
		this._body.velocity.set(
			this.xAcceleration,
			this._body.velocity.y,
			this.zAcceleration
		);
		this.dampenAcceleration();
		this.camera.update();
	}

	dampenAcceleration() {
		if (almostZero(this.zAcceleration, 0.0001) && almostZero(this.xAcceleration, 0.0001)) {
			this.zAcceleration = 0;
			this.xAcceleration = 0;
			return;
		}
		this.zAcceleration *= this.damping;
		this.xAcceleration *= this.damping;
	}
}