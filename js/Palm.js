import * as CANNON from './cannon-es.js';
export class Palm {
	constructor() {
		this.initialize();
	}

	initialize() {
		const handSize = new THREE.Vector3(3, 6, 0.5);
		const tempPlayerMesh = new THREE.Mesh(
			new THREE.BoxGeometry(handSize.x, handSize.y, handSize.z),
			new THREE.MeshLambertMaterial({
				color: 0xFFadfb,
			}));
		tempPlayerMesh.castShadow = true;
		tempPlayerMesh.receiveShadow = true;
		this.mesh = tempPlayerMesh;
		const size = 1;
		const halfExtents = new CANNON.Vec3(handSize.x / 2, handSize.y / 2, handSize.z / 2);
		const boxShape = new CANNON.Box(halfExtents);
		const tempPlayerBody = new CANNON.Body({
			mass: 0.5,
			shape: boxShape,
			material: window.game._cannonManager.palmMaterial,
		});
		this.body = tempPlayerBody;
		window.game.addMeshBody(this.mesh, this.body);
		this.collisionHandler = this.collide.bind(this);
		this.body.addEventListener('collide', this.collisionHandler, false);
	}

	collide(event) {
		window.game.removeMeshBody(this.mesh, this.body);
	}

	setFiringLocation(location, y, z) {
		if (location.x === undefined) {
			this.body.position.set(location, y, z);
		} else {
			this.body.position.set(location.x, location.y, location.z);
		}
	}

	setDirection(direction, y, z) {
		const testPoint = new THREE.Vector3();
		if (direction.x === undefined) {
			this.body.velocity.set(direction, y, z);
			testPoint.addVectors(this.mesh.position, new THREE.Vector3(direction, y, z));
		} else {
			this.body.velocity.set(direction.x, direction.y, direction.z);
			testPoint.addVectors(this.mesh.position, direction);
		}
		// const points = [];
		// points.push(this.mesh.position);
		// console.log(testPoint);
		this.mesh.lookAt(testPoint);
		// points.push(testPoint);

		// const geometry = new THREE.BufferGeometry().setFromPoints(points);
		// const line = new THREE.Line(geometry, material);
		// window.game.threeManager.addToScene(line);

	}
	setSpeed(speed) {
		this.body.velocity.scale(speed, this.body.velocity);
	}
}