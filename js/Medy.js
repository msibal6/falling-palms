export class Medy {
	constructor(mesh, body) {
		this._mesh = mesh;
		this._body = body;
	}

	update() {
		this._mesh.position.copy(this._body.position);
	}

	test() {
		console.log(this);
	}

	bindMethod(boundMethodName, ogMethodName) {
		this[boundMethodName] = this[ogMethodName].bind(this)
	}
}