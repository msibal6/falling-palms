export function Player() {
	// visual THREE mesh
	this.mesh = null;
	// physics CANNON body
	this.body = null;
	this.maxSpeed = 80.0;
	this.acceleration = 4.0;
	this.xcceleration = 0.0;
	this.zcceleration = 0.0;
	this.camera = null;
}

Player.prototype.test = function () {
	console.log("test");
}

Player.prototype.create = function () {
	const tempPlayerMesh = new THREE.Mesh(
		new THREE.BoxGeometry(2, 2, 2),
		new THREE.MeshLambertMaterial({
			color: 0xFFFFFF,
		}));
	tempPlayerMesh.castShadow = true;
	tempPlayerMesh.receiveShadow = true;
	this.mesh = tempPlayerMesh;
	// // Physical player placeholder
	const size = 1;
	const halfExtents = new CANNON.Vec3(size, size, size);
	const boxShape = new CANNON.Box(halfExtents);
	const tempPlayerBody = new CANNON.Body({
		mass: 1,
		shape: boxShape,
		material: game.cannonManager.planeMaterial
	});
	tempPlayerBody.position.set(0, 100, 0);
	this.body = tempPlayerBody;
	this.body.addEventListener('collide', function (e) {
		console.log(e)
	})
	window.game.addMeshBody(this.mesh, this.body);

	// Camera
	const threeCamera = new THREE.PerspectiveCamera(75,
		window.innerWidth / window.innerHeight, 0.1, 1000);
	const orbitCamera = new SphericalPanCamera(threeCamera, this.mesh);
	orbitCamera.setPhiPan(Math.PI, Math.PI);
	orbitCamera.setThetaPan(Math.PI / 4 * 3, Math.PI / 4);
	orbitCamera.setRadius(20);
	this.camera = orbitCamera;
	window.game.threeManager.camera = threeCamera;

	// Add AirStreams
	this.airstreams = [];
	this.addAirstream(new THREE.Vector3(5, 0, 10),
		new THREE.Vector3(5, 10, 10));
	this.addAirstream(new THREE.Vector3(5, 0, -10),
		new THREE.Vector3(5, 10, -10));
}