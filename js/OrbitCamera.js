// "use strict";

export class OrbitZCamera {
	constructor(threeCamera, target) {
		this.threeCamera = threeCamera;
		this.target = target;
		this.startAngle = 0;
		this.currentAngle = 0;
		this.endAngle = 2 * Math.PI;
		this.radius = 1;
		this.delta = 0.1;
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
	update() {
		if (this.isOrbitFinished()) {
			this.currentAngle = this.endAngle;
			this.threeCamera.lookAt(this.target);
			return;
		}
		



	}
}