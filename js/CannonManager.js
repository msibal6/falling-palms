import * as CANNON from './cannon-es.js';
export class CannonManager {
	constructor() {
		this.timeStep = 1 / 60;
		this.world = new CANNON.World({
			gravity: new CANNON.Vec3(0, -10, 0), // m/s²
		});

		// Program contact between floor material and itself
		const planeMaterial = new CANNON.Material({ friction: 0, });
		const contactMaterial = new CANNON.ContactMaterial(planeMaterial, planeMaterial,
			{ friction: 0, restitution: 0.1, });
		this.world.addContactMaterial(contactMaterial);
	}
}