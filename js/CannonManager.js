export class CannonManager {
	constructor(cannonModule) {
		this.cannon = cannonModule;
		this.timeStep = 1 / 60;
	}
}