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
		this._lossEvent = { type: 'gameover', outcome: 0 };
		this._winEvent = { type: 'gameover', outcome: 1 };
		// visual  is managed by _three manager of the game 
		this._threeManager = new ThreeManager();
		// World is managed by cannon manager of the game
		this._cannonManager = new CannonManager();
		// handles intersection between three and cannon
		this._medies = [];
		this._enemies = [];
		this._animationLoop = null;
		this.loop = function () {
			this._animationLoop = requestAnimationFrame(this.loop);
			// done by cannonManager
			this._cannonManager.update();
			// game updates mesh position from cannon positions
			this.updateMedies();
			const delta = window.game._threeManager._clock.getDelta();
			for (let i = 0; i < window.game._threeManager._mixers.length; i++) {
				window.game._threeManager._mixers[i].update(delta);
			}
			// Finally, render
			this._threeManager.render();
		}.bind(this);
	}

	start() {
		this.initliazeGame();
		this.loop();
	}

	makeActive(uiID) {
		const uiSections = window.document.getElementsByClassName("ui");
		for (let i = 0; i < uiSections.length; i++) {
			uiSections[i].classList.add("inactive");
			uiSections[i].classList.remove("active");
		}
		const uiSection = window.document.getElementById(uiID);
		uiSection.classList.remove("inactive");
		uiSection.classList.add("active");
	}

	createUI() {
		this.createStartUI();
	}

	createStartUI() {
		const startButton = window.document.getElementById("start-button");
		this.makeActive("ui-start");
		startButton.addEventListener('click', function (event) {
			window.game._medies.forEach(function startMedy(medy) {
				medy._mesh.dispatchEvent(window.game._startEvent);
			});
			const startButton = window.document.getElementById("ui-start");
			startButton.classList.add("inactive");
			startButton.classList.remove("active");
		});
	}

	initliazeGame() {
		this._threeManager.createVisualScene();
		this._cannonManager.createPhysicalScene();
		this._player = new Player();
		this._player.create();
		this.addMedy(this._player);
		this._player.loadAnimatedModel();
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
		while (this._enemies.length) {
			this._enemies.pop();
		}
		this._enemies = [];
		this._medies = [];
	}

	win() {
		this._medies.forEach(function (medy) {
			medy._mesh.dispatchEvent(window.game._winEvent);
		});
		const restartButton = window.document.getElementById("restart-button");
		this.makeActive("ui-end");
		restartButton.addEventListener('click', function (event) {
			this.restart();
		}.bind(this));
	}

	lose() {
		this._medies.forEach(function (medy) {
			medy._mesh.dispatchEvent(window.game._lossEvent);
		});
		const restartButton = window.document.getElementById("restart-button");
		this.makeActive("ui-end");
		restartButton.addEventListener('click', function (event) {
			this.restart();
		}.bind(this));
	}

	restart() {
		this.destroy();
		this.start();
		this.createUI();
	}

	addEnemies() {
		this.addEnemy(10, 1, 10);
		this.addEnemy(10, 1, -10);
	}

	addEnemy(x, y, z) {
		const newEnemy = new Enemy(this._player);
		this._enemies.push(newEnemy);
		this.addMedy(newEnemy);
		newEnemy._body.position.set(x, y, z);
	}

	addMedy(medy) {
		this._medies.push(medy);
		this._threeManager.addVisual(medy._mesh);
		this._cannonManager.addPhysical(medy._body);
	}

	removeMedy(medy) {
		if (medy instanceof Enemy) {
			this._enemyCount--;
		}
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
window.addEventListener('resize', window.game._threeManager.windowResizeHandler, false);

// Setting up keyboard events
window.keyboardController = new KeyboardController();
window.keyboardController.init();

window.game.start();
window.game.createUI();