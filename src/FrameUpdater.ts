export default class FrameUpdater {
	constructor() {
		this._lastUpdate = 0;
	}

	onFrame(delta) {

	}

	run() {
		window.requestAnimationFrame(ts => { this._updateFrame(ts); });
	}

	_updateFrame(timeStamp) {
		if (this._lastUpdate !== 0) {
			this.onFrame((timeStamp - this._lastUpdate) / 1000);
		}
		
		this._lastUpdate = timeStamp;
		window.requestAnimationFrame(ts => { this._updateFrame(ts); });
	}
}