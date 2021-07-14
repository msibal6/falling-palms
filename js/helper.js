"use strict";
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