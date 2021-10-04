export class PlayerInput {
	constructor() {
		this._foundSelf = false;
		this._mouseDown = false;
		document.addEventListener('mousedown', (e) => { this.onMouseDown(e); }, false);
		document.addEventListener('mouseup', (e) => { this.onMouseUp(e); }, false);
	}

	onMouseDown(e) {
		this._mouseDown = true;

	}

	onMouseUp(e) {
		this._mouseDown = false;
	}
}