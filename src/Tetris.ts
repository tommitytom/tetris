import * as Util from './Util';
import { TETROMINO_TYPES, TetrominoType } from './Types';
import EventEmitter from 'eventemitter3';

const LINE_SCORES = [100, 300, 400, 500];

export interface Size {
	w: number;
	h: number;
}

interface Tetromino {
	type: TetrominoType;
	typeIdx: number;
	pos: { x: number; y: number };
	collisionPoint: number;
}

interface GameState {
	grid: number[];
	falling: Tetromino;
	next: Tetromino;
	held: Tetromino | null;
	playing: boolean;
	removeCountdown: number;
	removing: number[]|null;
	lines: number;
	score: number;
	level: number;
}

export default class Tetris extends EventEmitter {
	private _size: Size;
	private _state: GameState;
	private _fallMult: number;
	private _fallDelta: number;
	private _fallRate: number;
	private _restrictHold: boolean;

	constructor(w: number, h: number) {
		super();
		this._size = { w: w, h: h };
		this.reset();
	}

	get size(): Size {
		return this._size;
	}

	// Gets the current game state.
	get state(): GameState {
		return this._state;
	}

	// Gets the multiplier applied to the fall rate.
	get fallRateMultiplier(): number {
		return this._fallMult;
	}

	// Sets the multiplier applied to the fall rate.
	set fallRateMultiplier(value: number) {
		this._fallMult = value;
	}

	// Starts/resumes the game.
	start(): void {
		this._state.playing = true;
	}

	// Stops/pauses the game.
	stop(): void {
		this._state.playing = false;
	}

	// Resets the game to its initial state.
	reset(): void {
		this._state = {
			grid: [],
			falling: this._generateTetromino(),
			next: this._generateTetromino(),
			held: null,
			playing: true,
			removeCountdown: 0,
			removing: null,
			lines: 0,
			score: 0,
			level: 1
		};

		for (let i = 0; i < this._size.w * this._size.h; i++) {
			this._state.grid.push(-1);
		}

		this._fallMult = 1;
		this._fallDelta = 0;
		this._fallRate = 2 * 2; // Rows per second
		this._restrictHold = false;

		this._updateCollisionPoint();
	}

	// Moves the current tetromino to the left by 1 space.
	moveLeft(): void {
		if (!this._state.playing) {
			return;
		}

		let t = this._state.falling;
		if (t.pos.x > 0 && !this._collides(t.type, t.pos.x - 1, t.pos.y)) {
			t.pos.x--;
			this._updateCollisionPoint();
		}
	}

	// Moves the current tetromino to the right by 1 space.
	moveRight(): void {
		if (!this._state.playing) {
			return;
		}

		let t = this._state.falling;
		if (t.pos.x + t.type.w < this._size.w && !this._collides(t.type, t.pos.x + 1, t.pos.y)) {
			t.pos.x++;
			this._updateCollisionPoint();
		}
	}

	// Drops the current tetromino (hard drop).
	drop(): void {
		if (!this._state.playing) {
			return;
		}

		let t = this._state.falling;
		this._state.score += (t.collisionPoint - t.pos.y) * this._state.level;
		t.pos.y = t.collisionPoint;
		this._handleCollision();
		this._fallDelta = 0;
	}

	// Rotates the current tetromino 90 degrees clockwise.
	rotate(): void {
		if (!this._state.playing) {
			return;
		}

		let t = this._state.falling;
		let type: TetrominoType = {
			w: t.type.h,
			h: t.type.w,
			color: t.type.color,
			data: [],
			outline: []
		};

		for (let x = 0; x < t.type.w; x++) {
			for (let y = t.type.h - 1; y >= 0; y--) {
				const idx = Util.getArrayIdx(x, y, t.type.w);
				type.data.push(t.type.data[idx]);
			}
		}

		const overflow = t.pos.x + type.w - this._size.w;
		if (overflow > 0) {
			t.pos.x -= overflow;
		}

		if (!this._collides(type, t.pos.x, t.pos.y)) {
			t.type = type;
		}

		this._updateCollisionPoint();

		this.emit('rotate');
	}

	// Holds the current tetromino for later use. Also recalls the last held piece.
	hold(): void {
		if (!this._state.playing || this._restrictHold) {
			return;
		}

		let held = this._state.held;
		let falling = this._state.falling;

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
	update(delta: number): void {
		if (!this._state.playing) {
			return;
		}

		if (this._state.removeCountdown > 0 && this._state.removing) {
			this._state.removeCountdown -= delta;

			if (this._state.removeCountdown <= 0) {				
				this._removeCompleted(this._state.removing);
				this._state.removing = null;
			} else {
				return;
			}
		}

		this._fallDelta += delta * this._fallMult * this._fallRate;
		if (this._fallDelta > 1) {
			this._updateFalling();
			this._fallDelta %= 1;
		}
	}

	// Updates the currently falling tetromino.
	private _updateFalling(): void {
		let t = this._state.falling;
		let fallCount = Math.floor(this._fallDelta);

		for (let i = 0; i < fallCount; i++) {
			if (this._collides(t.type, t.pos.x, t.pos.y + 1)) {
				this._handleCollision();
				return;
			} else {
				t.pos.y++;
			}
		}

		if (this._fallMult > 1) {
			this._state.score += this._state.level;
		}

		this._updateCollisionPoint();
	}

	// Checks to see if the tetromino type will collide with any others on the grid at the specified position.
	private _collides(t: TetrominoType, xOff: number, yOff: number): boolean {
		if (yOff + t.h > this._size.h) {
			return true;
		}

		for (let y = 0; y < t.h; y++) {
			let gridY = yOff + y;
			if (gridY >= 0) {
				for (let x = 0; x < t.w; x++) {
					let blockIdx = Util.getArrayIdx(x, y, t.w);
					let block = t.data[blockIdx];

					if (block !== 0) {
						let gridIdx = Util.getArrayIdx(xOff + x, gridY, this._size.w);
						if (this._state.grid[gridIdx] !== -1) {
							return true;
						}
					}
				}
			}
		}

		return false;
	}

	// Handles a collision between the current tetromino and the grid.
	private _handleCollision(): void {
		this._bake(this._state.falling);

		if (this._state.falling.pos.y >= 0) {
			const completed = this.findCompleted();
			if (completed.length > 0) {
				this._state.removing = completed;
				this._state.removeCountdown = 2.0;
				this.emit('removeBegin', completed.length);
			}
		} else {
			this.emit('death');
			this.stop();
		}

		this._state.falling = this._state.next;
		this._state.next = this._generateTetromino();
		this._restrictHold = false;
		this._updateCollisionPoint();
	}

	// Updates the point at which the current tetromino will collide with the grid.
	private _updateCollisionPoint(): void {
		let t = this._state.falling;
		let rows = 0;

		while (!this._collides(t.type, t.pos.x, t.pos.y + rows + 1)) {
			rows++;
		}

		t.collisionPoint = t.pos.y + rows;
	}

	private findCompleted(): number[] {
		const found: number[] = [];

		for (let y = this._size.h - 1; y > 0; y--) {
			let complete = true;
			for (let x = 0; x < this._size.w; x++) {
				let idx = Util.getArrayIdx(x, y, this._size.w);
				if (this._state.grid[idx] === -1) {
					complete = false;
					break;
				}
			}

			if (complete) {
				found.push(y);
			}
		}

		return found;
	}

	// Remove all complete lines
	private _removeCompleted(removals: number[]): void {
		for (let y of removals) {
			this._shiftRows(y);
		}

		this._state.lines += removals.length;
		this._state.level = Math.floor(this._state.lines / 10) + 1;
		this._state.score += LINE_SCORES[removals.length - 1] * this._state.level;
		this._fallRate = this._state.level * 2;
		this._updateCollisionPoint();

		this.emit('removeComplete', removals.length);
	}

	// Shift rows down from the specified row index
	private _shiftRows(idx: number): void {
		let grid = this._state.grid;
		for (let y = idx; y > 1; y--) {
			for (let x = 0; x < this._size.w; x++) {
				let idx = Util.getArrayIdx(x, y, this._size.w);
				grid[idx] = grid[idx - this._size.w];
			}
		}

		for (let x = 0; x < this._size.w; x++) {
			grid[x] = -1;
		}
	}

	// Bakes the currently falling tetromino into the grid
	private _bake(t: Tetromino): void {
		for (let y = 0; y < t.type.h; y++) {
			for (let x = 0; x < t.type.w; ++x) {
				let block = t.type.data[y * t.type.w + x];
				if (block !== 0) {
					let idx = Util.getArrayIdx(t.pos.x + x, t.pos.y + y, this._size.w);
					this._state.grid[idx] = t.typeIdx;
				}
			}
		}
	}

	// Randomly generates a new tetromino.
	private _generateTetromino(): Tetromino {
		let idx = Math.floor(Math.random() * (TETROMINO_TYPES.length - 0.00001));
		let type = TETROMINO_TYPES[idx];

		return {
			type: type,
			typeIdx: idx,
			pos: { x: Math.floor(this._size.w / 2), y: -type.h },
			collisionPoint: 0
		};
	}
}