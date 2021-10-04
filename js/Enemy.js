import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';
import * as CANNON from './cannon-es.js';
import { getRandomInt, removeItemFromArray } from './helper.js';
import { Medy } from './Medy.js';
import { Needle } from './Needle.js';
import { EnemyFSM } from './FiniteStateMachine.js';
import { FBXLoader } from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/FBXLoader.js';

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
		this._mesh.name = "enemy";
		this._stopFiring = true;
		this.collisionHandler = this.collide.bind(this);
		this.bindMethod("startHandler", "start");
		this.bindMethod("gameoverHandler", "gameover");
		this._mesh.addEventListener('start', this.startHandler, false);
		this._mesh.addEventListener('gameover', this.gameoverHandler, false);
		this.shootNeedleHandler = function () {
			if (this._stopFiring) {
				return;
			}
			this.shootNeedle();
			this._input._mouseDown = true;
			setTimeout(this.shootNeedleHandler, getRandomInt(1000, { min: 750 }));
		}.bind(this);
		this._body.addEventListener('collide', this.collisionHandler);

		this._animations = {};
		this._input = {
			_mouseDown: false,
		}
		this._stateMachine = new EnemyFSM(this._animations);
		this.loadAnimatedModel();
	}

	loadAnimatedModel() {
		const modelLoader = new FBXLoader();
		modelLoader.setPath('../3D assets/');
		modelLoader.load('ybot.fbx', (fbx) => {
			fbx.scale.setScalar(0.05);
			fbx.traverse(c => {
				c.castShadow = true;
			});

			window.game._threeManager.addToScene(fbx);
			this._fbx = fbx;

			this._mixer = new THREE.AnimationMixer(this._fbx);

			this._manager = new THREE.LoadingManager();
			this._manager.onLoad = () => {
				console.log("manager onload");
				this._stateMachine.setState('rightidle');
			}

			const onAnimLoad = (animName, anim) => {
				// Extracting AnimationClip from loaded Animation
				console.log(this._manager.onLoad);
				const clip = anim.animations[0];
				// creating new AnimationAction
				const action = this._mixer.clipAction(clip);
				this._animations[animName] = {
					clip: clip,
					action: action,
				};
			};

			const animLoader = new FBXLoader(this._manager);
			animLoader.setPath('../3D assets/');
			animLoader.load('idle.fbx', (anim) => {
				onAnimLoad('leftidle', anim);
			});
			animLoader.load('idle.fbx', (anim) => {
				onAnimLoad('rightidle', anim);
			});
			animLoader.load('mixamo_left_punch.fbx', (anim) => {
				onAnimLoad('leftpunch', anim);
			});
			animLoader.load('mixamo_right_punch.fbx', (anim) => {
				onAnimLoad('rightpunch', anim);
			});
			this._fbx.rotation.y = -Math.PI / 2;
		});
	}
	start() {
		if (!this._stopFiring) {
			return;
		}
		this._stateMachine.setState('rightidle');
		this._stopFiring = false;
		setTimeout(this.shootNeedleHandler, getRandomInt(1000, { min: 750 }));
	}

	pause() {
		this.cleanup();
	}

	gameover(event) {
		if (event.outcome == 0) {
			this._stopFiring = true;
		}
	}

	update(deltaTime) {
		// console.log(deltaTime);
		super.update();

		this._stateMachine.update(deltaTime, this._input);
		this._input._mouseDown = false;

		if (this._fbx) {
			this._fbx.position.copy(this._body.position);
		}

		if (this._mixer) {
			// console.log(this._mixer);
			this._mixer.update(deltaTime);
		}
	}

	collide(event) {
		const bodyHit = event.body;
		if (bodyHit.collisionFilterGroup === window.game._cannonManager._palmFilterGroup) {
			this._stopFiring = true;
			removeItemFromArray(this, window.game._enemies);
			window.game.removeMedy(this);
		}
	}

	cleanup() {
		this._stopFiring = true;
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
			const targetPoint = this._target._body.position;
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