import { ConvexPolyhedron } from "./cannon-es";

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
		console.log(this.startPoint);
		console.log(this.endPoint);

		let gap = this.endPoint.sub(this.startPoint);
		gap.divideScalar(this.delta);
		this.currentPoint.addVectors(this.currentPoint, gap);

		console.log(gap);
		console.log(this.currentPoint);
	}

	update() {
		if (this.moving) {
			this.updateOffset();
		}
		// Add current point to target position 
		// and set the mesh position to that
		// copy(target.position.add(this.currentPoint))
	}
}
