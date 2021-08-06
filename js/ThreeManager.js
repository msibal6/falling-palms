// classes in js are jusy syntax obstructions

export class ThreeManager {
	constructor() {
		this.camera = null;
		this.scene = new THREE.Scene();
		this.renderer = new THREE.WebGLRenderer();
		this.initRenderer();
		console.log(this.renderer);
	}

	initRenderer() {
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		document.body.appendChild(this.renderer.domElement);
	}

	createScene() {
		const newScene = new THREE.Scene();
		return newScene;
	}

	addToScene(object) {
		this.scene.add(object);
	}

	render() {
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