import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';

// Parent of state will be the FSM
class State {
	constructor(parent) {
		this._parent = parent;
	}

	enter() { }
	exit() { }
	update() { }
};

class FallingState extends State {
	constructor(parent) {
		super(parent);
	}

	get name() {
		return "falling";
	}

	enter(prevState) {
		const idleAction = this._parent._animations['falling'].action;
		if (prevState) {
			// crossfade from previous animation to current idle action
			const prevAction = this._parent._animations[prevState.name].action;
			idleAction.time = 0.0;
			idleAction.enabled = true;
			idleAction.setEffectiveTimeScale(1.0);
			idleAction.setEffectiveWeight(1.0);
			idleAction.crossFadeFrom(prevAction, 0.5, true);
			idleAction.play();
		} else {
			idleAction.play();
		}
	}

	exit() {
	}

	update(_, input) {
		if (input._foundSelf == true) {
			this._parent.setState('rightidle');
		}
	}
}

class RightIdleState extends State {
	constructor(parent) {
		super(parent);
	}

	get name() {
		return "rightidle";
	}

	enter(prevState) {
		const idleAction = this._parent._animations['rightidle'].action;
		if (prevState) {
			// crossfade from previous animation to current idle action
			console.log(this);
			const prevAction = this._parent._animations[prevState.name].action;
			idleAction.time = 0.0;
			idleAction.enabled = true;
			idleAction.setEffectiveTimeScale(1.0);
			idleAction.setEffectiveWeight(1.0);
			idleAction.crossFadeFrom(prevAction, 0.5, true);
			idleAction.play();
		} else {
			idleAction.play();
		}
	}

	exit() {

	}

	update(_, input) {
		if (input._mouseDown == true) {
			this._parent.setState('rightpunch');
		}
	}
}

class LeftIdleState extends State {
	constructor(parent) {
		super(parent);
	}

	get name() {
		return "leftidle";
	}

	enter(prevState) {
		const idleAction = this._parent._animations['leftidle'].action;
		if (prevState) {
			// crossfade from previous animation to current idle action
			const prevAction = this._parent._animations[prevState.name].action;
			idleAction.time = 0.0;
			idleAction.enabled = true;
			idleAction.setEffectiveTimeScale(1.0);
			idleAction.setEffectiveWeight(1.0);
			idleAction.crossFadeFrom(prevAction, 0.5, true);
			idleAction.play();
		} else {
			idleAction.play();
		}
	}

	exit() {
	}

	update(_, input) {
		if (input._mouseDown == true) {
			this._parent.setState('leftpunch');
		}
	}
}

class RightPunchState extends State {
	get name() {
		return "rightpunch";
	}

	constructor(parent) {
		super(parent);
		this.finishCallback = () => {
			this.finish();
		}
	}

	enter(prevState) {
		const curAction = this._parent._animations['rightpunch'].action;
		const mixer = curAction.getMixer();
		mixer.addEventListener('finished', this.finishCallback);

		if (prevState) {
			const prevAction = this._parent._animations[prevState.name].action;

			curAction.reset();
			curAction.setLoop(THREE.LoopOnce, 1);
			curAction.clampWhenFinished = true;
			curAction.crossFadeFrom(prevAction, 0.5, true);
			curAction.play();
		} else {
			curAction.play();
		}
	}

	exit() {
		this.cleanup();

	}

	finish() {
		this.cleanup();
		this._parent.setState('leftidle');
	}

	cleanup() {
		const rightPunchAction = this._parent._animations['rightpunch'].action;
		rightPunchAction.getMixer().removeEventListener('finished', this.finishCallback);
	}

	update(_, input) {
	}
}

class LeftPunchState extends State {
	get name() {
		return 'leftpunch';
	}

	constructor(parent) {
		super(parent);
		this.finishCallback = () => {
			this.finish();
		}
	}

	enter(prevState) {
		const curAction = this._parent._animations['leftpunch'].action;
		const mixer = curAction.getMixer();
		mixer.addEventListener('finished', this.finishCallback);

		if (prevState) {
			const prevAction = this._parent._animations[prevState.name].action;

			curAction.reset();
			curAction.setLoop(THREE.LoopOnce, 1);
			curAction.clampWhenFinished = true;
			curAction.crossFadeFrom(prevAction, 0.5, true);
			curAction.play();
		} else {
			curAction.play();
		}
	}

	exit() {
		this.cleanup();

	}

	finish() {
		this.cleanup();
		this._parent.setState('rightidle');
	}

	cleanup() {
		const rightPunchAction = this._parent._animations['leftpunch'].action;
		rightPunchAction.getMixer().removeEventListener('finished', this.finishCallback);
	}

	update(_, input) {
	}
}


export { FallingState, RightIdleState, LeftIdleState, RightPunchState, LeftPunchState };