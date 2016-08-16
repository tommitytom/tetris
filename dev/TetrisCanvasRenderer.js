import * as Util from './Util';

export default class TetrisCanvasRenderer {
	constructor(canvas, w, h) {
		this._canvas = document.getElementById(canvas);
		this._context = this._canvas.getContext('2d');
		this._gridSize = { w: w, h: h };
		this._blockSize = 16;

		this._canvas.width = w * this._blockSize;
		this._canvas.height = h * this._blockSize;
	}

	get gridSize() {
		return this._gridSize;
	}

	render(state) {
		let canvas = this._canvas,
			ctx = this._context,
			gridSize = this._gridSize;

		ctx.fillStyle = 'black';
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		for (let y = 0; y < gridSize.h; y++) {
			for (let x = 0; x < gridSize.w; ++x) {
				let idx = Util.getArrayIdx(x, y, gridSize.w),
					block = state.grid[idx];

				if (block !== 0) {
					this._drawBlock(x, y, block);
				}
			}
		}

		if (state.falling) {
			let ghostPos = {
				x: state.falling.pos.x,
				y: state.falling.collisionPoint
			};

			this._drawTetromino(state.falling.type, ghostPos, 'rgb(60,60,60)');
			this._drawTetromino(state.falling.type, state.falling.pos, state.falling.type.color);
		}
	}

	_drawTetromino(type, pos, color) {
		for (let y = 0; y < type.h; y++) {
			if (pos.y + y >= 0) {
				for (let x = 0; x < type.w; x++) {
					let idx = Util.getArrayIdx(x, y, type.w);
					if (type.data[idx] !== 0) {
						this._drawBlock(pos.x + x, pos.y + y, color);
					}
				}
			}
		}
	}

	_drawBlock(x, y, color) {
		let ctx = this._context,
			s = this._blockSize;

		ctx.fillStyle = color;
		ctx.strokeStyle = 'black';
		ctx.lineWidth = 1;

		ctx.beginPath();
		ctx.rect(x * s, y * s, s, s);
		ctx.fill();
		ctx.stroke();
	}
}