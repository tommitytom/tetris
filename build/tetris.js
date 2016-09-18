(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
'use strict';

var _TetrisApp = require('./TetrisApp');

var _TetrisApp2 = _interopRequireDefault(_TetrisApp);

var _TetrisCanvasRenderer = require('./TetrisCanvasRenderer');

var _TetrisCanvasRenderer2 = _interopRequireDefault(_TetrisCanvasRenderer);

var _KeyboardController = require('./KeyboardController');

var _KeyboardController2 = _interopRequireDefault(_KeyboardController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

global.TetrisApp = _TetrisApp2.default;
global.TetrisCanvasRenderer = _TetrisCanvasRenderer2.default;
global.KeyboardController = _KeyboardController2.default;

window.onload = function () {
	var renderer = new _TetrisCanvasRenderer2.default('tetris', 12, 24),
	    controller = new _KeyboardController2.default('tetris'),
	    tetris = new _TetrisApp2.default(renderer, controller);

	tetris.run();
};
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./KeyboardController":3,"./TetrisApp":5,"./TetrisCanvasRenderer":6}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FrameUpdater = function () {
	function FrameUpdater() {
		_classCallCheck(this, FrameUpdater);

		this._lastUpdate = 0;
	}

	_createClass(FrameUpdater, [{
		key: "onFrame",
		value: function onFrame(delta) {}
	}, {
		key: "run",
		value: function run() {
			var _this = this;

			window.requestAnimationFrame(function (ts) {
				_this._updateFrame(ts);
			});
		}
	}, {
		key: "_updateFrame",
		value: function _updateFrame(timeStamp) {
			var _this2 = this;

			if (this._lastUpdate !== 0) {
				this.onFrame((timeStamp - this._lastUpdate) / 1000);
			}

			this._lastUpdate = timeStamp;
			window.requestAnimationFrame(function (ts) {
				_this2._updateFrame(ts);
			});
		}
	}]);

	return FrameUpdater;
}();

exports.default = FrameUpdater;
},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var COMMAND_MAP = {
	'ArrowLeft': 'MoveLeft',
	'ArrowRight': 'MoveRight',
	'ArrowUp': 'Rotate',
	'ArrowDown': 'IncreaseFallRate',
	'Space': 'Drop',
	'KeyZ': 'Hold',
	'KeyR': 'Reset'
};

var KeyboardController = function () {
	function KeyboardController(element) {
		var _this = this;

		_classCallCheck(this, KeyboardController);

		this._element = document.getElementById(element);
		this._listener = null;

		window.addEventListener('keydown', function (evt) {
			var cmd = COMMAND_MAP[evt.code];
			if (cmd && _this._listener) {
				_this._listener(cmd);
			}
		}, false);

		window.addEventListener('keyup', function (evt) {
			if (evt.code === 'ArrowDown' && _this._listener) {
				_this._listener('ResetFallRate');
			}
		}, false);
	}

	_createClass(KeyboardController, [{
		key: 'onEvent',
		value: function onEvent(func) {
			this._listener = func;
		}
	}]);

	return KeyboardController;
}();

exports.default = KeyboardController;
},{}],4:[function(require,module,exports){
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
},{"./Types":7,"./Util":8}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _FrameUpdater2 = require('./FrameUpdater');

var _FrameUpdater3 = _interopRequireDefault(_FrameUpdater2);

var _Tetris = require('./Tetris');

var _Tetris2 = _interopRequireDefault(_Tetris);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TetrisApp = function (_FrameUpdater) {
	_inherits(TetrisApp, _FrameUpdater);

	function TetrisApp(renderer, controller) {
		_classCallCheck(this, TetrisApp);

		var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(TetrisApp).call(this));

		_this._renderer = renderer;
		_this._controller = controller;

		_this._game = new _Tetris2.default(renderer.gridSize.w, renderer.gridSize.h);

		controller.onEvent(function (name) {
			switch (name) {
				case 'MoveLeft':
					_this._game.moveLeft();break;
				case 'MoveRight':
					_this._game.moveRight();break;
				case 'Rotate':
					_this._game.rotate();break;
				case 'IncreaseFallRate':
					_this._game.fallRateMultiplier = 6;break;
				case 'ResetFallRate':
					_this._game.fallRateMultiplier = 1;break;
				case 'Drop':
					_this._game.drop();break;
				case 'Hold':
					_this._game.hold();break;
				case 'Reset':
					_this._game.reset();break;
			}
		});
		return _this;
	}

	_createClass(TetrisApp, [{
		key: 'onFrame',
		value: function onFrame(delta) {
			this._game.update(delta);
			this._renderer.render(this._game.state, delta);
		}
	}]);

	return TetrisApp;
}(_FrameUpdater3.default);

exports.default = TetrisApp;
},{"./FrameUpdater":2,"./Tetris":4}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Util = require('./Util');

var Util = _interopRequireWildcard(_Util);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PLAY_AREA_BORDER = 1;
var DEFAULT_OFFSET = { x: PLAY_AREA_BORDER, y: PLAY_AREA_BORDER };

var TetrisCanvasRenderer = function () {
	function TetrisCanvasRenderer(canvas, w, h) {
		_classCallCheck(this, TetrisCanvasRenderer);

		this._canvas = document.getElementById(canvas);
		this._context = this._canvas.getContext('2d');
		this._gridSize = { w: w, h: h };
		this._gridLength = w * h;
		this._blockSize = 16;
		this._finishIdx = -1;

		this._canvas.width = w * this._blockSize + 300;
		this._canvas.height = h * this._blockSize + PLAY_AREA_BORDER * 2;
	}

	_createClass(TetrisCanvasRenderer, [{
		key: 'render',
		value: function render(state, delta) {
			var canvas = this._canvas,
			    ctx = this._context,
			    gridSize = this._gridSize;

			ctx.fillStyle = 'black';
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			ctx.strokeStyle = 'gray';
			ctx.beginPath();
			ctx.rect(0, 0, this._gridSize.w * this._blockSize + PLAY_AREA_BORDER * 2, this._gridSize.h * this._blockSize + PLAY_AREA_BORDER * 2);
			ctx.stroke();

			var textX = this._gridSize.w * this._blockSize + 40;
			ctx.fillStyle = 'white';
			ctx.font = '14px \'Press Start 2P\'';

			var textY = 30;
			ctx.fillText('Next:', textX, textY);
			var nextPos = { x: textX, y: textY + 30 };
			this._drawTetromino(state.next.type, { x: 0, y: 0 }, state.next.type.color, nextPos);

			ctx.fillStyle = 'white';
			ctx.fillText('Held:', textX + 125, textY);
			var heldPos = { x: textX + 125, y: textY + 30 };
			if (state.held) {
				this._drawTetromino(state.held.type, { x: 0, y: 0 }, state.held.type.color, heldPos);
			}

			ctx.fillStyle = 'white';
			textY = 150;
			ctx.fillText('Lines: ' + state.lines, textX, textY);
			ctx.fillText('Score: ' + state.score, textX, textY + 20);
			ctx.fillText('Level: ' + state.level, textX, textY + 40);

			if (state.playing) {
				this._finishIdx = this._gridLength;
			} else if (this._finishIdx >= 0) {
				this._finishIdx -= 8;
			}

			for (var y = 0; y < gridSize.h; y++) {
				for (var x = 0; x < gridSize.w; ++x) {
					var idx = Util.getArrayIdx(x, y, gridSize.w),
					    block = state.grid[idx];

					if (block !== 0) {
						if (state.playing || this._finishIdx > idx) {
							this._drawBlock(x, y, block, DEFAULT_OFFSET);
						} else {
							this._drawBlock(x, y, 'gray', DEFAULT_OFFSET);
						}
					}
				}
			}

			if (state.playing) {
				var ghostPos = {
					x: state.falling.pos.x,
					y: state.falling.collisionPoint
				};

				this._drawTetromino(state.falling.type, ghostPos, 'rgb(60, 60, 60)', DEFAULT_OFFSET);
				this._drawTetromino(state.falling.type, state.falling.pos, state.falling.type.color, DEFAULT_OFFSET);
			}
		}
	}, {
		key: '_drawTetromino',
		value: function _drawTetromino(type, pos, color, offset) {
			for (var y = 0; y < type.h; y++) {
				if (pos.y + y >= 0) {
					for (var x = 0; x < type.w; x++) {
						var idx = Util.getArrayIdx(x, y, type.w);
						if (type.data[idx] !== 0) {
							this._drawBlock(pos.x + x, pos.y + y, color, offset);
						}
					}
				}
			}
		}
	}, {
		key: '_drawBlock',
		value: function _drawBlock(x, y, color, offset) {
			var ctx = this._context,
			    s = this._blockSize;

			ctx.fillStyle = color;
			ctx.strokeStyle = 'black';
			ctx.lineWidth = 1;

			ctx.beginPath();
			ctx.rect(x * s + offset.x, y * s + offset.y, s, s);
			ctx.fill();
			ctx.stroke();
		}
	}, {
		key: 'gridSize',
		get: function get() {
			return this._gridSize;
		}
	}]);

	return TetrisCanvasRenderer;
}();

exports.default = TetrisCanvasRenderer;
},{"./Util":8}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
var TETROMINO_TYPES = [{
	w: 2, h: 2,
	color: 'yellow',
	data: [1, 1, 1, 1]
}, {
	w: 3, h: 2,
	color: 'green',
	data: [0, 1, 0, 1, 1, 1]
}, {
	w: 3, h: 2,
	color: 'red',
	data: [1, 1, 0, 0, 1, 1]
}, {
	w: 3, h: 2,
	color: 'blue',
	data: [0, 1, 1, 1, 1, 0]
}, {
	w: 2, h: 3,
	color: 'purple',
	data: [1, 1, 1, 0, 1, 0]
}, {
	w: 2, h: 3,
	color: 'orange',
	data: [1, 1, 0, 1, 0, 1]
}, {
	w: 1, h: 4,
	color: '#ff00bf',
	data: [1, 1, 1, 1]
}];

exports.default = TETROMINO_TYPES;
},{}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.getArrayIdx = getArrayIdx;
exports.deepClone = deepClone;
function getArrayIdx(x, y, width) {
	return y * width + x;
}

function deepClone(obj) {
	return JSON.parse(JSON.stringify(obj));
}
},{}]},{},[1]);
