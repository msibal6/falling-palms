export class AirStream {
	constructor(target) {
		// target object
		// tracks a THREE mesh with some position value
		this.target = target;
		// start point
		this.startPoint = null;
		this.currentPoint = null;
		// end point
		this.endPoint = null;
		this.delta = 100;
		this.moving = false;
	}

	setStart(startPoint) {
		this.startPoint = startPoint;
		this.currentPoint = this.startPoint;
	}

	setEnd(endPoint) {
		this.endPoint = endPoint;
	}

	setDelta(newDelta) {
		this.delta = newDelta;
	}

	start() {
		this.moving = true;
	}

	stop() {
		this.moving = false;
	}

	updateOffset() {

	}
	update() {
		if (this.moving) {
			this.updateOffset();
		}
		// Add current point to target position 
		// and set the mesh position to that
	}
}
