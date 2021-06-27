"use strict";



export function animate() {
	console.log(1);
	requestAnimationFrame(animate);
	renderer.render(scene, camera);
}