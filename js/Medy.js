import * as CANNON from './cannon-es.js';

export class Medy {
	constructor(mesh, body) {
		this._mesh = mesh;
		this._body = body;
	}

	update() {
		this._mesh.position.copy(this._body.position);
	}
}