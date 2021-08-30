import * as CANNON from './cannon-es.js';
import { Medy } from './Medy.js';
import { Needle } from './Needle.js';

export class Enemy extends Medy {
	// Enemy tracks targetMesh in visual world
	constructor(targetMesh) {
		const enemyMesh = new THREE.Mesh(
			new THREE.BoxGeometry(2, 2, 2),
			new THREE.MeshLambertMaterial({
				color: 0xFFFFFF,
			}));
		enemyMesh.castShadow = true;
		enemyMesh.receiveShadow = true;
		// // TODO raycasting for shooting palms
		enemyMesh.raycast = function (raycaster, intersects) {
		}
		// // Physical player placeholder
		const size = 1;
		const halfExtents = new CANNON.Vec3(size, size, size);
		const boxShape = new CANNON.Box(halfExtents);
		const enemyBody = new CANNON.Body({
			mass: 1,
			shape: boxShape,
			material: window.game._cannonManager.planeMaterial
		});
		enemyBody.addEventListener('collide', function (e) {
			console.log(e);
		});
		super(enemyMesh, enemyBody);
		this._target = targetMesh;
		// visual THREE mesh
		// physics CANNON body
		// Wrapped in this._mesh and this._body
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