import * as CANNON from './cannon-es.js';
export class CannonManager {
	constructor() {
		this.timeStep = 1 / 60;
		this.lastCallTime = null;

		this.world = new CANNON.World({
			gravity: new CANNON.Vec3(0, -10, 0), // m/s²
		});

		// Program contact between floor material and itself
		this.planeMaterial = new CANNON.Material({ friction: 0, });
		this.contactMaterial = new CANNON.ContactMaterial(this.planeMaterial, this.planeMaterial,
			{ friction: 0, restitution: 0.1, });
		this.world.addContactMaterial(this.contactMaterial);
	}

	update() {
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