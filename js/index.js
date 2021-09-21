import { KeyboardController } from './KeyboardController.js';
import { ThreeManager } from './ThreeManager.js';
import { CannonManager } from './CannonManager.js';
import { removeItemFromArray } from './helper.js';
import { Player } from './Player.js';
import { Enemy } from './Enemy.js';

class Game {
	constructor() {
		this._startEvent = { type: 'start' };
		this._pauseEvent = { type: 'pause' };
		// visual  is managed by _three manager of the game 
		this._threeManager = new ThreeManager();
		// World is managed by cannon manager of the game
		this._cannonManager = new CannonManager();
		// handles intersection between three and cannon
		this._medies = [];
		this._timeouts = [];
		this._animationLoop = null;
		this.loop = function () {
			this._animationLoop = requestAnimationFrame(this.loop);
			// done by cannonManager
			this._cannonManager.update();
			// game updates mesh position from cannon positions
			this.updateMedies();
			if (window.keyboardController.pressed["space"]) {

				this._medies.forEach(function startMedy(medy) {
					// console.log(this);
					medy._mesh.dispatchEvent(window.game._startEvent);
				})
			}
			// Finally, render
			this._threeManager.render();
		}.bind(this);

	}

	start() {
		this.initliazeGame();
		this.loop();
	}

	createUI() {
		const startingUI = window.document.getElementById("ui-start");
		startingUI.innerHTML = "<button class=\"btn success\">Success</button>";

	
	}

	initliazeGame() {
		this._threeManager.createVisualScene();
		this._cannonManager.createPhysicalScene();
		this._player = new Player();
		this._player.create();
		this.addEnemies();
	}

	destroy() {
		window.cancelAnimationFrame(this._animationLoop);
		while (this._medies.length) {
			const medy = this._medies.pop();
			if (medy.cleanup) {
				medy.cleanup();
			}
			this.removeMedy(medy);
		}
		this._medies = [];
	}

	restart() {
		this.destroy();
		this.start();
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
}

// Window variables 
window.game = new Game();
window.addEventListener('resize', window.game._threeManager.handleWindowResize(), false);

// Setting up keyboard events
window.keyboardController = new KeyboardController();
window.keyboardController.init();

window.game.start();
window.game.createUI();