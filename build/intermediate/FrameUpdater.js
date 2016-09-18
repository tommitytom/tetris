"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FrameUpdater = function () {
	function FrameUpdater() {
		_classCallCheck(this, FrameUpdater);

		this._lastUpdate = 0;
	}

	_createClass(FrameUpdater, [{
		key: "onFrame",
		value: function onFrame(delta) {}
	}, {
		key: "run",
		value: function run() {
			var _this = this;

			window.requestAnimationFrame(function (ts) {
				_this._updateFrame(ts);
			});
		}
	}, {
		key: "_updateFrame",
		value: function _updateFrame(timeStamp) {
			var _this2 = this;

			if (this._lastUpdate !== 0) {
				this.onFrame((timeStamp - this._lastUpdate) / 1000);
			}

			this._lastUpdate = timeStamp;
			window.requestAnimationFrame(function (ts) {
				_this2._updateFrame(ts);
			});
		}
	}]);

	return FrameUpdater;
}();

exports.default = FrameUpdater;