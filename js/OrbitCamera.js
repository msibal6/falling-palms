"use strict";

// Pans across the polar angle
// Flips when panning PI / 2 and 3 PI / 2
export class SphericalPanCamera {
	constructor(threeCamera, target) {
		this.threeCamera = threeCamera;
		this.targetObject = target;
		this.startAngle = Math.PI / 4 * 3;
		this.currentAngle = this.startAngle;
		this.endAngle = Math.PI / 4 * 5;
		this.radius = 5;

		this.startPhi = 0;
		this.startTheta = 0;
		this.currentPhi = this.startPhi;
		this.currentTheta = this.startTheta;
		this.endPhi = Math.PI * 2;
		this.endTheta = 0;
		this.deltaPhi = 0.02;
		this.deltaTheta = 0.01;

		this.delta = 0.01;
	}

	setOrbit(newStart, newEnd, newRadius = 1, newDelta = 0.1) {
		this.startAngle = newStart;
		this.currentAngle = newStart;
		this.endAngle = newEnd;
		this.radius = newRadius;
		this.delta = newDelta;
	}

	isThetaPanFinished() {
		if (this.startTheta < this.endTheta) {
			return this.endTheta - this.currentTheta <= 0;
		}
		return this.endTheta - this.currentTheta >= 0
	}

	isPhiPanFinished() {
		if (this.startPhi < this.endPhi) {
			return this.endPhi - this.currentPhi <= 0;
		}
		return this.endPhi - this.currentPhi >= 0
	}

	isPanFinished() {
		return this.isPhiPanFinished() && this.isThetaPanFinished();
	}

	updateAngle() {
		if (this.startPhi < this.endPhi) {
			this.currentPhi += this.deltaPhi;
		} else {
			this.currentPhi -= this.deltaPhi;
		}

		if (this.startTheta < this.endTheta) {
			this.currentTheta += this.deltaTheta;
		} else {
			this.currentTheta -= this.deltaTheta;
		}

		if (this.isPanFinished()) {
			this.currentPhi = this.endPhi;
			this.currentTheta = this.endTheta;
		}
	}

	updatePosition() {
		// x r cos azimuth sin polar
		// y r sin azimuth sin polar
		// z r cos polar
		const x = this.radius * Math.cos(this.currentPhi)
			* Math.sin(this.currentTheta) + this.targetObject.position.x;
		const y = this.radius * Math.sin(this.currentPhi)
			* Math.sin(this.currentTheta) + this.targetObject.position.y;
		const z = this.radius * Math.cos(this.currentTheta)
			+ this.targetObject.position.z;

		this.threeCamera.position.set(x, y, z);
	}

	update() {
		if (this.isPanFinished()) {
			return;
		}
		// update angle
		this.updateAngle();
		// update position
		this.updatePosition();
		// update rotation
		this.threeCamera.lookAt(this.targetObject.position);
	}
}