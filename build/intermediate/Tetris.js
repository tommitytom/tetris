'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Util = require('./Util');

var Util = _interopRequireWildcard(_Util);

var _Types = require('./Types');

var _Types2 = _interopRequireDefault(_Types);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LINE_SCORES = [100, 300, 400, 500];

var Tetris = function () {
	function Tetris(w, h) {
		_classCallCheck(this, Tetris);

		this._size = { w: w, h: h };
		this.reset();
	}

	// Gets the current game state.


	_createClass(Tetris, [{
		key: 'start',


		// Starts/resumes the game.
		value: function start() {
			this._state.playing = true;
		}

		// Stops/pauses the game.

	}, {
		key: 'stop',
		value: function stop() {
			this._state.playing = false;
		}

		// Resets then game to its initial state.

	}, {
		key: 'reset',
		value: function reset() {
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

			for (var i = 0; i < this._size.w * this._size.h; i++) {
				this._state.grid.push(0);
			}

			this._fallMult = 1;
			this._fallDelta = 0;
			this._fallRate = 2; // Rows per second
			this._restrictHold = false;

			this._updateCollisionPoint();
		}

		// Moves the current tetromino to the left by 1 space.

	}, {
		key: 'moveLeft',
		value: function moveLeft() {
			if (this._state.playing === false) {
				return;
			}

			var t = this._state.falling;
			if (t.pos.x > 0) {
				if (!this._collides(t.type, t.pos.x - 1, t.pos.y)) {
					t.pos.x--;
					this._updateCollisionPoint();
				}
			}
		}

		// Moves the current tetromino to the right by 1 space.

	}, {
		key: 'moveRight',
		value: function moveRight() {
			if (this._state.playing === false) {
				return;
			}

			var t = this._state.falling;
			if (t.pos.x + t.type.w < this._size.w) {
				if (!this._collides(t.type, t.pos.x + 1, t.pos.y)) {
					t.pos.x++;
					this._updateCollisionPoint();
				}
			}
		}

		// Drops the current tetromino (hard drop).

	}, {
		key: 'drop',
		value: function drop() {
			if (this._state.playing === false) {
				return;
			}

			var t = this._state.falling;
			this._state.score += (t.collisionPoint - t.pos.y) * this._state.level;
			t.pos.y = t.collisionPoint;
			this._handleCollision();
			this._fallDelta = 0;
		}

		// Rotates the current tetromino 90 degrees clockwise.

	}, {
		key: 'rotate',
		value: function rotate() {
			if (this._state.playing === false) {
				return;
			}

			var t = this._state.falling;
			var type = {
				w: t.type.h,
				h: t.type.w,
				color: t.type.color,
				data: []
			};

			for (var x = 0; x < t.type.w; x++) {
				for (var y = t.type.h - 1; y >= 0; y--) {
					var idx = Util.getArrayIdx(x, y, t.type.w);
					type.data.push(t.type.data[idx]);
				}
			}

			var overflow = t.pos.x + type.w - this._size.w;
			if (overflow > 0) {
				t.pos.x -= overflow;
			}

			if (!this._collides(type, t.pos.x, t.pos.y)) {
				t.type = type;
			}

			this._updateCollisionPoint();
		}

		// Holds the current tetromino for later use.  Also recalls the last held piece.

	}, {
		key: 'hold',
		value: function hold() {
			if (this._state.playing === false || this._restrictHold === true) {
				return;
			}

			var held = this._state.held,
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

	}, {
		key: 'update',
		value: function update(delta) {
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

	}, {
		key: '_updateFalling',
		value: function _updateFalling() {
			var t = this._state.falling,
			    fallCount = Math.floor(this._fallDelta);

			for (var i = 0; i < fallCount; i++) {
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

		// Checks to see if the tetromino type will collide with any 
		// others on the grid at the specified position.

	}, {
		key: '_collides',
		value: function _collides(t, xOff, yOff) {
			if (yOff + t.h > this._size.h) {
				return true;
			}

			for (var y = 0; y < t.h; y++) {
				var gridY = yOff + y;
				if (gridY >= 0) {
					for (var x = 0; x < t.w; x++) {
						var blockIdx = Util.getArrayIdx(x, y, t.w),
						    block = t.data[blockIdx];

						if (block !== 0) {
							var gridIdx = Util.getArrayIdx(xOff + x, gridY, this._size.w);
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

	}, {
		key: '_handleCollision',
		value: function _handleCollision() {
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

	}, {
		key: '_updateCollisionPoint',
		value: function _updateCollisionPoint() {
			var t = this._state.falling,
			    rows = 0;

			while (!this._collides(t.type, t.pos.x, t.pos.y + rows + 1)) {
				rows++;
			}

			t.collisionPoint = t.pos.y + rows;
		}

		// Remove all complete lines

	}, {
		key: '_removeCompleted',
		value: function _removeCompleted() {
			var removeCount = 0;
			for (var y = this._size.h - 1; y > 0; y--) {
				var complete = true;
				for (var x = 0; x < this._size.w; x++) {
					var idx = Util.getArrayIdx(x, y, this._size.w);
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

	}, {
		key: '_shiftRows',
		value: function _shiftRows(idx) {
			var grid = this._state.grid;
			for (var y = idx; y > 1; y--) {
				for (var x = 0; x < this._size.w; x++) {
					var _idx = Util.getArrayIdx(x, y, this._size.w);
					grid[_idx] = grid[_idx - this._size.w];
				}
			}

			for (var _x = 0; _x < this._size.w; _x++) {
				grid[_x] = 0;
			}
		}

		// Bakes the currently falling tetromino in to the grid

	}, {
		key: '_bake',
		value: function _bake(t) {
			for (var y = 0; y < t.type.h; y++) {
				for (var x = 0; x < t.type.w; ++x) {
					var block = t.type.data[y * t.type.w + x];
					if (block !== 0) {
						var idx = Util.getArrayIdx(t.pos.x + x, t.pos.y + y, this._size.w);
						this._state.grid[idx] = t.type.color;
					}
				}
			}
		}

		// Randomly generates a new tetromino.

	}, {
		key: '_generateTetromino',
		value: function _generateTetromino() {
			var idx = Math.floor(Math.random() * (_Types2.default.length - 0.00001)),
			    type = _Types2.default[idx];

			return {
				type: Util.deepClone(type),
				pos: { x: Math.floor(this._size.w / 2), y: -type.h },
				collisionPoint: 0
			};
		}
	}, {
		key: 'state',
		get: function get() {
			return this._state;
		}

		// Gets the multiplier applied to the fall rate.

	}, {
		key: 'fallRateMultiplier',
		get: function get() {
			return this._fallMult;
		}

		// Sets the multiplier applied to the fall rate.
		,
		set: function set(value) {
			this._fallMult = value;
		}
	}]);

	return Tetris;
}();

exports.default = Tetris;