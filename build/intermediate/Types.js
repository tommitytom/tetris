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