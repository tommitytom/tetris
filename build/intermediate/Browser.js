'use strict';

var _TetrisApp = require('./TetrisApp');

var _TetrisApp2 = _interopRequireDefault(_TetrisApp);

var _TetrisCanvasRenderer = require('./TetrisCanvasRenderer');

var _TetrisCanvasRenderer2 = _interopRequireDefault(_TetrisCanvasRenderer);

var _KeyboardController = require('./KeyboardController');

var _KeyboardController2 = _interopRequireDefault(_KeyboardController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

global.TetrisApp = _TetrisApp2.default;
global.TetrisCanvasRenderer = _TetrisCanvasRenderer2.default;
global.KeyboardController = _KeyboardController2.default;

window.onload = function () {
	var renderer = new _TetrisCanvasRenderer2.default('tetris', 12, 24),
	    controller = new _KeyboardController2.default('tetris'),
	    tetris = new _TetrisApp2.default(renderer, controller);

	tetris.run();
};