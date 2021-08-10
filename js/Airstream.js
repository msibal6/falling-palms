
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
		this.increment = 0;

		this.moving = false;
		this.mesh = new THREE.Mesh(
			new THREE.BoxGeometry(0.5, 0.5, 4),
			new THREE.MeshLambertMaterial({
				color: 0x0FF0FF,
			}));
		this.mesh.name = "testAirstream";
		this.mesh.receiveShadow = false;
		this.mesh.castShadow = false;
		this.mesh.rotation.x = -Math.PI / 2;
	}

	setStart(startPoint) {
		this.startPoint = startPoint;
		this.currentPoint = startPoint;
	}

	restart() {
		this.increment = 0;
		this.setStart(this.startPoint);
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
		let gap = new THREE.Vector3(this.endPoint.x - this.startPoint.x, this.endPoint.y - this.startPoint.y, this.endPoint.z - this.startPoint.z);
		// gap = new THREE.Vector3(gap.x / this.delta, gap.y / this.delta, gap.z / this.delta);
		gap.divideScalar(this.delta);
		this.currentPoint = new THREE.Vector3(gap.x + this.currentPoint.x, gap.y + this.currentPoint.y, gap.z + this.currentPoint.z);
	}

	updateSize() {
		let scale = this.increment / (this.delta / 2);
		if (scale > 1) {
			scale = 2 - scale;
		}
		// console.log(scale);
		this.mesh.scale.set(scale, scale, scale);

	}

	update() {
		if (this.moving) {
			this.increment = this.increment + 1;
			this.updateOffset();
			this.updateSize();
			if (vectorsAlmostEqual(this.currentPoint, this.endPoint, 0.1)) {
				// this.stop();
				this.restart();

			}
		}
		const newPosition = new THREE.Vector3(this.target.position.x + this.currentPoint.x, this.target.position.y + this.currentPoint.y, this.target.position.z + this.currentPoint.z);
		this.mesh.position.copy(newPosition);
	}
}