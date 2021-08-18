
import { vectorsAlmostEqual } from './helper.js';

export class Airstream {
	constructor(target, name) {
		// target tracks a THREE mesh 
		this.target = target;
		this.startPoint = null;
		this.currentPoint = null;
		this.endPoint = null;
		this.delta = 1000;
		this.increment = 0;
		this.moving = false;
		this.mesh = new THREE.Mesh(
			new THREE.BoxGeometry(1, 1, 12),
			new THREE.MeshLambertMaterial({
				color: 0x0FF0FF,
				side: THREE.DoubleSide,
			}));
		if (name !== undefined) {
			this.mesh.name = name;
		} else {
			this.mesh.name = "Airstream";
		}
		this.mesh.receiveShadow = false;
		this.mesh.castShadow = false;
		this.mesh.rotation.x = -Math.PI / 2;


		this.mesh.raycast = function (raycaster, intersects) {
			this.mesh.geometry.computeBoundingBox();
			this.mesh.geometry.boundingBox.applyMatrix4(this.mesh.matrix);
			if (raycaster.ray.intersectsBox(this.mesh.geometry.boundingBox)) {
				this.stop();
			}
		}.bind(this);
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

	isStopped() {
		return !this.moving;
	}

	updateOffset() {
		let gap = new THREE.Vector3(this.endPoint.x - this.startPoint.x,
			this.endPoint.y - this.startPoint.y,
			this.endPoint.z - this.startPoint.z);
		gap.divideScalar(this.delta);
		this.currentPoint = new THREE.Vector3(gap.x + this.currentPoint.x,
			gap.y + this.currentPoint.y,
			gap.z + this.currentPoint.z);
	}

	updateSize() {
		let rad = this.increment / (this.delta) * 2 * Math.PI;
		const scale = -0.5 * Math.cos(rad) + 0.5;
		this.mesh.scale.set(scale, scale, scale);
		// if (scale == 1) {
		// 	this.stop();
		// }
	}

	update() {
		if (this.moving) {
			this.increment = this.increment + 1;
			this.updateOffset();
			this.updateSize();
			if (vectorsAlmostEqual(this.currentPoint, this.endPoint, 0.1)) {
				this.restart();
			}
		}
		this.mesh.position.addVectors(this.target.position, this.currentPoint);
	}
}