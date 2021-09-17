import * as CANNON from './cannon-es.js';
import { removeItemFromArray } from './helper.js';
export class CannonManager {
	constructor() {
		this._timeStep = 1 / 60;
		this._needleFilterGroup = 2;
		this._palmFilterGroup = 3;
		this._groundFilterGroup = 4;

		this._world = null;
	}

	addPhysical(meshBody) {
		// this._physicals.push(meshBody);
		this._world.addBody(meshBody);
	}

	removePhysical(body) {
		// removeItemFromArray(meshBody, this._physicals);
		this.killBody(body);
	}

	killBody(body) {
		body.sleep();
		this._bodiesToRemove.push(body);
	}

	removeDeadBodies() {
		for (let i = 0; i < this._bodiesToRemove.length; i++) {
			this._world.removeBody(this._bodiesToRemove[i]);
		}
		this._bodiesToRemove = [];
	}

	createPhysicalScene() {
		this._lastCallTime = null;
		this._bodies = [];
		this._bodiesToRemove = [];
		this._world = new CANNON.World({
			gravity: new CANNON.Vec3(0, -10, 0), // m/s²
		});

		// Program contact between floor material and itself
		this.planeMaterial = new CANNON.Material({ friction: 0, });
		this.contactMaterial = new CANNON.ContactMaterial(this.planeMaterial, this.planeMaterial,
			{ friction: 0, restitution: 0.0, });
		this._world.addContactMaterial(this.contactMaterial);
		// Palm Material
		this.palmMaterial = new CANNON.Material({ friction: 5, });
		this.palmContact = new CANNON.ContactMaterial(this.palmMaterial, this.planeMaterial,
			{ friction: 0, restitution: 0.0 });
		this._world.addContactMaterial(this.palmContact);

		// Floor
		const planeShape = new CANNON.Plane();
		const planeBody = new CANNON.Body({
			mass: 0,
			shape: planeShape,
			material: this.planeMaterial,
			collisionFilterGroup: this._groundFilterGroup
		});
		// make it face up
		planeBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
		planeBody.position.set(0, 0, 0);
		this._world.addBody(planeBody)
	}

	update() {
		this.removeDeadBodies()
		const time = performance.now() / 1000; // seconds
		if (!this._lastCallTime) {
			this._world.step(this._timeStep);
		} else {
			const dt = time - this._lastCallTime;
			this._world.step(this._timeStep, dt);
		}
		this._lastCallTime = time;
	}
}