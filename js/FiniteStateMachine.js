import {
	FallingState,
	RightIdleState,
	LeftIdleState,
	RightPunchState,
	LeftPunchState
} from './State.js';

class FiniteStateMachine {
	constructor() {
		this._states = {};
		this._currentState = null;
	}

	addState(name, type) {
		this._states[name] = type;
	}

	setState(name) {
		const prevState = this._currentState;
		if (prevState) {
			if (prevState.Name == name) {
				return;
			}
			prevState.Exit();
		}
		const state = new this._states[name](this);

		this._currentState = state;
		state.Enter(prevState);
	}

	update(timeElapsed, input) {
		if (this._currentState) {
			this._currentState.update(timeElapsed, input);
		}
	}
}

class PlayerFSM extends FiniteStateMachine {
	constructor(animations) {
		super();
		this._animations = animations;
		this.addState('falling', FallingState);
		this.addState('rightidle', RightIdleState);
		this.addState('leftidle', LeftIdleState);
		this.addState('rightpunch', RightPunchState);
		this.addState('leftpunch', LeftPunchState);
	}
}

export { PlayerFSM };