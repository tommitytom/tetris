import * as Util from './Util';
import Types from './Types';

const LINE_SCORES = [ 100, 300, 400, 500 ];

export default class Tetris {
	constructor(w, h) {
		this._size = { w: w, h: h };
		this.reset();
	}

	// Gets the current game state.
	get state() {
		return this._state;
	}

	// Gets the multiplier applied to the fall rate.
	get fallRateMultiplier() {
		return this._fallMult;
	}

	// Sets the multiplier applied to the fall rate.
	set fallRateMultiplier(value) {
		this._fallMult = value;
	}

	// Starts/resumes the game.
	start() {
		this._state.playing = true;
	}

	// Stops/pauses the game.
	stop() {
		this._state.playing = false;
	}

	// Resets then game to its initial state.
	reset() {
		this._state = {
			grid: [],
			falling: this._generateTetromino(),
			next: this._generateTetromino(),
			held: null,
			playing: true,
			lines: 0,
			score: 0,
			level: 1
		};

		for (let i = 0; i < this._size.w * this._size.h; i++) {
			this._state.grid.push(0);
		}

		this._fallMult = 1;
		this._fallDelta = 0;
		this._fallRate = 2; // Rows per second
		this._restrictHold = false;

		this._updateCollisionPoint();
	}

	// Moves the current tetromino to the left by 1 space.
	moveLeft() {
		if (this._state.playing === false) {
			return;
		}

		let t = this._state.falling;
		if (t.pos.x > 0) {
			if (!this._collides(t.type, t.pos.x - 1, t.pos.y)) {
				t.pos.x--;
				this._updateCollisionPoint();
			}
		}
	}

	// Moves the current tetromino to the right by 1 space.
	moveRight() {
		if (this._state.playing === false) {
			return;
		}

		let t = this._state.falling;
		if (t.pos.x + t.type.w < this._size.w) {
			if (!this._collides(t.type, t.pos.x + 1, t.pos.y)) {
				t.pos.x++;
				this._updateCollisionPoint();
			}
		}
	}

	// Drops the current tetromino (hard drop).
	drop() {
		if (this._state.playing === false) {
			return;
		}

		let t = this._state.falling;
		this._state.score += t.collisionPoint - t.pos.y;
		t.pos.y = t.collisionPoint;
		this._handleCollision();
		this._fallDelta = 0;
	}

	// Rotates the current tetromino 90 degrees clockwise.
	rotate() {
		if (this._state.playing === false) {
			return;
		}

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

		this._updateCollisionPoint();
	}

	// Holds the current tetromino for later use.  Also recalls the last held piece.
	hold() {
		if (this._state.playing === false || this._restrictHold === true) {
			return;
		}

		let held = this._state.held,
			falling = this._state.falling;

		if (held) {
			this._state.falling = held;
		} else {
			this._state.falling = this._state.next;
			this._state.next = this._generateTetromino();
		}

		falling.pos.y = -falling.type.h;
		this._state.held = falling;
		this._restrictHold = true;

		this._updateCollisionPoint();
	}

	// Updates the game - called every frame.
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

	// Updates the currently falling tetromino.
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

		if (this._fallMult > 1) {
			this._state.score++;
		}

		this._updateCollisionPoint();
	}

	// Checks to see if the tetromino type will collide with any 
	// others on the grid at the specified position.
	_collides(t, xOff, yOff) {
		if (yOff + t.h > this._size.h) {
			return true;
		}

		for (let y = 0; y < t.h; y++) {
			let gridY = yOff + y;
			if (gridY >= 0) {
				for (let x = 0; x < t.w; x++) {
					let blockIdx = Util.getArrayIdx(x, y, t.w),
						block = t.data[blockIdx];

					if (block !== 0) {
						let gridIdx = Util.getArrayIdx(xOff + x, gridY, this._size.w);
						if (this._state.grid[gridIdx] !== 0) {
							return true;
						}
					}
				}
			}
		}

		return false;
	}

	// Handles a collision between the current tetromino and the grid.
	_handleCollision() {
		this._bake(this._state.falling);
		
		if (this._state.falling.pos.y >= 0) {
			this._removeCompleted();
		} else {
			this.stop();
		}

		this._state.falling = this._state.next;
		this._state.next = this._generateTetromino();
		this._restrictHold = false;
		this._updateCollisionPoint();
	}

	// Updates the point at which the current tetromino will collide with the grid.
	_updateCollisionPoint() {
		let t = this._state.falling,
			rows = 0;

		while (!this._collides(t.type, t.pos.x, t.pos.y + rows + 1)) {
			rows++;
		}

		t.collisionPoint = t.pos.y + rows;
	}

	// Remove all complete lines
	_removeCompleted() {
		let removeCount = 0;
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
				removeCount++;
				y++;
			}
		}

		if (removeCount > 0) {
			this._state.lines += removeCount;
			this._state.level = Math.floor(this._state.lines / 10) + 1;
			this._state.score += LINE_SCORES[removeCount - 1] * this._state.level;
			this._fallRate = this._state.level;
			this._updateCollisionPoint();
		}
	}

	// Shift rows down from the specified row index
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

	// Bakes the currently falling tetromino in to the grid
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

	// Randomly generates a new tetromino.
	_generateTetromino() {
		let idx = Math.floor(Math.random() * (Types.length - 0.00001)),
			type = Types[idx];

		return {
			type: Util.deepClone(type),
			pos: { x: Math.floor(this._size.w / 2), y: -type.h },
			collisionPoint: 0
		};
	}
}