function findElements(current, items, names) {
	for (let i = 0; i < current.children.length; i++) {
		let child = current.children[i];
		if (names.indexOf(child.id) !== -1) {
			items[child.id] = child;
		}

		findElements(child, items, names);
	}
}

export default class StateListener {
	constructor(state) {
		this._rootElement = document.getElementById(state);
		this._elements = {};

		findElements(this._rootElement, this._elements, [
			'status',
			'score',
			'level'
		]);
	}

	update(state) {
		this._set('level', state.level);
		this._set('score', state.score);

		if (state.playing) {
			this._set('status', 'Playing...');
		} else {
			this._set('status', 'Game over!');
		}
	}

	_set(name, value) {
		this._elements[name].innerHTML = value;
	}
}