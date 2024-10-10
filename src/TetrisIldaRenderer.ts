import { DAC } from '@laser-dac/core';
import { HersheyFont, Line, loadHersheyFont, Rect, Scene } from '@laser-dac/draw';
import { Helios } from '@laser-dac/helios';
import { Simulator } from '@laser-dac/simulator';
import Tetris from './Tetris';
import { Color, IPoint, TetrominoType } from './Types';
import * as Util from './Util';
import * as path from 'path';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const font = loadHersheyFont(path.resolve(__dirname, '../assets/futural2.jhf'));

const DEFAULT_OFFSET = { x: 0, y: 0 };
const REMOVAL_FLASH_RATE = 0.2; // Lower values make the flashing faster
const FPS = 120;
const POINT_RATE = 30000;
const STACK_COLOR: Color = [1, 1, 1];
const GRID_SCALE = 0.5;

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

function traceShape(w: number, h: number, grid: number[], xOffset: number, yOffset: number, filter: (value: number) => boolean, max: number): IPoint[]|null {
	function isValid(x: number, y: number): boolean {
		if (x < 0 || x >= w || y < 0 || y >= h) return false;
		return filter(grid[y * w + x]);
	}

	function findStart(): IPoint|null {
		for (let x = xOffset; x < w; x++) {
			for (let y = yOffset; y >= 0; y--) {
				if (isValid(x, y)) {
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
				const leftOccupied = isValid(pos.x - 1, pos.y);
				const topLeftOccupied = isValid(pos.x - 1, pos.y - 1);

				if (leftOccupied) {
					dir = Direction.Down;
					pos.y++;
					points.push({ x: pos.x, y: pos.y });
				} else if (!topLeftOccupied) {
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
				const aboveOccupied = isValid(pos.x, pos.y - 1);
				const thisOccupied = isValid(pos.x, pos.y);

				if (aboveOccupied) {
					dir = Direction.Up;
					pos.y--;
					points.push({ x: pos.x, y: pos.y });
				} else if (!thisOccupied) {
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
				const topLeftOccupied = isValid(pos.x - 1, pos.y - 1);
				const aboveOccupied = isValid(pos.x, pos.y - 1);

				if (topLeftOccupied) {
					dir = Direction.Left;
					pos.x--;
					points.push({ x: pos.x, y: pos.y });
				} else if (!aboveOccupied) {
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
				const thisOccupied = isValid(pos.x, pos.y);
				const leftOccupied = isValid(pos.x - 1, pos.y);

				if (thisOccupied) {
					dir = Direction.Right;
					pos.x++;
					points.push({ x: pos.x, y: pos.y });
				} else if (!leftOccupied) {
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

		if (pos.x === start.x && pos.y === start.y || count++ > max) {
			if (count > max) {
				console.log('OVER');
			}
			break;
		}
	}

	// Remove duplicates
	for (let i = 0; i < points.length - 1; i++) {
		const point = points[i];
		const next = points[i + 1];

		if (point.x === next.x && point.y === next.y) {
			points.splice(i, 1);
			i--;
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
	private _score = 0;

	private _state: IGameState;
	private _stackGroups: Array<IPoint[]> = [];

	constructor(w, h) {
		this._gridSize = { w: w, h: h };
		this._blockSize = (1 / h) * GRID_SCALE;
		this._dac = new DAC();
 		this._dac.use(new Simulator());
		this._dac.use(new Helios());

		this._scene = new Scene();
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
		tetris.on('death', (score: number) => { this._score = score; });
		tetris.on('begin', () => { this._stackGroups = []; this._score = 0; });
		tetris.on('land', () => { this.updateStackGroups(tetris); });
		tetris.on('removeBegin', () => { this.updateStackGroups(tetris); });
		tetris.on('removeComplete', () => { this.updateStackGroups(tetris); });

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
		this._scene.add(new HersheyFont({
			font,
			text: 'GREETS',
			x: 0.25 * GRID_SCALE,
			y: 0.2 * GRID_SCALE,
			color: [1, 0, 0],
			charWidth: 0.04 * GRID_SCALE,
		}));

		const chars = this._scroller.render(dt);
		for (const char of chars) {
			this._scene.add(char);
		}
	}

	private renderGame(tetris: Tetris, dt: number) {
		this.drawStack();

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
			x: 0.3 * GRID_SCALE,
			y: 0.5 * GRID_SCALE,
			color: [1, 0, 0],
			charWidth: 0.04 * GRID_SCALE,
		}));

		this._scene.add(new HersheyFont({ 
			font,
			text: 'Press enter to play',
			x: 0.2 * GRID_SCALE,
			y: 0.4 * GRID_SCALE,
			color: [1, 0, 0],
			charWidth: 0.02 * GRID_SCALE,
		}));
	}
	
	private renderGameOver(tetris: Tetris, dt: number) {
		const SHRINK_DURATION = 0.65;
		const GAME_OVER_DURATION = 3.5;
		const SCORE_DURATION = 4.0;

		function isHorizontal(point1: IPoint, point2: IPoint): boolean {
			return point1.x === point2.x;
		}

		if (this._state.stageTime < SHRINK_DURATION) {
			const topFrac = (this._state.stageTime / SHRINK_DURATION) * 0.5;
			const bottomFrac = 1 - topFrac;

			const topY = tetris.size.h * topFrac;
			const bottomY = tetris.size.h * bottomFrac;

			for (const group of this._stackGroups) {
				for (let i = 0; i < group.length - 1; i++) {
					const point1 = group[i];
					const point2 = group[i + 1];

					if (point1.y < topY) {
						point1.y = topY;
					}

					if (point2.y < topY) {
						point2.y = topY;
					}

					if (point1.y > bottomY) {
						point1.y = bottomY;
					}

					if (point2.y > bottomY) {
						point2.y = bottomY;
					}
				}
			}

			this.drawStack();

			this._scene.add(new Line({ from: { x: 0, y: topFrac }, to: { x: 1, y: topFrac }, color: [1, 0, 0], blankBefore: true }));
			this._scene.add(new Line({ from: { x: 0, y: bottomFrac }, to: { x: 1, y: bottomFrac }, color: [1, 0, 0], blankBefore: true }));
		
		} else if (this._state.stageTime < GAME_OVER_DURATION) {
			this._stackGroups = [];

			this._scene.add(new HersheyFont({ 
				font,
				text: 'GAME OVER',
				x: 0.15,
				y: 0.5,
				color: [1, 0, 0],
				charWidth: 0.04,
			}));
		} else {
			this._scene.add(new HersheyFont({ 
				font,
				text: 'SCORE',
				x: 0.3,
				y: 0.25,
				color: [1, 0, 0],
				charWidth: 0.04,
			}));

			this._scene.add(new HersheyFont({ 
				font,
				text: this._score.toString(),
				x: 0.3,
				y: 0.6,
				color: [1, 0, 0],
				charWidth: 0.04,
			}));
		}

		if (this._state.stageTime > GAME_OVER_DURATION + SHRINK_DURATION + SCORE_DURATION) {
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
				this.renderGameOver(tetris, dt);
				break;
			}
			case GameStage.Greets: {
				this.renderGreets(dt);
				break;
			}
		}

		this._state.stageTime += dt;
	}

	private updateStackGroups(tetris: Tetris) {
		this._stackGroups = [];

		const bottom = tetris.size.h - 1;
		const w = tetris.size.w;
		const h = tetris.size.h;
		const grid = tetris.state.grid;
		let lastOccupied = false;

		for (let x = 0; x < tetris.size.w; x++) {
			const idx = Util.getArrayIdx(x, bottom, tetris.size.w);
			const occupied = tetris.state.grid[idx] !== -1;

			if (occupied) {
				if (lastOccupied) {
					continue;
				}

				const shape: IPoint[] = traceShape(w, h, grid, x, bottom, (value) => value !== -1, 300);
				if (shape === null) {
					console.log('NOT FOUND');
					continue;
				}

				this._stackGroups.push(shape);
				lastOccupied = true;
			} else {
				lastOccupied = false;
			}
		}

		const knownExternal = new Set<number>();

		function getEnclosed(x: number, y: number): Set<number> {
			const visited = new Set<number>();
			const stack: IPoint[] = [{x, y}];

			while (stack.length > 0) {
				const coord = stack.pop();
				const idx = Util.getArrayIdx(coord.x, coord.y, w);

				if (knownExternal.has(idx)) {
					return null;
				}

				if (coord.x < 0 || coord.x >= w || coord.y < 0 || coord.y >= h) {
					for (const v of visited) { knownExternal.add(v); }
					return null;
				}

				if (tetris.isIndexOccupied(idx) || visited.has(idx)) {
					continue;
				}

				stack.push({ x: coord.x - 1, y: coord.y });
				stack.push({ x: coord.x + 1, y: coord.y });
				stack.push({ x: coord.x, y: coord.y - 1 });
				stack.push({ x: coord.x, y: coord.y + 1 });

				visited.add(idx);
			}

			return visited;
		}

		const knownEnclosed = new Set<number>();
		for (let y = tetris.size.h - 1; y >= 0; y--) {
			for (let x = 0; x < tetris.size.w; x++) {
				if (!tetris.isOccupied(x, y) && !knownEnclosed.has(Util.getArrayIdx(x, y, w))) {
					const enclosed = getEnclosed(x, y);
					if (enclosed && enclosed.size > 0) {
						// Get bounds of enclosed area
						const area = { left: 999999, right: -999999, top: 999999, bottom: -999999 };

						for (const v of enclosed) {
							const pos = Util.getXY(v, w);
							area.left = Math.min(area.left, pos.x);
							area.right = Math.max(area.right, pos.x);
							area.top = Math.min(area.top, pos.y);
							area.bottom = Math.max(area.bottom, pos.y);
						}

						const areaWidth = area.right - area.left + 1;
						const areaHeight = area.bottom - area.top + 1;						
						const enclosedGrid: number[] = new Array(areaWidth * areaHeight).fill(-1);

						for (const v of enclosed) {
							const pos = Util.getXY(v, w);
							const enclosedIdx = Util.getArrayIdx(pos.x - area.left, pos.y - area.top, areaWidth);
							enclosedGrid[enclosedIdx] = 1;
						}

						const shape: IPoint[] = traceShape(areaWidth, areaHeight, enclosedGrid, 0, areaHeight - 1, (value) => value !== -1, 75);
						if (shape === null) {
							console.log('NOT FOUND');
							return;
						}

						for (const point of shape) {
							point.x += area.left;
							point.y += area.top;
						}

						for (const v of enclosed) { 
							knownEnclosed.add(v); 
						}

						this._stackGroups.push(shape);
					}
				}
			}
		}
	}

	private drawStack() {
		for (const group of this._stackGroups) {
			this.drawLines(group, STACK_COLOR, DEFAULT_OFFSET);
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
		const outline = traceShape(type.w, type.h, type.data, 0, type.h - 1, (value) => value !== -1, 50);
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
