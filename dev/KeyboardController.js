const COMMAND_MAP = {
	'ArrowLeft': 'MoveLeft',
	'ArrowRight': 'MoveRight',
	'ArrowUp': 'Rotate',
	'ArrowDown': 'IncreaseFallRate',
	'Space': 'Drop'
};

export default class KeyboardEventListener {
	constructor(element) {
		this._element = document.getElementById(element);
		this._listener = null;

		window.addEventListener('keydown', evt => {
			let cmd = COMMAND_MAP[evt.code];
			if (cmd && this._listener) {
				this._listener(cmd);
			}
		}, false);

		window.addEventListener('keyup', evt => {
			if (evt.code === 'ArrowDown' && this._listener) {
				this._listener('ResetFallRate');
			}
		}, false);
	}

	onEvent(func) {
		this._listener = func;
	}
}