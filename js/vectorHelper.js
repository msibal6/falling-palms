"use strict";
export function getNormalizedVector(vector) {
	const magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y
		+ vector.z * vector.z);
	return new THREE.Vector3(vector.x / magnitude, vector.y / magnitude,
		vector.z / magnitude)
}