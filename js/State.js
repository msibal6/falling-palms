import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';

// Parent of state will be the FSM
class State {
	constructor(parent) {
		this._parent = parent;
	}

	Enter() { }
	Exit() { }
	Update() { }
};

class FallingState extends State {
	constructor(parent) {
		super(parent);
	}

	get Name() {
		return "falling";
	}

	Enter(prevState) {
		const idleAction = this._parent._animations['falling'].action;
		if (prevState) {
			// crossfade from previous animation to current idle action
			const prevAction = this._parent._animations[prevState.Name].action;
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

	Exit() {
	}

	Update(_, input) {
		if (input.foundSelf == true) {
			this._parent.setState('rightidle');
		}
	}
}

class RightIdleState extends State {
	constructor(parent) {
		super(parent);
	}

	get Name() {
		return "rightidle";
	}

	Enter(prevState) {
		const idleAction = this._parent._animations['rightidle'].action;
		if (prevState) {
			// crossfade from previous animation to current idle action
			const prevAction = this._parent._animations[prevState.Name].action;
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

	Exit() {

	}

	Update(_, input) {
		if (input.mousedown == true) {
			this._parent.setState('rightpunch');
		}
	}
}

class LeftIdleState extends State {
	constructor(parent) {
		super(parent);
	}

	get Name() {
		return "leftidle";
	}

	Enter(prevState) {
		const idleAction = this._parent._animations['leftidle'].action;
		if (prevState) {
			// crossfade from previous animation to current idle action
			const prevAction = this._parent._animations[prevState.Name].action;
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

	Exit() {
	}

	Update(_, input) {
		if (input.mousedown == true) {
			this._parent.setState('leftpunch');
		}
	}
}

class RightPunchState extends State {
	get Name() {
		return "rightpunch";
	}

	constructor(parent) {
		super(parent);
		this.finishCallback = () => {
			this.finish();
		}
	}

	Enter(prevState) {
		const curAction = this._parent._animations['rightpunch'].action;
		const mixer = curAction.getMixer();
		mixer.addEventListener('finished', this.finishCallback);

		if (prevState) {
			const prevAction = this._parent._animations[prevState.Name].action;

			curAction.reset();
			curAction.setLoop(THREE.LoopOnce, 1);
			curAction.clampWhenFinished = true;
			curAction.crossFadeFrom(prevAction, 0.5, true);
			curAction.play();
		} else {
			curAction.play();
		}
	}

	Exit() {
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

	Update(_, input) { 
	}
}

class LeftPunchState extends State {
	get Name() {
		return 'leftpunch';
	}

	constructor(parent) {
		super(parent);
		this.finishCallback = () => {
			this.finish();
		}
	}

	Enter(prevState) {
		const curAction = this._parent._animations['leftpunch'].action;
		const mixer = curAction.getMixer();
		mixer.addEventListener('finished', this.finishCallback);

		if (prevState) {
			const prevAction = this._parent._animations[prevState.Name].action;

			curAction.reset();
			curAction.setLoop(THREE.LoopOnce, 1);
			curAction.clampWhenFinished = true;
			curAction.crossFadeFrom(prevAction, 0.5, true);
			curAction.play();
		} else {
			curAction.play();
		}
	}

	Exit() {
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

	Update(_, input) { 
	}
}

