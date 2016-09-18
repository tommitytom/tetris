'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var COMMAND_MAP = {
	'ArrowLeft': 'MoveLeft',
	'ArrowRight': 'MoveRight',
	'ArrowUp': 'Rotate',
	'ArrowDown': 'IncreaseFallRate',
	'Space': 'Drop',
	'KeyZ': 'Hold',
	'KeyR': 'Reset'
};

var KeyboardController = function () {
	function KeyboardController(element) {
		var _this = this;

		_classCallCheck(this, KeyboardController);

		this._element = document.getElementById(element);
		this._listener = null;

		window.addEventListener('keydown', function (evt) {
			var cmd = COMMAND_MAP[evt.code];
			if (cmd && _this._listener) {
				_this._listener(cmd);
			}
		}, false);

		window.addEventListener('keyup', function (evt) {
			if (evt.code === 'ArrowDown' && _this._listener) {
				_this._listener('ResetFallRate');
			}
		}, false);
	}

	_createClass(KeyboardController, [{
		key: 'onEvent',
		value: function onEvent(func) {
			this._listener = func;
		}
	}]);

	return KeyboardController;
}();

exports.default = KeyboardController;