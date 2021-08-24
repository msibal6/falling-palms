import { almostZero } from './helper.js';
import { SphericalPanCamera } from './SphericalPanCamera.js';
import * as CANNON from './cannon-es.js';
import { KeyboardController } from './events.js';
import { ThreeManager } from './ThreeManager.js';
import { CannonManager } from './CannonManager.js';
import { Airstream } from './Airstream.js';
import { Palm } from './Palm.js';
import { player } from './player.js';

class Game {
	constructor() {
		// visual  is managed by _three manager of the game 
		this.threeManager = new ThreeManager();
		// World is managed by cannon manager of the game
		this.cannonManager = new CannonManager();

		this.onMouseClickHandler = this.onMouseClick.bind(this);

		this.player = player;

		this.animationLoop = null;

		this.loop = function () {
			this.animationLoop = requestAnimationFrame(this.loop);
			// game updates mesh position from cannon positions
			this.updateMeshBodies();
			// done by cannonManager
			this.cannonManager.update();
			// Player update
			//  console.log(this.player)
			this.player.update();
			// this.testPlayer.update();
			// Finally, render
			this.threeManager.render();
			// console.log(this);
		}.bind(this);
	}

	start() {
		this.threeManager.createScene();
		this.cannonManager.createWorld();
		this.player.create();
		window.addEventListener('mousedown', this.onMouseClickHandler, false);
		this.loop();
	}

	addMeshBody(mesh, body) {
		this.threeManager.addMeshBody(mesh);
		this.cannonManager.addMeshBody(body);
	}

	removeMeshBody(mesh, body) {
		this.threeManager.removeBodyMesh(mesh);
		this.cannonManager.removeMeshBody(body);
	}


	updateMeshBodies() {
		const meshes = this.threeManager.meshBodies;
		const bodies = this.cannonManager.meshBodies;
		for (let i = 0; i < bodies.length; i++) {
			meshes[i].position.copy(bodies[i].position);
		}
	}

	onMouseClick(event) {
		// calculate mouse position in normalized device coordinates
		// (-1 to +1) for both components
		const raycaster = new THREE.Raycaster();
		const mouse = new THREE.Vector2();
		mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
		raycaster.setFromCamera(mouse, this.player.camera.threeCamera);
		// calculate objects intersecting the picking ray
		const intersects = raycaster.intersectObjects(this.threeManager.scene.children);
		if (intersects.length) {
			this.player.shootPalm(intersects[0].point);
		}
	}
}

// Window variables 
window.game = new Game();
window.addEventListener('resize', game.threeManager.handleWindowResize(), false);

// Setting up keyboard events
window.keyboardController = new KeyboardController();
window.keyboardController.init();

// window.game.testPlayer.test();
window.game.start();