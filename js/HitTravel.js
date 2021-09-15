import * as CANNON from './cannon-es.js';
import { Medy } from './Medy.js';

export class HitTravel extends Medy {
	constructor() {
		super(mesh, body);
		this.updatedWithMass = false;
	}

	// accepts either a vector3 or three floats
	setDirection(direction, y, z) {
		const testPoint = new THREE.Vector3();
		if (direction.x === undefined) {
			this._direction = new THREE.Vector3(direction, y, z);
			this._body.velocity.set(direction, y, z);
			testPoint.addVectors(this._mesh.position, new THREE.Vector3(direction, y, z));
		} else {
			this._direction = direction.clone();
			this._body.velocity.set(direction.x, direction.y, direction.z);
			testPoint.addVectors(this._mesh.position, direction);
		}
		this._mesh.lookAt(testPoint);
		this._body.quaternion.copy(this._mesh.quaternion);
	}

	setSpeed(speed) {
		this._speed = speed;
		this._body.velocity.scale(speed, this._body.velocity);
	}

	maintainTrajectory() {
		this._body.velocity.set(
			this._direction.x,
			this._direction.y,
			this._direction.z
		);
		this._body.velocity.scale(this._speed, this._body.velocity);
	}

	update() {
		super.update();
		this.maintainTrajectory();
		if (!this.updatedWithMass) {
			this.updatedWithMass = true;
			this._body.mass = 0;
		}
	}
}