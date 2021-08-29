import * as CANNON from './cannon-es.js';
import { Medy } from './Medy.js';

export class Palm2 extends Medy {
	constructor() {
		const handSize = new THREE.Vector3(3, 6, 0.5);
		const tempPlayerMesh = new THREE.Mesh(
			new THREE.BoxGeometry(handSize.x, handSize.y, handSize.z),
			new THREE.MeshLambertMaterial({
				color: 0xFFadfb,
			}));
		tempPlayerMesh.castShadow = true;
		tempPlayerMesh.receiveShadow = true;
		const halfExtents = new CANNON.Vec3(handSize.x / 2, handSize.y / 2, handSize.z / 2);
		const boxShape = new CANNON.Box(halfExtents);
		const tempPlayerBody = new CANNON.Body({
			mass: 1,
			shape: boxShape,
			material: window.game._cannonManager.palmMaterial,
		});
		super(tempPlayerMesh, tempPlayerBody);


		this.collisionHandler = this.collide.bind(this);
		this._body.addEventListener('collide', this.collisionHandler, false);
		this.updatedWithMass = false;
	}

	collide(event) {
		// console.log(event);
		// console.log(this);
		window.game.removeMedy(this);
	}

	setFiringLocation(location, y, z) {
		if (location.x === undefined) {
			this._body.position.set(location, y, z);
		} else {
			this._body.position.set(location.x, location.y, location.z);
		}
	}

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
			console.log("set mass to 0");
		}
	}
}