'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _FrameUpdater2 = require('./FrameUpdater');

var _FrameUpdater3 = _interopRequireDefault(_FrameUpdater2);

var _Tetris = require('./Tetris');

var _Tetris2 = _interopRequireDefault(_Tetris);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TetrisApp = function (_FrameUpdater) {
	_inherits(TetrisApp, _FrameUpdater);

	function TetrisApp(renderer, controller) {
		_classCallCheck(this, TetrisApp);

		var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(TetrisApp).call(this));

		_this._renderer = renderer;
		_this._controller = controller;

		_this._game = new _Tetris2.default(renderer.gridSize.w, renderer.gridSize.h);

		controller.onEvent(function (name) {
			switch (name) {
				case 'MoveLeft':
					_this._game.moveLeft();break;
				case 'MoveRight':
					_this._game.moveRight();break;
				case 'Rotate':
					_this._game.rotate();break;
				case 'IncreaseFallRate':
					_this._game.fallRateMultiplier = 6;break;
				case 'ResetFallRate':
					_this._game.fallRateMultiplier = 1;break;
				case 'Drop':
					_this._game.drop();break;
				case 'Hold':
					_this._game.hold();break;
				case 'Reset':
					_this._game.reset();break;
			}
		});
		return _this;
	}

	_createClass(TetrisApp, [{
		key: 'onFrame',
		value: function onFrame(delta) {
			this._game.update(delta);
			this._renderer.render(this._game.state, delta);
		}
	}]);

	return TetrisApp;
}(_FrameUpdater3.default);

exports.default = TetrisApp;