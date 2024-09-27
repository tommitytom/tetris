export type Color = [number, number, number];

export interface IPoint {
	x: number;
	y: number;
}

export interface ILine {
	from: IPoint;
	to: IPoint;
}

// Function to convert hex color to RGB array
function hexToRgb(hex: string): Color {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return [r, g, b];
}

export const COLORS: Color[] = [
    [255, 255, 0], // yellow
    [0, 128, 0], // green
    [255, 0, 0], // red
    [0, 0, 255], // blue
    [128, 0, 128], // purple
    [255, 165, 0], // orange
    hexToRgb('#ff00bf') // pink    
];

export const GRAY_COLOR: Color = [128, 128, 128];

export interface TetrominoType {
	w: number;
	h: number;
	color: Color;
	data: number[];
    outline: IPoint[];
}

export const TETROMINO_TYPES : TetrominoType[]= [
    {
        w: 2, h: 2,
        color: [255, 255, 0], // yellow
        data: [
            1, 1,
            1, 1
        ],
        outline: [
            { x: 0, y: 0},
            { x: 2, y: 0 },
            { x: 2, y: 2 },
            { x: 0, y: 2 },
            { x: 0, y: 0},
        ]
    },
    {
        w: 3, h: 2,
        color: [0, 128, 0], // green
        data: [
            0, 1, 0,
            1, 1, 1
        ],
        outline: [
            { x: 0, y: 2},
            { x: 0, y: 1 },
            { x: 1, y: 1 },
            { x: 1, y: 0 },
            { x: 2, y: 0 },
            { x: 2, y: 1 },
            { x: 3, y: 1 },
            { x: 3, y: 2 },
            { x: 0, y: 2 },
        ]
    },
    {
        w: 3, h: 2,
        color: [255, 0, 0], // red
        data: [
            1, 1, 0,
            0, 1, 1
        ],
        outline: [
            { x: 0, y: 0},
            { x: 2, y: 0 },
            { x: 2, y: 1 },
            { x: 3, y: 1 },
            { x: 3, y: 2 },
            { x: 1, y: 2 },
            { x: 1, y: 1 },
            { x: 0, y: 1 },
            { x: 0, y: 0 },
        ]
    },
    {
        w: 3, h: 2,
        color: [0, 0, 255], // blue
        data: [
            0, 1, 1,
            1, 1, 0
        ],
        outline: [
            { x: 0, y: 2},
            { x: 0, y: 1 },
            { x: 1, y: 1 },
            { x: 1, y: 0 },
            { x: 3, y: 0 },
            { x: 3, y: 1 },
            { x: 2, y: 1 },
            { x: 2, y: 2 },
            { x: 0, y: 2 },
        ]
    },
    {
        w: 2, h: 3,
        color: [128, 0, 128], // purple
        data: [
            1, 1,
            1, 0,
            1, 0,
        ],
        outline: [
            { x: 0, y: 0},
            { x: 2, y: 0 },
            { x: 2, y: 1 },
            { x: 1, y: 1 },
            { x: 1, y: 3 },
            { x: 0, y: 3 },
            { x: 0, y: 0 },
        ]
    },
    {
        w: 2, h: 3,
        color: [255, 165, 0], // orange
        data: [
            1, 1,
            0, 1,
            0, 1,
        ],
        outline: [
            { x: 0, y: 0},
            { x: 2, y: 0 },
            { x: 2, y: 3 },
            { x: 1, y: 3 },
            { x: 1, y: 1 },
            { x: 0, y: 1 },
            { x: 0, y: 0 },
        ]
    },
    {
        w: 1, h: 4,
        color: hexToRgb('#ff00bf'), // #ff00bf
        data: [
            1,
            1,
            1,
            1
        ],
        outline: [
            { x: 0, y: 0},
            { x: 1, y: 0 },
            { x: 1, y: 4 },
            { x: 0, y: 4 },
            { x: 0, y: 0 },
        ]
    }
];
