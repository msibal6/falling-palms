
import { vectorsAlmostEqual } from './helper.js';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';
export class Airstream {
	constructor(target) {
		this._target = target;
		this._startPoint = null;
		this._currentPoint = null;
		this._endPoint = null;
		this._delta = 1000;
		this._increment = 0;
		this.stop();
		this._mesh = new THREE.Mesh(
			new THREE.BoxGeometry(1, 1, 12),
			new THREE.MeshLambertMaterial({
				color: 0x0FF0FF,
				side: THREE.DoubleSide,
			}));
		this._mesh.name = "Airstream";
		this._mesh.rotation.x = -Math.PI / 2;
		this._mesh.receiveShadow = false;
		this._mesh.castShadow = false;
		this._mesh.raycast = function (raycaster, intersects) {
			this._mesh.geometry.computeBoundingBox();
			this._mesh.geometry.boundingBox.applyMatrix4(this._mesh.matrix);
			if (raycaster.ray.intersectsBox(this._mesh.geometry.boundingBox)) {
				this.stop();
			}
		}.bind(this);
	}

	setStart(startPoint) {
		this._startPoint = startPoint;
		this._currentPoint = startPoint;
	}

	restart() {
		this._increment = 0;
		this.setStart(this._startPoint);
	}

	setEnd(endPoint) {
		this._endPoint = endPoint;
	}

	setDelta(newDelta) {
		this._delta = newDelta;
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
		let gap = new THREE.Vector3(
			this._endPoint.x - this._startPoint.x,
			this._endPoint.y - this._startPoint.y,
			this._endPoint.z - this._startPoint.z);
		gap.divideScalar(this._delta);
		this._currentPoint = new THREE.Vector3(
			gap.x + this._currentPoint.x,
			gap.y + this._currentPoint.y,
			gap.z + this._currentPoint.z);
	}

	updateSize() {
		let rad = this._increment / (this._delta) * 2 * Math.PI;
		const scale = -0.5 * Math.cos(rad) + 0.5;
		this._mesh.scale.set(scale, scale, scale);
	}

	update() {
		if (this.moving) {
			this._increment = this._increment + 1;
			this.updateOffset();
			this.updateSize();
			if (vectorsAlmostEqual(this._currentPoint, this._endPoint, 0.1)) {
				this.restart();
			}
		}
		this._mesh.position.addVectors(this._target.position, this._currentPoint);
	}
}