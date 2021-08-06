// classes in js are jusy syntax obstructions

export class ThreeManager {
	constructor() {
		this.camera = null;
		this.scene = new THREE.Scene();
		this.renderer = new THREE.WebGLRenderer();
		this.initRenderer();
		this.raycaster = new THREE.Raycaster();
		this.mouse = new THREE.Vector2();
		window.addEventListener('mousemove', this.onMouseMove(), false);
		window.addEventListener('mousedown',
			function (event) { console.log(event) }, false);
	}

	onMouseMove() {
		return function (event) {

			// calculate mouse position in normalized device coordinates
			// (-1 to +1) for both components

			console.log(event);
			this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
			this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
		}.bind(this);
	}

	initRenderer() {
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		document.body.appendChild(this.renderer.domElement);
	}

	createScene() {
		this.createSkybox();
		this.createFloor();
		this.createLighting();
	}

	createLighting() {
		const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.5);
		this.addToScene(ambientLight);

		const sun = new THREE.DirectionalLight(0xFFFFFF0, 0.5);
		sun.position.set(20, 1000, 10);
		sun.target.position.set(0, 0, 0);
		sun.castShadow = true;
		sun.shadow.bias = -0.001;
		sun.shadow.mapSize.width = 2048;
		sun.shadow.mapSize.height = 2048;
		sun.shadow.camera.near = 0.1;
		sun.shadow.camera.far = 500.0;
		sun.shadow.camera.near = 0.5;
		sun.shadow.camera.far = 500.0;
		sun.shadow.camera.left = 100;
		sun.shadow.camera.right = -100;
		sun.shadow.camera.top = 100;
		sun.shadow.camera.bottom = -100;
		this.addToScene(sun);
	}

	createFloor() {
		const plane = new THREE.Mesh(
			new THREE.PlaneGeometry(10, 100),
			new THREE.MeshLambertMaterial({
				color: 0xF0FF00,
			}));
		plane.castShadow = false;
		plane.receiveShadow = true;
		plane.rotation.x = -Math.PI / 2;
		this.addToScene(plane);
	}

	createSkybox() {
		const loader = new THREE.CubeTextureLoader();
		const texture = loader.load([
			'../images/red_background.png',
			'../images/red_background.png',
			'../images/red_background.png',
			'../images/red_background.png',
			'../images/red_background.png',
			'../images/red_background.png',
		]);
		this.scene.background = texture;
	}

	addToScene(object) {
		this.scene.add(object);
	}

	render() {
		// update the picking ray with the camera and mouse position
		this.raycaster.setFromCamera(this.mouse, this.camera);

		// calculate objects intersecting the picking ray
		const intersects = this.raycaster.intersectObjects(this.scene.children);

		for (let i = 0; i < intersects.length; i++) {

			// intersects[i].object.material.color.set(0xff0000);
			// console.log(intersects[i].object);

		}
		this.renderer.render(this.scene, this.camera);
	}

	handleWindowResize() {
		return function () {
			console.log("Resizing");
			// update height and width of the renderer and the camera
			console.log(this);
			const windowHeight = window.innerHeight;
			const windowWidth = window.innerWidth;
			this.renderer.setSize(windowWidth, windowHeight);
			this.camera.aspect = windowWidth / windowHeight;
			this.camera.updateProjectionMatrix();
		}.bind(this);
	}
}