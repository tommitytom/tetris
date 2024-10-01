import { Size, GameState } from './Tetris';
import { Color, IPoint, TETROMINO_TYPES, TetrominoType } from './Types';
import * as Util from './Util';

const PLAY_AREA_BORDER = 1;
const DEFAULT_OFFSET = { x: PLAY_AREA_BORDER, y: PLAY_AREA_BORDER };
const GRAY_COLOR: Color = [60, 60, 60];
const REMOVAL_FLASH_RATE = 0.1; // Lower values make the flashing faster

export default class TetrisCanvasRenderer {
	private _canvas: HTMLCanvasElement;
	private _context: CanvasRenderingContext2D;
	private _gridSize: Size;
	private _gridLength: number;
	private _blockSize: number;
	private _finishIdx: number;

	constructor(canvas, w, h) {
		this._canvas = document.getElementById(canvas) as HTMLCanvasElement;
		this._context = this._canvas.getContext('2d');
		this._gridSize = { w: w, h: h };
		this._gridLength = w * h;
		this._blockSize = 16;
		this._finishIdx = -1;

		this._canvas.width = w * this._blockSize + 300;
		this._canvas.height = h * this._blockSize + PLAY_AREA_BORDER * 2;
	}

	get gridSize() {
		return this._gridSize;
	}

	render(state: GameState, delta: number) {
		const canvas = this._canvas,
			ctx = this._context,
			gridSize = this._gridSize;

		ctx.fillStyle = 'black';
		ctx.fillRect(0, 0, canvas.width, canvas.height);


		/*ctx.fillStyle = 'gray';
		ctx.strokeStyle = 'white';

		const test = TETROMINO_TYPES[6];
		const points = traceShape(test.w, test.h, test.data, this._blockSize);		

		ctx.beginPath();
		ctx.moveTo(points[0].x * this._blockSize + 250, points[0].y * this._blockSize + 250);
		for (let i = 0; i < points.length; i++) {
			const point = points[i];
			ctx.lineTo(point.x * this._blockSize + 250, point.y * this._blockSize + 250);
		}

		ctx.closePath();
		ctx.stroke();*/


		//ctx.fillRect(250, 250, 100, 100);

		ctx.fillStyle = 'black';
		ctx.strokeStyle = 'gray';
		ctx.beginPath();
		ctx.rect(0, 0, this._gridSize.w * this._blockSize + PLAY_AREA_BORDER * 2, this._gridSize.h * this._blockSize + PLAY_AREA_BORDER * 2);
		ctx.stroke();

		let textX = this._gridSize.w * this._blockSize + 40;
		ctx.fillStyle = 'white';
		ctx.font = `14px 'Press Start 2P'`;

		let textY = 30;
		ctx.fillText('Next:', textX, textY);
		let nextPos = { x: textX, y: textY + 30 };
		this._drawTetromino(state.next.type, { x: 0, y: 0 }, state.next.type.color, nextPos);

		ctx.fillStyle = 'white';
		ctx.fillText('Held:', textX + 125, textY);
		let heldPos = { x: textX + 125, y: textY + 30 };
		if (state.held) {
			this._drawTetromino(state.held.type, { x: 0, y: 0 }, state.held.type.color, heldPos);
		}

		ctx.fillStyle = 'white';
		textY = 150;
		ctx.fillText(`Lines: ${state.lines}`, textX, textY);
		ctx.fillText(`Score: ${state.score}`, textX, textY + 20);
		ctx.fillText(`Level: ${state.level}`, textX, textY + 40);

		if (state.playing) {
			this._finishIdx = this._gridLength;
		} else if (this._finishIdx >= 0) {
			this._finishIdx -= 8;
		}

		for (let y = 0; y < gridSize.h; y++) {
			for (let x = 0; x < gridSize.w; ++x) {
				let idx = Util.getArrayIdx(x, y, gridSize.w),
					block = state.grid[idx];

				if (block !== -1) {
					if (state.playing || this._finishIdx > idx) {
						this._drawBlock(x, y, TETROMINO_TYPES[block].color, DEFAULT_OFFSET);
					} else {
						this._drawBlock(x, y, GRAY_COLOR, DEFAULT_OFFSET);
					}
				}
			}
		}

		if (state.playing && !state.removing) {
			let ghostPos = {
				x: state.falling.pos.x,
				y: state.falling.collisionPoint
			};

			this._drawTetromino(state.falling.type, ghostPos, [60, 60, 60], DEFAULT_OFFSET);
			this._drawTetromino(state.falling.type, state.falling.pos, state.falling.type.color, DEFAULT_OFFSET);
		}

		if (state.removing) {
			for (const removing of state.removing) {
				for (let x = 0; x < gridSize.w; x++) {
					const color: Color = state.removeCountdown % REMOVAL_FLASH_RATE < (REMOVAL_FLASH_RATE / 2) ? [255, 0, 0] : [0, 0, 0];
					this._drawBlock(x, removing, color, DEFAULT_OFFSET);
				}
			}
		}
	}

	_drawTetromino(type: TetrominoType, pos: IPoint, color: Color, offset: IPoint) {
		for (let y = 0; y < type.h; y++) {
			if (pos.y + y >= 0) {
				for (let x = 0; x < type.w; x++) {
					let idx = Util.getArrayIdx(x, y, type.w);
					if (type.data[idx] !== -1) {
						this._drawBlock(pos.x + x, pos.y + y, color, offset);
					}
				}
			}
		}
	}

	_drawBlock(x: number, y: number, color: Color, offset: IPoint) {
		const ctx = this._context,
			s = this._blockSize;

		ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
		ctx.strokeStyle = 'black';
		ctx.lineWidth = 1;

		ctx.beginPath();
		ctx.rect(x * s + offset.x, y * s + offset.y, s, s);
		ctx.fill();
		ctx.stroke();
	}
}