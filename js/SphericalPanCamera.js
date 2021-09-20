"use strict";
// Pans across the polar angle
// Flips when panning PI / 2 and 3 PI / 2
export class SphericalPanCamera {
	constructor(threeCamera, target) {
		this.threeCamera = threeCamera;
		// THREE Mesh
		this.targetObject = target;
		this.radius = 5;
		this.startPhi = 0;
		this.startTheta = 0;
		this.currentPhi = this.startPhi;
		this.currentTheta = this.startTheta;
		this.endPhi = Math.PI * 2;
		this.endTheta = Math.PI / 2;
		this.deltaPhi = 0.02;
		this.deltaTheta = 0.01;
		this.stopPan();
	}

	startPan() {
		this.isPanning = true;
	}

	stopPan() {
		this.isPanning = false;
	}

	setThetaPan(newStartTheta, newEndTheta, newDeltaTheta = 0.01) {
		this.startTheta = newStartTheta;
		this.currentTheta = this.startTheta;
		this.endTheta = newEndTheta;
		this.deltaTheta = newDeltaTheta;
	}

	setThetaDelta(newThetaDelta) {
		this.deltaTheta = newThetaDelta;
	}

	setPhiPan(newStartPhi, newEndPhi, newDeltaPhi = 0.02) {
		this.startPhi = newStartPhi;
		this.currentPhi = this.startPhi;
		this.endPhi = newEndPhi;
		this.deltaPhi = newDeltaPhi;
	}

	setRadius(newRadius) {
		this.radius = newRadius;
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

	updateAngles() {
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

		if (this.isPhiPanFinished()) {
			this.currentPhi = this.endPhi;
		}

		if (this.isThetaPanFinished()) {
			this.currentTheta = this.endTheta;
		}
	}

	updatePosition() {
		// X and Z are azimuthal 
		// Y is polar in this case
		const x = this.radius * Math.cos(this.currentPhi)
			* Math.sin(this.currentTheta) + this.targetObject.position.x;
		const z = this.radius * Math.sin(this.currentPhi)
			* Math.sin(this.currentTheta) + this.targetObject.position.z;
		const y = this.radius * Math.cos(this.currentTheta)
			+ this.targetObject.position.y;
		this.threeCamera.position.set(x, y, z);
	}

	update() {
		// Update angle
		if (!this.isPanFinished() && this.isPanning) {
			this.updateAngles();
		}
		// Update position
		this.updatePosition();
		// Update rotation
		this.threeCamera.lookAt(this.targetObject.position);
	}
}