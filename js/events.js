"use strict";
export class KeyboardController {
	constructor() {
		// keycodes
		this.keyCodes = {
			32: "space",
			65: "a",
			68: "d",
			83: "s",
			87: "w",
		}
		// which keys pressed
		this.pressed = {
			"space": false,
			"a": false,
			"w": false,
			"s": false,
			"d": false,
		}
		this.onKeyDownHandler = this.onKeyDown.bind(this);
		this.onKeyUpHandler = this.onKeyUp.bind(this);
		console.log(this);
		console.log(this.keyCodes);
		console.log(this.pressed);
	}
	// listen for key press
	onKeyDown(event) {
		// set key to true

		console.log(event);
		this.pressed[this.keyCodes[event.keyCode]] = true;
		console.log(this.pressed);
	}
	// listen for key release
	onKeyUp(event) {

		this.pressed[this.keyCodes[event.keyCode]] = false;
	}

	// start listening 
	init() {
		document.addEventListener("keydown", this.onKeyDownHandler);
		document.addEventListener("keyup", this.onKeyUpHandler);
	}
}