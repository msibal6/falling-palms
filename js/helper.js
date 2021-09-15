"use strict";
import * as CANNON from './cannon-es.js';

export function getNormalizedVector(vector) {
	const magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y
		+ vector.z * vector.z);
	return new THREE.Vector3(vector.x / magnitude, vector.y / magnitude,
		vector.z / magnitude)
}

export function almostZero(value, precision) {
	if (precision === undefined) {
		precision = 1e-6;
	}
	if (Math.abs(value) > precision) {
		return false;
	}
	return true;
}

export function vectorsAlmostEqual(threeVector1, threeVector2, precision) {
	if (precision === undefined) {
		precision = 1e-6;
	}
	if (almostZero(threeVector1.x - threeVector2.x, precision)
		&& almostZero(threeVector1.y - threeVector2.y, precision)
		&& almostZero(threeVector1.z - threeVector2.z, precision)) {
		return true;
	}
	return false;
}

export function getRandomInt(max, opts) {
	if (opts !== undefined && opts.min !== undefined) {
		return Math.floor(Math.random() * (max - opts.min)) + opts.min;
	}
	return Math.floor(Math.random() * max);
}

export function removeItemFromArray(item, array) {
	const index = array.indexOf(item);
	if (index === -1) {
		return;
	}
	if (index === array.length - 1) {
		array.pop();
	} else {
		array.splice(index, index + 1);
	}
}

export function cannon2ThreeVector3(cannonVec3) {
	return new THREE.Vector3(cannonVec3.x, cannonVec3.y, cannonVec3.z);
}
export function three2CannonVec3(threeVector3) {
	return new CANNON.Vec3(threeVector3.x, threeVector3.y, threeVector3.z);
}