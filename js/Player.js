import { almostZero, getRandomInt } from './helper.js';
import { SphericalPanCamera } from './SphericalPanCamera.js';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';
import * as CANNON from './cannon-es.js';
import { FBXLoader } from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/FBXLoader.js';
import { Airstream } from './Airstream.js';
import { Medy } from './Medy.js';
import { Palm } from './Palm.js';
import { PlayerInput } from './PlayerInput.js';
import { PlayerFSM } from './FiniteStateMachine.js';
export class Player extends Medy {
	constructor() {
		// visual mesh
		const tempPlayerMesh = new THREE.Mesh(
			new THREE.BoxGeometry(2, 2, 2),
			new THREE.MeshLambertMaterial({
				color: 0xFFFFFF,
				opacity: 0,
				transparent: true,
			}));
		tempPlayerMesh.castShaodow = true;
		tempPlayerMesh.receiveShadow = true;
		// Physical player body
		const size = 1;
		const halfExtents = new CANNON.Vec3(size, size, size);
		const boxShape = new CANNON.Box(halfExtents);
		const tempPlayerBody = new CANNON.Body({
			mass: 5,
			shape: boxShape,
			material: window.game._cannonManager.planeMaterial
		});
		super(tempPlayerMesh, tempPlayerBody);
		// Initial postion
		this._body.position.set(0, 200, 0);
		this._body.sleep();
		// Event handlers for collision and game control
		this.collisionHandler = this.collide.bind(this);
		this.startHandler = this.start.bind(this);
		this.gameOverHandler = this.gameover.bind(this);
		this.palmHandler = this.onMouseClick.bind(this);
		this._body.addEventListener('collide', this.collisionHandler);
		this._mesh.addEventListener('start', this.startHandler);
		this._mesh.addEventListener('gameover', this.gameOverHandler);
		document.addEventListener('mousedown', this.palmHandler, true);

		// this._mesh.name = "ADFADFADFSADFS";
		// Movement variables
		this.maxSpeed = 80.0;
		this.acceleration = 4.0;
		this.xAcceleration = 0.0;
		this.zAcceleration = 0.0;
		this.damping = 0.85;
		this.camera = null;

		// Animation setup
		this._animations = {};
		this._input = new PlayerInput();
		this._stateMachine = new PlayerFSM(this._animations);
		this.loadAnimatedModel();
	}

	pause() {
		this._airstreams.forEach(function startAirstream(airstream) {
			airstream.stop();
		});
		this._body.sleep();
		this.camera.stopPan();
	}

	start() {
		this._body.wakeUp();
		this._airstreams.forEach(function startAirstream(airstream) {
			airstream.start();
		});
		this.camera.startPan();
	}

	loadAnimatedModel() {
		const modelLoader = new FBXLoader();
		modelLoader.setPath('../3D assets/');
		modelLoader.load('xbot.fbx', (fbx) => {
			fbx.scale.setScalar(0.05);
			fbx.traverse(c => {
				c.castShadow = true;
			});

			window.game._threeManager.addToScene(fbx);
			this._fbx = fbx;

			this._mixer = new THREE.AnimationMixer(this._fbx);

			this._manager = new THREE.LoadingManager();
			this._manager.onLoad = () => {
				this._stateMachine.setState('falling');
			}

			const onAnimLoad = (animName, anim) => {
				// Extracting AnimationClip from loaded Animation
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
			animLoader.load('falling.fbx', (anim) => {
				onAnimLoad('falling', anim);
			});
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
			this._fbx.rotation.y = Math.PI / 2;
		});
	}
	gameover(event) {
		// Won the game
		if (event.outcome == 1) {
			// console.log("i won!!!");
		} else {
			// window.game._threeManager.removeFromScene(this._fbx);
		}
	}

	collide(event) {
		this._body.velocity.set(
			this._body.velocity.x,
			this._body.velocity.y,
			this._body.velocity.z,
		);
		const bodyHit = event.body;
		if (bodyHit.collisionFilterGroup === window.game._cannonManager._needleFilterGroup) {
			this.HitByNeedle();
		} else if (bodyHit.collisionFilterGroup === window.game._cannonManager._groundFilterGroup) {
			window.game.lose();
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
		console.log(this._mesh);
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
		if (intersects.length) {
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
		window.game._threeManager.addVisual(newAirstream._mesh);
	}

	updateAirstreams() {
		// Stops the player body vertically  when it reaches a certain point
		if (this.allAirstreamsStopped()) {
			this.camera.setThetaDelta(0.05);
			this._body.mass = 0;
			this._body.updateMassProperties();
			this._body.velocity.y = 0;
			this._input._foundSelf = true;
		}

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

	update(deltaTime) {
		super.update();
		this._stateMachine.update(deltaTime, this._input);

		if (this._fbx) {
			this._fbx.position.copy(this._body.position);
		}

		if (window.game._enemies.length == 0) {
			window.game.win();
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
		if (this._mixer) {
			this._mixer.update(deltaTime);
		}
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