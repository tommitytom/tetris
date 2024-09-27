import { DAC } from '@laser-dac/core';
import { Simulator } from '@laser-dac/simulator';
import { Helios } from '@laser-dac/helios';
import { Scene, Rect, Path, Line } from '@laser-dac/draw';
import * as Util from './Util';
import Tetris, { Size } from './Tetris';
import { ILine, Color, GRAY_COLOR, TETROMINO_TYPES, IPoint, TetrominoType } from './Types';
import { Point } from '@laser-dac/draw/dist/Point';

const PLAY_AREA_BORDER = 1;
const DEFAULT_OFFSET = { x: 0, y: 0 };

enum Direction {
	Up = 0,
	Right = 1,
	Down = 2,
	Left = 3
}



function generateTetrominoOutline(tetromino: TetrominoType): IPoint[] {
    const { w, h, data } = tetromino;
    const outline: IPoint[] = [];
    const directions = [
        { dx: 0, dy: -1 }, // up
        { dx: 1, dy: 0 },  // right
        { dx: 0, dy: 1 },  // down
        { dx: -1, dy: 0 }  // left
    ];

    function isOccupied(x: number, y: number): boolean {
        if (x < 0 || x >= w || y < 0 || y >= h) return false;
        return data[y * w + x] === 1;
    }

    function trace(startX: number, startY: number): void {
        let x = startX;
        let y = startY;
        let dir = 0;

        do {
            outline.push({ x, y });

            // Look for the next unoccupied cell
            for (let i = 0; i < 4; i++) {
                const nextDir = (dir + i) % 4;
                const nx = x + directions[nextDir].dx;
                const ny = y + directions[nextDir].dy;

                if (!isOccupied(nx, ny)) {
                    x = nx;
                    y = ny;
                    dir = (nextDir + 1) % 4;
                    break;
                }
            }
        } while (x !== startX || y !== startY);
    }

    // Find the starting point (first occupied cell)
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            if (isOccupied(x, y)) {
                trace(x, y + 1);
                return outline;
            }
        }
    }

    return outline;
}

function generateBasic(tetris: Tetris, bs: number): ILine[] {
	const lines: ILine[] = [];

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
				lines[lines.length - 1].to.x += bs;
			} else {
				lines.push({ from: { x: x * bs, y: last * bs }, to: { x: x * bs, y: found * bs } });
				lines.push({ from: { x: x * bs, y: found * bs }, to: { x: (x + 1) * bs, y: found * bs } });
			}
		} else {
			if (last !== height) {
				// Draw a line from last to the bottom
				lines.push({ from: { x: x * bs, y: last * bs }, to: { x: x * bs, y: tetris.size.h * bs } });
			}
		}

		last = found;
	}

	if (last !== height) {
		const x = tetris.size.w;
		lines.push({ from: { x: x * bs, y: last * bs }, to: { x: x * bs, y: tetris.size.h * bs } });
	}

	return lines;
}

function traceShape(type: TetrominoType) {
	//type.
}

function generateSlow(tetris: Tetris, bs: number): ILine[] {
	return generateSlowGrid(tetris.size, tetris.state.grid, bs);
}

function generateSlowGrid(size: Size, grid: number[], bs: number): ILine[] {
	const lines: ILine[] = [];

	const height = size.h;
	const width = size.w;

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const idx = Util.getArrayIdx(x, y, size.w);
			if (grid[idx] !== -1) {
				// Check top
				const top = Util.getArrayIdx(x, y - 1, size.w);
				if (y === 0 || grid[top] === -1) {
					lines.push({ from: { x: x * bs, y: y * bs }, to: { x: (x + 1) * bs, y: y * bs }});
				}
				
				// Check bottom
				const bottom = Util.getArrayIdx(x, y + 1, size.w);
				if (y === height - 1 || grid[bottom] === -1) {
					lines.push({ from: { x: x * bs, y: (y + 1) * bs}, to: { x: (x + 1) * bs, y: (y + 1) * bs}});
				}
				
				// Check left
				const left = Util.getArrayIdx(x - 1, y, size.w);
				if (x === 0 || grid[left] === -1) {
					lines.push({ from: { x: x * bs, y: y * bs}, to: { x: x * bs, y: (y + 1) * bs}});
				}
				
				// Check right
				const right = Util.getArrayIdx(x + 1, y, size.w);
				if (x === width - 1 || grid[right] === -1) {
					lines.push({ from: { x: (x + 1) * bs, y: y * bs}, to: { x: (x + 1) * bs, y: (y + 1) * bs}});
				}
			}
		}
	}

	return lines;
}

function generateOutline(tetris: Tetris, bs: number): ILine[] {
	return generateOutlineGrid(tetris.size, tetris.state.grid, bs);
}

function generateOutlineGrid(size: Size, grid: number[], bs: number): ILine[] {
    const height = size.h;
	const width = size.w;
    const horizontalLines: ILine[] = [];
    const verticalLines: ILine[] = [];

    // Generate horizontal lines
    for (let y = 0; y <= height; y++) {
        let start: IPoint | null = null;
        for (let x = 0; x <= width; x++) {
			const bottom = Util.getArrayIdx(x, y, size.w);
			const top = Util.getArrayIdx(x, y - 1, size.w);
            const topCell = y > 0 ? grid[top] : 0;
            const bottomCell = y < height ? grid[bottom] : 0;
            if (topCell !== bottomCell) {
                if (start === null) {
                    start = {x: x * bs, y: y * bs};
                }
            } else if (start !== null) {
                horizontalLines.push({ from: start, to: { x: x * bs, y: y * bs}});
                start = null;
            }
        }
        if (start !== null) {
            horizontalLines.push({ from: start, to: { x: width * bs, y: y * bs}});
        }
    }

    // Generate vertical lines
    for (let x = 0; x <= width; x++) {
        let start: IPoint | null = null;
        for (let y = 0; y <= height; y++) {
			const left = Util.getArrayIdx(x - 1, y, size.w);
			const right = Util.getArrayIdx(x, y, size.w);

            const leftCell = x > 0 ? grid[left] : 0;
            const rightCell = x < width ? grid[right] : 0;
            if (leftCell !== rightCell) {
                if (start === null) {
                    start = {x: x * bs, y: y * bs};
                }
            } else if (start !== null) {
                verticalLines.push({ from: start, to: { x: x * bs, y: y * bs}});
                start = null;
            }
        }
        if (start !== null) {
            verticalLines.push({ from: start, to: { x: x * bs, y: height * bs}});
        }
    }

    return [...horizontalLines, ...verticalLines];
}

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
		});
		this._dac.stream(this._scene, 15000, 60);
	}

	render(tetris: Tetris) {
		//this._scene.add(new Rect({ x: 0, y: 0, width: tetris.size.w * this._blockSize, height: tetris.size.h * this._blockSize, color: [1, 0, 0] }));

		const stackLines: ILine[] = generateBasic(tetris, this._blockSize);
		//const stackLines: ILine[] = generateSlow(tetris, this._blockSize);
		//const stackLines: ILine[] = generateOutline(tetris, this._blockSize);

		for (let i = 0; i < stackLines.length; i++) {
			const line = stackLines[i];
			this._scene.add(new Line({ from: line.from, to: line.to, color: [1,1,1], blankBefore: i === 0}));
		}

		if (tetris.state.removeCountdown > 0) {
			this._drawRemoving(tetris);
		} else if (tetris.state.playing) {
			this._drawTetrominoBlocks(tetris.state.falling.type, tetris.state.falling.pos, tetris.state.falling.type.color, DEFAULT_OFFSET);
			//this._drawTetrominoOutline(tetris.state.falling.type, tetris.state.falling.pos, tetris.state.falling.type.color, DEFAULT_OFFSET);
		}
	}

	_drawRemoving(tetris: Tetris) {
		for (const row of tetris.state.removing) {
			this._scene.add(new Rect({ x: 0, y: row * this._blockSize, width: tetris.size.w * this._blockSize, height: this._blockSize, color: [1, 0, 0] }));
		}
	}

	_drawTetrominoOutline(type: TetrominoType, pos: IPoint, color: Color, offset: IPoint) {
		const s = this._blockSize;

		const outline = generateTetrominoOutline(type);
		//console.log('test', outline);
		

		for (const line of outline) {
			//this._scene.add(new Line({ from: { x: line.from.x + offset.x, y: line.from.y + offset.y }, to: { x: line.to.x + offset.x, y: line.to.y + offset.y }, color }));
		}

		for (let i = 0; i < outline.length - 1; i++) {
			const line = outline[i];
			const next = outline[i + 1];

			this._scene.add(new Line({ 
				from: { 
					x: ((line.x + pos.x) * s) + offset.x, 
					y: ((line.y + pos.y) * s) + offset.y 
				}, 
				to: { 
					x: ((next.x + pos.x) * s) + offset.x,
					y: ((next.y + pos.y) * s) + offset.y
				}, 
				color,
				blankBefore: i === 0}
			));
		}
	}

	_drawTetrominoBlocks(type: TetrominoType, pos: IPoint, color: Color, offset: IPoint) {
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

	_drawBlock(x: number, y: number, color: Color, offset: IPoint) {
		const s = this._blockSize;
		this._scene.add(new Rect({ x: x * s + offset.x, y: y * s + offset.y, width: s, height: s, color }));
	}
}
