import * as Util from './Util';

const TETROMINO_TYPES = [
	{
		w: 2, h: 2,
		color: 'yellow',
		data: [
			1, 1,
			1, 1
		]
	},
	{
		w: 3, h: 2,
		color: 'green',
		data: [
			0, 1, 0,
			1, 1, 1
		]
	},
	{
		w: 3, h: 2,
		color: 'red',
		data: [
			1, 1, 0,
			0, 1, 1
		]
	},
	{
		w: 3, h: 2,
		color: 'blue',
		data: [
			0, 1, 1,
			1, 1, 0
		]
	},
	{
		w: 2, h: 3,
		color: 'purple',
		data: [
			1, 1,
			1, 0,
			1, 0,
		]
	},
	{
		w: 2, h: 3,
		color: 'orange',
		data: [
			1, 1,
			0, 1,
			0, 1,
		]
	},
	{
		w: 1, h: 4,
		color: '#ff00bf',
		data: [
			1,
			1,
			1,
			1
		]
	}
];

export default class Tetris {
	constructor(w, h) {
		this._size = { w: w, h: h };
		this._fallRate = 2; // Rows per second
		this.reset();
	}

	get state() {
		return this._state;
	}

	get fallRate() {
		return this._fallMult;
	}

	set fallRate(value) {
		this._fallMult = value;
	}

	start() {
		this._state.playing = true;
	}

	stop() {
		this._state.playing = false;
	}

	reset() {
		this._state = {
			grid: [],
			falling: this._generateTetromino(),
			playing: false,
			score: 0,
			level: 1
		};

		for (let i = 0; i < this._size.w * this._size.h; i++) {
			this._state.grid.push(0);
		}

		this._fallMult = 1;
		this._fallDelta = 0;
		this._updateGhost();
	}

	moveLeft() {
		let t = this._state.falling;
		if (t.pos.x > 0) {
			if (!this._collides(t.type, t.pos.x - 1, t.pos.y)) {
				t.pos.x--;
				this._updateGhost();
			}
		}
	}

	moveRight() {
		let t = this._state.falling;
		if (t.pos.x + t.type.w < this._size.w) {
			if (!this._collides(t.type, t.pos.x + 1, t.pos.y)) {
				t.pos.x++;
				this._updateGhost();
			}
		}
	}

	drop() {
		let t = this._state.falling;
		t.pos.y = t.collisionPoint;
		this._handleCollision();
		this._fallDelta = 0;
	}

	rotate() {
		let t = this._state.falling;
		let type = {
			w: t.type.h,
			h: t.type.w,
			color: t.type.color,
			data: []
		};

		for (let x = 0; x < t.type.w; x++) {
			for (let y = t.type.h - 1; y >= 0; y--) {
				let idx = Util.getArrayIdx(x, y, t.type.w);
				type.data.push(t.type.data[idx]);
			}
		}

		let overflow = t.pos.x + type.w - this._size.w;
		if (overflow > 0) {
			t.pos.x -= overflow;
		}

		if (!this._collides(type, t.pos.x, t.pos.y)) {
			t.type = type;
		}

		this._updateGhost();
	}

	update(delta) {
		if (this._state.playing === false) {
			return;
		}

		this._fallDelta += delta * this._fallMult * this._fallRate;

		if (this._fallDelta > 1) {
			this._updateFalling();
			this._fallDelta %= 1;
		}
	}

	_collides(t, xOff, yOff) {
		let bottom = yOff + t.h;
		if (bottom > this._size.h) {
			return true;
		}

		for (let y = 0; y < t.h; y++) {
			if (yOff + y >= 0) {
				for (let x = 0; x < t.w; x++) {
					let blockIdx = Util.getArrayIdx(x, y, t.w),
						block = t.data[blockIdx];

					if (block !== 0) {
						let gridIdx = Util.getArrayIdx(xOff + x, yOff + y, this._size.w);
						if (this._state.grid[gridIdx] !== 0) {
							return true;
						}
					}
				}
			}
		}

		return false;
	}

	_updateFalling() {
		let t = this._state.falling,
			fallCount = Math.floor(this._fallDelta);

		for (let i = 0; i < fallCount; i++) {
			if (this._collides(t.type, t.pos.x, t.pos.y + 1)) {
				this._handleCollision();
				return;
			} else {
				t.pos.y++;
			}
		}

		this._updateGhost();
	}

	_updateGhost() {
		let t = this._state.falling,
			rows = 0;

		while (!this._collides(t.type, t.pos.x, t.pos.y + rows + 1)) {
			rows++;
		}

		t.collisionPoint = t.pos.y + rows;
	}

	_handleCollision() {
		this._bake(this._state.falling);
		
		if (this._state.falling.pos.y >= 0) {
			this._removeCompleted();
		} else {
			this.stop();
		}

		this._state.falling = this._generateTetromino();
		this._updateGhost();
	}

	_removeCompleted() {
		let updated = true;
		for (let y = this._size.h - 1; y > 0; y--) {
			let complete = true;
			for (let x = 0; x < this._size.w; x++) {
				let idx = Util.getArrayIdx(x, y, this._size.w);
				if (this._state.grid[idx] === 0) {
					complete = false;
					break;
				}
			}

			if (complete) {
				this._shiftRows(y);
				this._state.score++;
				this._state.level = Math.floor(this._state.score / 10) + 1;
				this._fallRate = this._state.level;
				updated = true;
				y++;
			}
		}

		if (updated) {
			this._updateGhost();
		}
	}

	_shiftRows(idx) {
		let grid = this._state.grid;
		for (let y = idx; y > 1; y--) {
			for (let x = 0; x < this._size.w; x++) {
				let idx = Util.getArrayIdx(x, y, this._size.w);
				grid[idx] = grid[idx - this._size.w];
			}
		}

		for (let x = 0; x < this._size.w; x++) {
			grid[x] = 0;
		}
	}

	_bake(t) {
		for (let y = 0; y < t.type.h; y++) {
			for (let x = 0; x < t.type.w; ++x) {
				let block = t.type.data[y * t.type.w + x];
				if (block !== 0) {
					let idx = Util.getArrayIdx(t.pos.x + x, t.pos.y + y, this._size.w);
					this._state.grid[idx] = t.type.color;
				}
			}
		}
	}

	_generateTetromino() {
		let idx = Math.floor(Math.random() * (TETROMINO_TYPES.length - 0.00001)),
			type = TETROMINO_TYPES[idx];

		return {
			type: Util.deepClone(type),
			pos: { x: Math.floor(this._size.w / 2), y: -type.h },
			collisionPoint: 0
		};
	}
}