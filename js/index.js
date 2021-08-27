import { KeyboardController } from './events.js';
import { ThreeManager } from './ThreeManager.js';
import { CannonManager } from './CannonManager.js';
import { Player } from './Player.js';
import { Medy } from './Medy.js';
import * as CANNON from './cannon-es.js';
import { removeItemFromArray } from './helper.js';

class Game {
	constructor() {
		// visual  is managed by _three manager of the game 
		this._threeManager = new ThreeManager();
		// World is managed by cannon manager of the game
		this._cannonManager = new CannonManager();
		// TODO Add array for mesh bodies so it is clear game is handling intersection
		this._medies = [];
		// between the two

		this.onMouseClickHandler = this.onMouseClick.bind(this);

		this._player = new Player();

		this._animationLoop = null;

		this.loop = function () {
			this._animationLoop = requestAnimationFrame(this.loop);
			// game updates mesh position from cannon positions
			this.updateMedies();
			this.updateMeshBodies();
			// done by cannonManager
			this._cannonManager.update();
			// Player update
			this._player.update();
			// Finally, render
			this._threeManager.render();
		}.bind(this);
	}

	start() {
		this._threeManager.createScene();
		this._cannonManager.createWorld();
		// this.testMedy();
		this._player.create();
		window.addEventListener('mousedown', this.onMouseClickHandler, false);
		this.loop();
	}
	testMedy() {
		// Add visual player placeholder
		const tempPlayerMesh = new THREE.Mesh(
			new THREE.BoxGeometry(2, 2, 2),
			new THREE.MeshLambertMaterial({
				color: 0xFFFFFF,
			}));
		tempPlayerMesh.castShadow = true;
		tempPlayerMesh.receiveShadow = true;
		// // Physical player placeholder
		const size = 1;
		const halfExtents = new CANNON.Vec3(size, size, size);
		const boxShape = new CANNON.Box(halfExtents);
		const tempPlayerBody = new CANNON.Body({
			mass: 1,
			shape: boxShape,
			material: game._cannonManager.planeMaterial
		});
		const newMedy = new Medy(tempPlayerMesh, tempPlayerBody);
		newMedy._body.position.set(0, 100, 0);
		this.addMedy(newMedy);
	}

	addMedy(medy) {
		this._medies.push(medy);
		this._threeManager.addVisual(medy._mesh);
		this._cannonManager.addPhysical(medy._body);
	}

	removeMedy(medy) {
		removeItemFromArray(medy, this._medies);
		this._threeManager.removeVisual(medy._mesh);
		this._cannonManager.removePhysical(medy._body);
	}

	addMeshBody(mesh, body) {
		this._threeManager.addVisual(mesh);
		this._cannonManager.addPhysical(body);
	}

	removeMeshBody(mesh, body) {
		this._threeManager.removeVisual(mesh);
		this._cannonManager.removePhysical(body);
	}

	updateMedies() {
		for (let i = 0; i < this._medies.length; i++) {
			this._medies[i]._mesh.position.copy(this._medies[i]._body.position);
		}
	}

	updateMeshBodies() {
		const visuals = this._threeManager._visuals;
		const physicals = this._cannonManager._physicals;
		if (physicals.length == 0) {
			return;
		}
		for (let i = 0; i < physicals.length; i++) {
			visuals[i].position.copy(physicals[i].position);
		}
	}

	onMouseClick(event) {

		// calculate mouse position in normalized device coordinates
		// (-1 to +1) for both components
		const raycaster = new THREE.Raycaster();
		const mouse = new THREE.Vector2();
		mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
		raycaster.setFromCamera(mouse, this._player.camera.threeCamera);

		// calculate objects intersecting the picking ray
		const intersects = raycaster.intersectObjects(this._threeManager.scene.children);
		if (intersects.length) {
			this._player.shootPalm(intersects[0].point);
		}
	}
}

// Window variables 
window.game = new Game();
// console.log(window.game.threeManager.);
window.addEventListener('resize', window.game._threeManager.handleWindowResize(), false);

// Setting up keyboard events
window.keyboardController = new KeyboardController();
window.keyboardController.init();

window.game.start();