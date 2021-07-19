export class ThreeManager {
	constructor() {
		this.camera = null;
		this.scene = null;
		this.renderer = null
		this._three = THREE;
	}

	createScene() {
		const newScene = new this._three.Scene();
		return newScene;
	}
}