// Scene
const scene = new THREE.Scene();
// Camera
const camera = new THREE.PerspectiveCamera(75,
	window.innerWidth / window.innerHeight, 0.1, 1000);


// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Placing a cube in the scene
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);

// scene.add automatically places the cube at (0, 0, 0)
scene.add(cube);

// X towards preferences bar
// Y towards widget bar
// Z towards user
// Changing camera position
camera.position.z = 5;

// Rendering loop
function animate() {
	// renders everytime the screen refreshes only when 
	// we are the current browser tab
	requestAnimationFrame(animate);
	renderer.render(scene, camera);
}
animate();