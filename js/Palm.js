import * as CANNON from './cannon-es.js';
export class Palm {
	constructor() {
		this.initialize();
	}

	initialize() {
		const handSize = new THREE.Vector3(1, 6, 3);
		const tempPlayerMesh = new THREE.Mesh(
			new THREE.BoxGeometry(handSize.x, handSize.y, handSize.z),
			new THREE.MeshLambertMaterial({
				color: 0xFFFFFF,
			}));
		tempPlayerMesh.castShadow = true;
		tempPlayerMesh.receiveShadow = true;
		this.mesh = tempPlayerMesh;
		// this.lookAtTarget(initVelocity);
		// // Physical player placeholder
		const size = 1;
		const halfExtents = new CANNON.Vec3(handSize.x / 2, handSize.y / 2, handSize.z / 2);
		const boxShape = new CANNON.Box(halfExtents);
		const tempPlayerBody = new CANNON.Body({
			mass: 0.5,
			shape: boxShape,
			material: window.game.cannonManager.palmMaterial,
		});
		this.body = tempPlayerBody;
		window.game.addMeshBody(this.mesh, this.body);
	}

	setFiringLocation(location) {
		this.body.position.set(location.x, location.y, location.z);
	}

	setDirection(direction) {
		this.body.velocity.set(direction.x, direction.y, direction.z);
	}
}