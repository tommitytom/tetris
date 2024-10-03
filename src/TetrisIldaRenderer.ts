import { DAC } from '@laser-dac/core';
import { HersheyFont, Line, loadHersheyFont, Rect, Scene } from '@laser-dac/draw';
//import { Helios } from '@laser-dac/helios';
import { Simulator } from '@laser-dac/simulator';
import Tetris from './Tetris';
import { Color, IPoint, TetrominoType } from './Types';
import * as Util from './Util';
import * as path from 'path';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const font = loadHersheyFont(path.resolve(__dirname, '../assets/futural.jhf'));

const DEFAULT_OFFSET = { x: 0, y: 0 };
const REMOVAL_FLASH_RATE = 0.2; // Lower values make the flashing faster
const FPS = 120;
const POINT_RATE = 30000;

enum Direction {
	Up = 0,
	Right = 1,
	Down = 2,
	Left = 3
}

function traceShape(w: number, h: number, grid: number[], xOffset: number): IPoint[]|null {
	function isOccupied(x: number, y: number): boolean {
		if (x < 0 || x >= w || y < 0 || y >= h) return false;
		return grid[y * w + x] !== -1;
	}

	function findStart(): IPoint|null {
		for (let x = xOffset; x < w; x++) {
			for (let y = h - 1; y >= 0; y--) {
				if (isOccupied(x, y)) {
					return { x, y };
				}
			}
		}

		return null;
	}

	const start: IPoint | null = findStart();
	if (start === null) {
		return null;
	}

	const points: IPoint[] = [ 
		{x: start.x, y: start.y}, 
		{x: start.x, y: start.y}, 
	];

	let dir = Direction.Up;
	let pos = { x: start.x, y: start.y };
	let count = 0;

	while (true) {
		switch (dir) {
			case Direction.Left: {
				if (isOccupied(pos.x - 1, pos.y)) {
					dir = Direction.Down;
					pos.y++;
					points.push({ x: pos.x, y: pos.y });
				} else if (!isOccupied(pos.x - 1, pos.y - 1)) {
					dir = Direction.Up;
					pos.y--;
					points.push({ x: pos.x, y: pos.y });
				} else {
					pos.x--;
					points[points.length - 1].x = pos.x;
				}
				
				break;
			}
			case Direction.Right: {
				if (isOccupied(pos.x, pos.y - 1)) {
					dir = Direction.Up;
					pos.y--;
					points.push({ x: pos.x, y: pos.y });
				} else if (!isOccupied(pos.x, pos.y)) {
					dir = Direction.Down;
					pos.y++;
					points.push({ x: pos.x, y: pos.y });
				} else {
					pos.x++;
					points[points.length - 1].x = pos.x;
				}
				
				break;
			}
			case Direction.Up: {
				if (isOccupied(pos.x - 1, pos.y - 1)) {
					dir = Direction.Left;
					pos.x--;
					points.push({ x: pos.x, y: pos.y });
				} else if (!isOccupied(pos.x, pos.y - 1)) {
					dir = Direction.Right;
					pos.x++;
					points.push({ x: pos.x, y: pos.y });
				} else {
					pos.y--;
					points[points.length - 1].y = pos.y;
				}
				
				break;
			}
			case Direction.Down: {
				if (isOccupied(pos.x, pos.y)) {
					dir = Direction.Right;
					pos.x++;
					points.push({ x: pos.x, y: pos.y });
				} else if (!isOccupied(pos.x - 1, pos.y)) {
					dir = Direction.Left;
					pos.x--;
					points.push({ x: pos.x, y: pos.y });
				} else {
					pos.y++;
					points[points.length - 1].y = pos.y;
				}
				
				break;
			}
		}

		if (pos.x === start.x && pos.y === start.y || count++ > 300) {
			break;
		}
	}

	return points;
}

class ScrollText {
	private _text: string;
	private _spacing: number = 0.2;
	private _charWidth: number = 0.04;
	private _fullWidth: number;
	private _position: number = 1;
	private _speed: number = 0.5;

	constructor(text: string) {
		this._text = text;
		this._fullWidth = this._text.length * this._spacing;
	}

	private getVisibleChars(): string {
		return this._text;//.substring(0, 3);
	}

	public render(dt: number): HersheyFont[] {
		const chars: HersheyFont[] = [];
		
		const visible = this.getVisibleChars();

		const amount = dt * this._speed;
		this._position -= amount;

		if (this._position < -this._fullWidth) {
			this._position = 1;
		}

		for (let i = 0; i < visible.length; i++) {
			chars.push(new HersheyFont({ 
				font,
				text: visible[i],
				x: this._position + i * this._spacing,
				y: 0.5,
				color: [1, 0, 0],
				charWidth: this._charWidth,
			}));
		}

		return chars;
	}
}

export default class TetrisIldaRenderer {
	private _scene: Scene;
	private _blockSize: number;
	private _gridSize: { w: number; h: number };
	private _showScore = false;
	private _scroller: ScrollText;
	private _dac: DAC;
	private _lastTime = 0;

	constructor(w, h) {
		this._gridSize = { w: w, h: h };
		this._blockSize = 1 / h;
		this._dac = new DAC();
 		this._dac.use(new Simulator());
		//this._dac.use(new Helios());

		this._scene = new Scene({});
		this._scroller = new ScrollText('TETRIS IS COOL');
	}

	get showScore() {
		return this._showScore;
	}

	set showScore(value) {
		this._showScore = value;
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
			
			tetris.update(dt); 

			this.render(tetris, dt); 
		}, FPS);
		
		this._dac.stream(this._scene, POINT_RATE, FPS);
	}
/*
	private renderStartScreen() {
		this._scene.add(new HersheyFont({ 
			font,
			text: 'TETRIS',
			x: 0.3,
			y: 0.5,
			color: [1, 0, 0],
			charWidth: 0.04,
		}));

		this._scene.add(new HersheyFont({ 
			font,
			text: 'Press start to play',
			x: 0.2,
			y: 0.4,
			color: [1, 0, 0],
			charWidth: 0.02,
		}));
	}
*/
	private renderGameOver(dt: number) {
		const chars = this._scroller.render(dt);
		for (const char of chars) {
			this._scene.add(char);
		}
	}

	private render(tetris: Tetris, dt: number) {
		//this._scene.add(new Rect({ x: 0, y: 0, width: tetris.size.w * this._blockSize, height: tetris.size.h * this._blockSize, color: [1, 0, 0] }));

		if (!tetris.state.playing) {
			this.renderGameOver(dt);
			//this.renderStartScreen();
			return;
		}

		this.drawStack(tetris);

		if (tetris.state.removeCountdown > 0) {
			this.drawRemoving(tetris);
		} else if (tetris.state.playing) {
			//this._drawTetrominoBlocks(tetris.state.falling.type, tetris.state.falling.pos, tetris.state.falling.type.color, DEFAULT_OFFSET);
			this.drawTetrominoOutline(tetris.state.falling.type, tetris.state.falling.pos, tetris.state.falling.type.color, DEFAULT_OFFSET);
		}

		// TODO: Only draw score when it has changed? How long for? Glow in the dark PLA?!
		if (this._showScore) {
			this._scene.add(new HersheyFont({ 
				font,
				text: tetris.state.score.toString(),
				x: 0.6,
				y: 0.5,
				color: [1, 0, 0],
				charWidth: 0.04,
			}));
		}
	}

	private drawStack(tetris: Tetris) {
		const bottom = tetris.size.h - 1;

		for (let x = 0; x < tetris.size.w;) {
			const idx = Util.getArrayIdx(x, bottom, tetris.size.w);
			const occupied = tetris.state.grid[idx] !== -1;

			if (occupied) {
				const shape: IPoint[] = traceShape(tetris.size.w, tetris.size.h, tetris.state.grid, x);
				if (shape === null) {
					console.log('NOT FOUND');
					return;
				}

				this.drawLines(shape, [1,1,1], DEFAULT_OFFSET);
				const maxX = shape.reduce((acc, p) => Math.max(acc, p.x), 0);

				if (maxX === x) {
					x++;
				} else {
					x = maxX;
				}
			} else {
				x++;
			}
		}
	}

	private drawRemoving(tetris: Tetris) {
		const flash = (tetris.state.removeCountdown % REMOVAL_FLASH_RATE) < (REMOVAL_FLASH_RATE / 2);
		if (!flash) {
			return;
		}

		const groups: Array<{ start: number; size: number; }> = [];

		let start = tetris.state.removing[0];
		let current = start;

		for (let i = 1; i < tetris.state.removing.length; i++) {
			const row = tetris.state.removing[i];
			if (row !== current + 1) {
				groups.push({ start, size: current - start + 1 });
				start = row;
			}

			current = row;
		}

		groups.push({ start, size: current - start + 1 });

		for (const group of groups) {
			this._scene.add(new Rect({ x: 0, y: group.start * this._blockSize, width: tetris.size.w * this._blockSize, height: group.size * this._blockSize, color: [1, 0, 0] }));
		}
	}

	private drawTetrominoOutline(type: TetrominoType, pos: IPoint, color: Color, offset: IPoint) {
		const outline = traceShape(type.w, type.h, type.data, 0);
		for (const line of outline) {
			line.x += pos.x;
			line.y += pos.y;
		}

		this.drawLines(outline, color, offset);
	}

	private drawLines(points: IPoint[], color: Color, offset: IPoint) {
		const bs = this._blockSize;
		for (let i = 0; i < points.length - 1; i++) {
			const line = points[i];
			const next = points[i + 1];

			this._scene.add(new Line({ 
				from: { 
					x: line.x * bs + offset.x, 
					y: line.y * bs + offset.y 
				}, 
				to: { 
					x: next.x * bs + offset.x,
					y: next.y * bs + offset.y
				}, 
				color,
				blankBefore: i === 0}
			));
		}
	}
/*
	private drawBlock(x: number, y: number, color: Color, offset: IPoint) {
		const s = this._blockSize;
		this._scene.add(new Rect({ x: x * s + offset.x, y: y * s + offset.y, width: s, height: s, color }));
	}
*/
}
