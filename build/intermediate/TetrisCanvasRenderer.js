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