import * as CANNON from './cannon-es.js';
import { getRandomInt } from './helper.js';
import { Medy } from './Medy.js';
import { Needle } from './Needle.js';

export class Enemy extends Medy {
	// Improved tracking to actually hit the target
	// Enemy tracks targetMedy in both ivsual and physical world
	constructor(targetMedy) {
		const enemyMesh = new THREE.Mesh(
			new THREE.BoxGeometry(2, 2, 2),
			new THREE.MeshLambertMaterial({
				color: 0xFFFFFF,
			}));
		enemyMesh.castShadow = true;
		enemyMesh.receiveShadow = true;
		const size = 1;
		const halfExtents = new CANNON.Vec3(size, size, size);
		const boxShape = new CANNON.Box(halfExtents);
		const enemyBody = new CANNON.Body({
			mass: 1,
			shape: boxShape,
			material: window.game._cannonManager.planeMaterial
		});
		// visual THREE mesh
		// physics CANNON body
		// Wrapped in this._mesh and this._body
		super(enemyMesh, enemyBody);

		this._target = targetMedy;
		this.collisionHandler = this.collide.bind(this);
		this.shootNeedleHandler = function () {
			this.shootNeedle();
			setTimeout(this.shootNeedleHandler, getRandomInt(1000, { min: 750 }));
		}.bind(this);
		// this._shootNeedleInterval = window.setInterval(this.shootNeedleHandler, 1000);
		setTimeout(this.shootNeedleHandler, getRandomInt(1500, { min: 750 }));
		this._body.addEventListener('collide', this.collisionHandler);
	}

	collide(event) {
		// console.log(event.body);
		const bodyHit = event.body;
		if (bodyHit.collisionFilterGroup === window.game._cannonManager._palmFilterGroup) {
			// console.log("bye");
			window.game.removeMedy(this);
		}
	}

	predictNextTargetLocation() {

		const targetVelocity = this._target._body.velocity;
		const locationCannon = this._body.position;
		const locationThree = this._body.position;
		console.log(locationCannon);
		console.log(locationThree);
	}
	shootNeedle() {
		const targetPoint = this._target._body.position;
		const targetVector = new THREE.Vector3();
		const firingLocation = new THREE.Vector3(
			this._body.position.x,
			this._body.position.y + 10,
			this._body.position.z
		);
		const predictedLocation = this.predictNextTargetLocation();
		targetVector.subVectors(targetPoint, firingLocation);
		targetVector.normalize();

		const needleShot = new Needle();
		window.game.addMedy(needleShot);
		needleShot.setFiringLocation(firingLocation);
		needleShot.setDirection(targetVector);
		needleShot.setSpeed(30);
	}
}