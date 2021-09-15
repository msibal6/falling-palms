import { KeyboardController } from './events.js';
import { ThreeManager } from './ThreeManager.js';
import { CannonManager } from './CannonManager.js';
import { removeItemFromArray } from './helper.js';
import { Player } from './Player.js';
import { Enemy } from './Enemy.js';

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

		this._animationLoop = null;

		this.loop = function () {
			this._animationLoop = requestAnimationFrame(this.loop);
			// done by cannonManager
			this._cannonManager.update();
			// game updates mesh position from cannon positions
			this.updateMedies();
			// Finally, render
			this._threeManager.render();
		}.bind(this);
	}

	start() {
		this._threeManager.createScene();
		this._cannonManager.createWorld();
		this._player = new Player();
		this._player.create();
		this.addEnemies();
		window.addEventListener('mousedown', this.onMouseClickHandler, false);
		this.loop();
	}

	addEnemies() {
		this.addEnemy(10, 1, 10);
		// this.addEnemy(10, 1, -10);
	}

	addEnemy(x, y, z) {
		const newEnemy = new Enemy(this._player);
		this.addMedy(newEnemy);
		newEnemy._body.position.set(x, y, z);
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

	updateMedies() {
		this._medies.forEach((element) => {
			element.update();
		});
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