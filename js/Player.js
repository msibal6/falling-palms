import { almostZero } from './helper.js';
import { SphericalPanCamera } from './SphericalPanCamera.js';
import * as CANNON from './cannon-es.js';
import { Airstream } from './Airstream.js';
import { Palm } from './Palm.js';
export function Player() {
	// visual THREE mesh
	this.mesh = null;
	// physics CANNON body
	this.body = null;
	this.maxSpeed = 80.0;
	this.acceleration = 4.0;
	this.xcceleration = 0.0;
	this.zcceleration = 0.0;
	this.camera = null;
}

Player.prototype.test = function () {
	console.log("test");
	console.log(window.game);
	console.log(window.game.threeManager);
}

Player.prototype.create = function () {
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
		material: window.game.cannonManager.planeMaterial,
	});
	tempPlayerBody.position.set(0, 100, 0);
	this.body = tempPlayerBody;
	// this.body.addEventVListener('collide', function (e) {
	// 	console.log(e);
	// })
	window.game.addMeshBody(this.mesh, this.body);

	// Camera
	const threeCamera = new THREE.PerspectiveCamera(75,
		window.innerWidth / window.innerHeight, 0.1, 1000);
	const sphericalPanCamera = new SphericalPanCamera(threeCamera, this.mesh);
	sphericalPanCamera.setPhiPan(Math.PI, Math.PI);
	sphericalPanCamera.setThetaPan(Math.PI / 4 * 3, Math.PI / 4);
	sphericalPanCamera.setRadius(20);
	this.camera = sphericalPanCamera;
	window.game.threeManager.camera = threeCamera;

	// Add AirStreams
	this.airstreams = [];
	this.addAirstream(new THREE.Vector3(5, 0, 10),
		new THREE.Vector3(5, 10, 10));
	this.addAirstream(new THREE.Vector3(5, 0, -10),
		new THREE.Vector3(5, 10, -10));
}

Player.prototype.shootPalm = function (targetPoint) {
	let targetVector = new THREE.Vector3();
	targetVector.subVectors(targetPoint, this.mesh.position);
	targetVector.normalize();

	const palmShot = new Palm(this.mesh.position, targetVector.multiplyScalar(50));
	palmShot.setFiringLocation(this.mesh.position.x, this.mesh.position.y - 10, this.mesh.position.z);
	// palmShot.setFiringLocation(this.mesh.position);
	palmShot.setDirection(targetVector);
	palmShot.setSpeed(5);
}
Player.prototype.addAirstream = function (start, end) {
	console.log(this);
	const newAirstream = new Airstream(this.mesh);
	this.airstreams.push(newAirstream);
	newAirstream.setStart(start);
	newAirstream.setEnd(end);
	newAirstream.setDelta(100);
	newAirstream.start();
	window.game.threeManager.addToScene(newAirstream.mesh);
}
Player.prototype.updateAirstreams = function () {
	if (this.airstreams === undefined) {
		return;
	}
	for (let i = 0; i < this.airstreams.length; i++) {
		this.airstreams[i].update();
	}
}

Player.prototype.allAirstreamsStopped = function () {
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
Player.prototype.updateForwardAccelaration = function (axis, key) {
	if (keyboardController.pressed[key]) {
		if (this[axis] > this.maxSpeed) {
			this[axis] = this.maxSpeed;
		} else {
			this[axis] += this.acceleration;
		}
	}
}

Player.prototype.updateBackwardAcceleration = function (axis, key) {
	if (keyboardController.pressed[key]) {
		if (this[axis] < -this.maxSpeed) {
			this[axis] = -this.maxSpeed;
		} else {
			this[axis] -= this.acceleration;
		}
	}
}

Player.prototype.update = function () {
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

Player.prototype.dampenAcceleration = function () {
	if (almostZero(this.zAcceleration) && almostZero(this.xAcceleration)) {
		return;
	}
	this.zAcceleration *= this.damping;
	this.xAcceleration *= this.damping;
}