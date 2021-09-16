import { removeItemFromArray } from "./helper.js";

// classes in js are jusy syntax obstructions
export class ThreeManager {
	constructor() {
		this._visuals = [];
		const threeCamera = new THREE.PerspectiveCamera(75,
			window.innerWidth / window.innerHeight, 0.1, 1000);
		this.camera = threeCamera;
		this.scene = new THREE.Scene();
		this.renderer = new THREE.WebGLRenderer();
		this.initRenderer();
	}

	initRenderer() {
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		const threeContainers = document.getElementsByClassName("js-three-container");
		this.renderer.domElement.className = "three-js-canvas";
		threeContainers[0].appendChild(this.renderer.domElement);
	}

	addVisual(meshBody) {
		// this._visuals.push(meshBody);
		this.addToScene(meshBody);
	}

	removeVisual(meshBody) {
		// removeItemFromArray(meshBody, this._visuals);
		this.scene.remove(meshBody);
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
		plane.name = "ground";
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
		this.renderer.render(this.scene, this.camera);
	}


	handleWindowResize() {
		return function () {
			const windowHeight = window.innerHeight;
			const windowWidth = window.innerWidth;
			this.renderer.setSize(windowWidth, windowHeight);
			this.camera.aspect = windowWidth / windowHeight;
			this.camera.updateProjectionMatrix();
		}.bind(this);
	}
}