import * as CANNON from './cannon-es.js';
import { getRandomInt } from './helper.js';
import { Medy } from './Medy.js';
import { Needle } from './Needle.js';

export class Enemy extends Medy {
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
		this._dead = false;

		this.shootNeedleHandler = function () {
			if (this._dead) {
				return;
			}
			this.shootNeedle();
			setTimeout(this.shootNeedleHandler, getRandomInt(1000, { min: 750 }));
			console.log(this._mesh);
		}.bind(this);

		// this.shootTimer = setInterval(this.shootNeedleHandler, 2000);

		setTimeout(this.shootNeedleHandler, getRandomInt(1500, { min: 750 }));
		this._body.addEventListener('collide', this.collisionHandler);
	}

	collide(event) {
		const bodyHit = event.body;
		if (bodyHit.collisionFilterGroup === window.game._cannonManager._palmFilterGroup) {
			window.game.removeMedy(this);
			this._dead = true;
		}
	}

	getOptimalAngle(targetLocation) {
		const planeDelta = Math.sqrt(Math.pow(targetLocation.x, 2) + Math.pow(targetLocation.z, 2));
		const angle = Math.atan(targetLocation.y / planeDelta);
		return angle;
	}

	getTravelTime(velocity, firingAngle, targetLocation) {
		const planeDelta = Math.sqrt(Math.pow(targetLocation.x, 2) + Math.pow(targetLocation.z, 2));
		return planeDelta / (Math.cos(firingAngle) * velocity)
	}

	// returns what direction we should aim at
	predictAimingDirection(firingLocation) {
		// get the time step
		const timeDelta = window.game._cannonManager._timeStep;
		let targetTime = 0;
		const maxTime = 5;

		// get the target information
		const targetLocation = this._target._body.position;
		const targetVelocity = this._target._body.velocity;

		// for each time step
		while (targetTime < maxTime) {
			// Calculate the next location
			const predictedLocation =
				targetLocation.vadd(targetVelocity.scale(targetTime));
			const targetDelta = predictedLocation.vsub(firingLocation);
			// Calculate the angle to the next location 
			const firingAngle = this.getOptimalAngle(targetDelta);
			// Calculate the time to predicted location
			// for needle to shoot the next locationo
			const travelTime = this.getTravelTime(50, firingAngle, targetDelta);
			// If solution time greater > time for the object to travel 
			// return the targetDirection
			if (travelTime < targetTime) {
				const targetDirection = targetDelta.unit();
				return targetDirection;
			}
			targetTime += timeDelta;
			// else 
			// recalculate the solution
		}
		return null;
	}

	shootNeedle() {
		const firingLocation = new THREE.Vector3(
			this._body.position.x,
			this._body.position.y + 10,
			this._body.position.z
		);
		const idealTargetDirection = this.predictAimingDirection(firingLocation);

		if (idealTargetDirection != null) {
			const needleShot = new Needle();
			window.game.addMedy(needleShot);
			needleShot.setFiringLocation(firingLocation);
			needleShot.setDirection(idealTargetDirection);
			needleShot.setSpeed(50);
		} else {
			const targetPoint = this._target_body.position;
			const targetVector = new THREE.Vector3();
			targetVector.subVectors(targetPoint, firingLocation);
			targetVector.normalize();
			const needleShot = new Needle();
			window.game.addMedy(needleShot);
			needleShot.setFiringLocation(firingLocation);
			needleShot.setDirection(targetVector);
			needleShot.setSpeed(100);
		}
	}
}