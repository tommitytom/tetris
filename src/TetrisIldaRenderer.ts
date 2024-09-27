import { DAC } from '@laser-dac/core';
import { Simulator } from '@laser-dac/simulator';
import { Helios } from '@laser-dac/helios';
import { Scene, Rect, Path, Line } from '@laser-dac/draw';
import * as Util from './Util';
import Tetris from './Tetris';
import { Color, GRAY_COLOR, TETROMINO_TYPES } from './Types';
import { Point } from '@laser-dac/draw/dist/Point';

interface IPoint {
	x: number;
	y: number;
}

interface ILine {
	from: IPoint;
	to: IPoint;
}

const PLAY_AREA_BORDER = 1;
const DEFAULT_OFFSET = { x: 0, y: 0 };

export default class TetrisIldaRenderer {
	private _dac: DAC;
	private _scene: Scene;
	private _blockSize: number;
	private _gridLength: number;
	private _finishIdx: number;
	private _aspect: number;
	private _gridSize: { w: number; h: number };
	private _lastTime: number;

	constructor(w, h) {
		this._gridSize = { w: w, h: h };
		this._gridLength = w * h;
		this._blockSize = 1 / h;
		this._finishIdx = -1;

		this._aspect = w / h;

		//this._canvas.width = w * this._blockSize + 300;
		//this._canvas.height = h * this._blockSize + PLAY_AREA_BORDER * 2;

		this._dac = new DAC();
 		this._dac.use(new Simulator());
		this._dac.use(new Helios());

		this._scene = new Scene({
			//resolution: 70,
		});

		this._lastTime = 0;
	}

	get gridSize() {
		return this._gridSize;
	}

	public async start(tetris: Tetris) {
		await this._dac.start();
		
		this._scene.start(() => {
			const time = performance.now();
			let dt = this._lastTime !== 0 ? (performance.now() - this._lastTime) / 1000 : 0;
			this._lastTime = time;		
			
			//console.log(dt);
			

			tetris.update(dt); 
			this.render(tetris); 
		}, 30);
		this._dac.stream(this._scene);
	}

	render(tetris: Tetris) {
		/*ctx.fillStyle = 'black';
		ctx.fillRect(0, 0, canvas.width, canvas.height);

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
		}*/

		this._scene.add(new Rect({ x: 0, y: 0, width: tetris.size.w * this._blockSize, height: tetris.size.h * this._blockSize, color: [1, 0, 0] }));

		const stackLines: ILine[] = [];

		const height = tetris.size.h;
		let last: number = height;

		for (let x = 0; x < tetris.size.w; ++x) {
			let found: number = height;

			for (let y = 0; y < tetris.size.h; y++) {
				const idx = Util.getArrayIdx(x, y, tetris.size.w);
				if (tetris.state.grid[idx] !== -1) {
					found = y;
					break;
				}
			}

			if (found !== height) {
				// Collumn is not empty
				if (found === last) {
					// Extend last					
					stackLines[stackLines.length - 1].to.x += this._blockSize;
				} else {
					
					
					stackLines.push({ from: { x: x * this._blockSize, y: last * this._blockSize }, to: { x: x * this._blockSize, y: found * this._blockSize } });
					stackLines.push({ from: { x: x * this._blockSize, y: found * this._blockSize }, to: { x: (x + 1) * this._blockSize, y: found * this._blockSize } });
				}
			} else {
				if (last !== height) {
					// Draw a line from last to the bottom
					stackLines.push({ from: { x: x * this._blockSize, y: last * this._blockSize }, to: { x: x * this._blockSize, y: tetris.size.h * this._blockSize } });
				}
			}

			last = found;
		}

		if (last !== height) {
			const x = tetris.size.w;
			stackLines.push({ from: { x: x * this._blockSize, y: last * this._blockSize }, to: { x: x * this._blockSize, y: tetris.size.h * this._blockSize } });
		}

		for (let i = 0; i < stackLines.length; i++) {
			const line = stackLines[i];
			this._scene.add(new Line({ from: line.from, to: line.to, color: [1,1,1], blankBefore: i === 0 }));
		}

		if (tetris.state.playing) {
			this._drawTetromino(tetris.state.falling.type, tetris.state.falling.pos, tetris.state.falling.type.color, DEFAULT_OFFSET);
		}
	}

	_drawTetromino(type, pos, color, offset) {
		for (let y = 0; y < type.h; y++) {
			if (pos.y + y >= 0) {
				for (let x = 0; x < type.w; x++) {
					let idx = Util.getArrayIdx(x, y, type.w);
					if (type.data[idx] !== 0) {
						this._drawBlock(pos.x + x, pos.y + y, color, offset);
					}
				}
			}
		}
	}

	_drawBlock(x, y, color: Color, offset) {
		const s = this._blockSize;
		this._scene.add(new Rect({ x: x * s + offset.x, y: y * s + offset.y, width: s, height: s, color }));
	}
}
