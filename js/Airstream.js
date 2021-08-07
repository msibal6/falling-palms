
import { almostZero, vectorsAlmostEqual } from './helper.js';

export class AirStream {
	constructor(target) {
		// target tracks a THREE mesh 
		this.target = target;
		console.log(target);
		// start point
		this.startPoint = null;
		this.currentPoint = null;
		// end point
		this.endPoint = null;
		this.delta = 1000;

		this.moving = false;
		this.mesh = new THREE.Mesh(
			new THREE.BoxGeometry(0.5, 0.5, 4),
			new THREE.MeshLambertMaterial({
				color: 0x0FF0FF,
			}));
		this.mesh.receiveShadow = false;
		this.mesh.castShadow = false;
		this.mesh.rotation.x = -Math.PI / 2;
	}

	setStart(startPoint) {
		this.startPoint = startPoint;
		this.currentPoint = startPoint;
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
		let gap = this.endPoint.sub(this.startPoint);
		console.log(gap);
		gap = new THREE.Vector3(gap.x / this.delta, gap.y / this.delta, gap.z / this.delta);
		// console.log(gap);
		// this.currentPoint.addVectors(this.currentPoint, gap);
		this.currentPoint = new THREE.Vector3(gap.x + this.currentPoint.x, gap.y + this.currentPoint.y, gap.z + this.currentPoint.z);

		// this.currentPoint.addVectors(this.currentPoint.x + gap.x, this.currentPoint.y + gap.y, this.currentPoint.z + gap.z);
		console.log("start point " + this.startPoint.x + this.startPoint.y + this.startPoint.z);
		console.log(this.currentPoint);
	}

	update() {
		if (this.moving) {
			this.updateOffset();
			if (vectorsAlmostEqual(this.currentPoint, this.endPoint, 0.5)) {
				this.stop();
			}
		}

		const newPosition = new THREE.Vector3(this.target.position.x + this.currentPoint.x, this.target.position.y + this.currentPoint.y, this.target.position.z + this.currentPoint.z);

		this.mesh.position.copy(newPosition);
		// this.mesh.position.set(this.target.position.x + this.currentPoint.x, this.target.position.y + this.currentPoint.y, this.target.position.z + this.currentPoint.z);
	}
}