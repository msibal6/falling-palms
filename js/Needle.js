import * as CANNON from './cannon-es.js';
import { Medy } from './Medy.js';

export class Needle extends Medy {
	constructor() {
		const needleDimensions = new THREE.Vector3(0.5, 0.5, 5);
		const needleMesh = new THREE.Mesh(
			new THREE.BoxGeometry(
				needleDimensions.x,
				needleDimensions.y,
				needleDimensions.z
			),
			new THREE.MeshLambertMaterial({
				color: 0xFFadfb,
			}));
		needleMesh.castShadow = true;
		needleMesh.receiveShadow = true;
		needleMesh.name = "needle";
		const halfExtents = new CANNON.Vec3(
			needleDimensions.x / 2,
			needleDimensions.y / 2,
			needleDimensions.z / 2
		);
		const needleShape = new CANNON.Box(halfExtents);
		const needleBody = new CANNON.Body({
			mass: 1,
			shape: needleShape,
			material: window.game._cannonManager.palmMaterial,
		});
		super(needleMesh, needleBody);
		this.collisionHandler = this.collide.bind(this);
		this._body.addEventListener('collide', this.collisionHandler, false);
		this._body.collisionFilterGroup = window.game._cannonManager._needleFilterGroup;
		this.updatedWithMass = false;
	}

	// TODO optimization of deletion of needles and palms
	collide(event) {
		window.game.removeMedy(this);
	}

	setFiringLocation(location, y, z) {
		if (location.x === undefined) {
			this._body.position.set(location, y, z);
		} else {
			this._body.position.set(location.x, location.y, location.z);
		}
	}

	// accepts either a vector3 or three floats
	setDirection(direction, y, z) {
		const testPoint = new THREE.Vector3();
		if (direction.x === undefined) {
			this._direction = new THREE.Vector3(direction, y, z);
			this._body.velocity.set(direction, y, z);
			testPoint.addVectors(this._mesh.position, new THREE.Vector3(direction, y, z));
		} else {
			this._direction = direction.clone();
			this._body.velocity.set(direction.x, direction.y, direction.z);
			testPoint.addVectors(this._mesh.position, direction);
		}
		this._mesh.lookAt(testPoint);
		this._body.quaternion.copy(this._mesh.quaternion);
	}

	setSpeed(speed) {
		this._speed = speed;
		this._body.velocity.scale(speed, this._body.velocity);
	}

	maintainTrajectory() {
		this._body.velocity.set(
			this._direction.x,
			this._direction.y,
			this._direction.z
		);
		this._body.velocity.scale(this._speed, this._body.velocity);
	}

	update() {
		super.update();
		this.maintainTrajectory();
		if (!this.updatedWithMass) {
			this.updatedWithMass = true;
			this._body.mass = 0;
		}
	}
}