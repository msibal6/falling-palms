"use strict";

// Pans across the polar angle
// Flips when panning PI / 2 and 3 PI / 2
export class OrbitZCamera {
	constructor(threeCamera, target) {
		this.threeCamera = threeCamera;
		this.targetObject = target;
		this.startAngle = Math.PI / 4 * 3;
		this.currentAngle = this.startAngle;
		this.endAngle = Math.PI / 4 * 5;
		this.radius = 5;
		this.delta = 0.01;
	}

	setOrbit(newStart, newEnd, newRadius = 1, newDelta = 0.1) {
		this.startAngle = newStart;
		this.endAngle = newEnd;
		this.radius = newRadius;
		this.delta = newDelta;
	}

	isOrbitFinished() {
		return this.endAngle - this.currentAngle <= 0;
	}

	updatePosition() {
		const x = this.radius * Math.cos(this.currentAngle)
			+ this.targetObject.position.x;
		const y = this.radius * Math.sin(this.currentAngle)
			+ this.targetObject.position.y;
		const z = this.targetObject.position.z;

		this.threeCamera.position.set(x, y, z);
	}

	update() {
		if (this.isOrbitFinished()) {
			return;
		}
		// update angle
		this.currentAngle += this.delta;
		if (this.isOrbitFinished()) {
			this.currentAngle = this.endAngle;
		}
		// update position
		this.updatePosition();
		// update rotation
		this.threeCamera.lookAt(this.targetObject.position);
	}
}