import * as CANNON from './cannon-es.js';
import { removeItemFromArray } from './helper.js';
export class CannonManager {
	constructor() {
		this.timeStep = 1 / 60;
		this.lastCallTime = null;
		this._physicals = [];
		this.meshBodiesToRemove = [];

		this.world = new CANNON.World({
			gravity: new CANNON.Vec3(0, -10, 0), // m/s²
		});

		// Program contact between floor material and itself
		this.planeMaterial = new CANNON.Material({ friction: 0, });
		this.contactMaterial = new CANNON.ContactMaterial(this.planeMaterial, this.planeMaterial,
			{ friction: 0, restitution: 0.0, });
		this.world.addContactMaterial(this.contactMaterial);
		// Palm Material
		this.palmMaterial = new CANNON.Material({ friction: 5, });
		this.palmContact = new CANNON.ContactMaterial(this.palmMaterial, this.planeMaterial,
			{ friction: 0, restitution: 0.0 });
		this.world.addContactMaterial(this.palmContact);
	}

	addPhysical(meshBody) {
		this._physicals.push(meshBody);
		this.world.addBody(meshBody);
	}

	removePhysical(meshBody) {
		this.killBody(meshBody);
		removeItemFromArray(meshBody, this._physicals);
	}

	removeDeadMeshBodies() {
		for (let i = 0; i < this.meshBodiesToRemove.length; i++) {
			const meshBody = this.meshBodiesToRemove[i];
			this.world.removeBody(meshBody);
			removeItemFromArray(meshBody, this.meshBodiesToRemove);
		}
	}

	killBody(meshBody) {
		meshBody.sleep();
		this.meshBodiesToRemove.push(meshBody);
	}

	createWorld() {
		// Physical floor
		const planeShape = new CANNON.Plane();
		const planeBody = new CANNON.Body({
			mass: 0,
			shape: planeShape,
			material: this.planeMaterial,
		});
		planeBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0); // make it face up
		planeBody.position.set(0, 0, 0);
		this.world.addBody(planeBody)
	}

	update() {
		this.removeDeadMeshBodies()
		const time = performance.now() / 1000; // seconds
		if (!this.lastCallTime) {
			this.world.step(this.timeStep);
		} else {
			const dt = time - this.lastCallTime;
			this.world.step(this.timeStep, dt);
		}
		this.lastCallTime = time;
	}
}