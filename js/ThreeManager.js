// classes in js are jusy syntax obstructions

export class ThreeManager {
	constructor() {
		this.camera = null;
		this.scene = new THREE.Scene();
		this.renderer = null;
	}

	createScene() {
		const newScene = new THREE.Scene();
		return newScene;
	}

	addMesh(mesh) {
		this.scene.add(mesh);
	}

	render() {
		this.renderer.render(this.scene, this.camera);
	}
}