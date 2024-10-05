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

export enum GameStage {
	StartScreen,
	Playing,
	GameOver,
	Greets
}

export interface IGameState {
	stage: GameStage;
	stageTime: number;
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

const GREETS: string[] = [
	"CHICKEN",
	"CATCHINASHES",
	"PELRUN",
	"ATOMICSEED",
	"RIPT",
	"GAIA",
	"KRION",
	"DOK",
	"JIMAGE",
	"sh0CK",
	"JAZZCAT",
	"STYLE",
	"0F.DIGITAL",
	"iLKke",
	"ANIMAL BRO"
];

export function hslToRgb(h: number, s: number, l: number): Color {
	let r, g, b;

	function hue2rgb(p: number, q: number, t: number) {
		if (t < 0) t += 1;
		if (t > 1) t -= 1;
		if (t < 1/6) return p + (q - p) * 6 * t;
		if (t < 1/2) return q;
		if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
		return p;
	}

	if (s === 0) {
		r = g = b = l; // achromatic
	} else {
		const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		const p = 2 * l - q;

		r = hue2rgb(p, q, h + 1/3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1/3);
	}

	return [r, g, b];
}


class ScrollText {
	private _text: string;
	private _spacing: number = 0.2;
	private _charWidth: number = 0.04;
	private _fullWidth: number;
	private _position: number = 1;
	private _speed: number = 1;
	private _phase: number = 0;
	private _loop: boolean = true;
	private _finished: boolean = false;

	constructor(text: string, loop: boolean = true) {
		this._text = text;
		this._fullWidth = this._text.length * this._spacing;
		this._loop = loop;
	}

	public get finished() {
		return this._finished;
	}

	public reset() {
		this._position = 1;
		this._finished = false;
	}

	public render(dt: number): HersheyFont[] {
		const chars: HersheyFont[] = [];
		
		if (this._finished) {
			return chars;
		}

		const amount = dt * this._speed;
		this._position -= amount;

		if (this._position < -this._fullWidth) {
			if (this._loop) {
				this._position = 1;
			} else {
				this._finished = true;
			}
		}

		for (let i = 0; i < this._text.length; i++) {
			const xPos = this._position + i * this._spacing;

			if (xPos > -this._spacing && xPos < 1) {
				const col = hslToRgb(xPos, 1, 0.5);
				const phase = xPos * Math.PI * 2;
				const yPos = 0.5 + Math.sin(phase + this._phase) * 0.1;

				chars.push(new HersheyFont({ 
					font,
					text: this._text[i],
					x: this._position + i * this._spacing,
					y: yPos,
					color: col,
					charWidth: this._charWidth,
				}));
			}
		}

		return chars;
	}
}

class ScrollTextGroup {
	private _texts: ScrollText[] = [];
	private _current: number = 0;
	private _finished: boolean = false;
	private _loop: boolean = true;

	constructor(loop: boolean = true) {
		this._loop = loop;
	}

	public reset() {
		this._current = 0;
		this._finished = false;
		for (const text of this._texts) {
			text.reset();
		}
	}

	public add(text: string) {
		this._texts.push(new ScrollText(text, false));
	}

	public render(dt: number): HersheyFont[] {
		const chars: HersheyFont[] = [];

		if (this._finished) {
			return chars;
		}

		const current = this._texts[this._current];
		const rendered = current.render(dt);
		for (const char of rendered) {
			chars.push(char);
		}

		if (current.finished) {
			current.reset();
			this._current++;
			if (this._current >= this._texts.length) {
				if (this._loop) {
					this._current = 0;
				} else {
					this._finished = true;
				}
			}
		}

		return chars;
	}
}

export default class TetrisIldaRenderer {
	private _scene: Scene;
	private _blockSize: number;
	private _gridSize: { w: number; h: number };
	private _showScore = false;
	private _scroller: ScrollTextGroup;
	private _dac: DAC;
	private _lastTime = 0;

	private _state: IGameState;

	constructor(w, h) {
		this._gridSize = { w: w, h: h };
		this._blockSize = 1 / h;
		this._dac = new DAC();
 		this._dac.use(new Simulator());
		//this._dac.use(new Helios());

		this._scene = new Scene({});
		this._scroller = new ScrollTextGroup();

		for (const greet of GREETS) {
			this._scroller.add(greet);
		}

		this._state = {
			stage: GameStage.StartScreen,
			stageTime: 0
		};
	}

	get state() {
		return this._state;
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

	private renderGreets(dt: number) {
		/*this._scene.add(new HersheyFont({
			font,
			text: 'GREETS',
			x: 0.3,
			y: 0.2,
			color: [1, 0, 0],
			charWidth: 0.04,
		}));*/

		const chars = this._scroller.render(dt);
		for (const char of chars) {
			this._scene.add(char);
		}
	}

	private renderGame(tetris: Tetris, dt: number) {
		this.drawStack(tetris);

		if (tetris.state.removeCountdown > 0) {
			this.drawRemoving(tetris);
		} else if (tetris.state.playing) {
			//this._drawTetrominoBlocks(tetris.state.falling.type, tetris.state.falling.pos, tetris.state.falling.type.color, DEFAULT_OFFSET);
			this.drawTetrominoOutline(tetris.state.falling.type, tetris.state.falling.pos, tetris.state.falling.type.color, DEFAULT_OFFSET);
		} else {
			this._state.stage = GameStage.GameOver;
			this._state.stageTime = 0;
			this._scroller.reset();
			tetris.reset();
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

	private renderStart(dt: number) {
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
			text: 'Press enter to play',
			x: 0.2,
			y: 0.4,
			color: [1, 0, 0],
			charWidth: 0.02,
		}));
	}
	
	private renderGameOver(dt: number) {
		this._scene.add(new HersheyFont({ 
			font,
			text: 'GAME OVER',
			x: 0.2,
			y: 0.5,
			color: [1, 0, 0],
			charWidth: 0.04,
		}));

		if (this._state.stageTime > 2) {
			this._state.stage = GameStage.Greets;
			this._state.stageTime = 0;
		}
	}

	private render(tetris: Tetris, dt: number) {
		//this._scene.add(new Rect({ x: 0, y: 0, width: tetris.size.w * this._blockSize, height: tetris.size.h * this._blockSize, color: [1, 0, 0] }));

		switch (this._state.stage) {
			case GameStage.StartScreen: {
				this.renderStart(dt);
				break;
			}
			case GameStage.Playing: {
				this.renderGame(tetris, dt);
				break;
			}
			case GameStage.GameOver: {
				this.renderGameOver(dt);
				break;
			}
			case GameStage.Greets: {
				this.renderGreets(dt);
				break;
			}
		}

		this._state.stageTime += dt;
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
