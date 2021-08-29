import * as CANNON from './cannon-es.js';
import { Medy } from './Medy.js';

export class OldPalm2 {
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
			mass: 0.0,
			shape: boxShape,
			material: window.game._cannonManager.palmMaterial,
		});
		this._medy = new Medy(tempPlayerMesh, tempPlayerBody);
		this._medy.maintain = this.maintain.bind(this);
		this._medy.update = this.update.bind(this);

		this.collisionHandler = this.collide.bind(this);
		// console.log(super);
		// console.log(super.test());
		this._medy._body.addEventListener('collide', this.collisionHandler, false);
	}

	collide(event) {
		console.log(event);
		console.log(this);
		window.game.removeMedy(this._medy);
	}

	setFiringLocation(location, y, z) {
		if (location.x === undefined) {
			this._medy._body.position.set(location, y, z);
		} else {
			this._medy._body.position.set(location.x, location.y, location.z);
		}
	}

	setDirection(direction, y, z) {
		const testPoint = new THREE.Vector3();
		if (direction.x === undefined) {
			this._direction = new THREE.Vector3(direction, y, z);
			this._medy._body.velocity.set(direction, y, z);
			testPoint.addVectors(this._medy._mesh.position, new THREE.Vector3(direction, y, z));
		} else {
			this._direction = direction.clone();
			this._medy._body.velocity.set(direction.x, direction.y, direction.z);
			testPoint.addVectors(this._medy._mesh.position, direction);
		}
		this._medy._mesh.lookAt(testPoint);
	}

	setSpeed(speed) {
		this._speed = speed;
		this._medy._body.velocity.scale(speed, this._medy._body.velocity);
	}

	maintain() {
		this._medy._body.velocity.set(10, 10, 10);
		// this._medy._body.velocity.scale(this._speed, this._medy._body.velocity);
	}

	update() {
		console.log(this);
		this._medy._mesh.position.copy(this._medy._body.position);
	}
}