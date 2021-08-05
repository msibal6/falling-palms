// classes in js are jusy syntax obstructions

export class ThreeManager {
	constructor() {
		this.camera = null;
		this.scene = new THREE.Scene();
		this.renderer = new THREE.WebGLRenderer();
		this.initRenderer();
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
}