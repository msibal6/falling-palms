import * as CANNON from './cannon-es.js';
import { Medy } from './Medy.js';
import { Needle } from './Needle.js';

export class Enemy extends Medy {
	// Improved tracking to actually hit the target
	// Enemy tracks targetMesh in visual world
	constructor(targetMesh) {
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

		this._target = targetMesh;
		this.collisionHandler = this.collide.bind(this);
		this.shootNeedleHandler = this.shootNeedle.bind(this);
		this._shootNeedleInterval = window.setInterval(this.shootNeedleHandler, 1000);
		this._body.addEventListener('collide', this.collisionHandler);
	}

	collide(event) {
		console.log(event.body);
		const bodyHit = event.body;
		if (bodyHit.collisionFilterGroup === window.game._cannonManager._palmFilterGroup) {
			// console.log("bye");
			window.game.removeMedy(this);
		}
	}

	shootNeedle() {
		const targetPoint = this._target.position;
		const targetVector = new THREE.Vector3();
		targetVector.subVectors(targetPoint, this._mesh.position);
		targetVector.normalize();

		const needleShot = new Needle();
		window.game.addMedy(needleShot);
		needleShot.setFiringLocation(
			this._mesh.position.x,
			this._mesh.position.y + 10,
			this._mesh.position.z
		);
		needleShot.setDirection(targetVector);
		needleShot.setSpeed(15);
	}
}