import FrameUpdater from './FrameUpdater';
import Tetris from './Tetris';

export default class TetrisApp extends FrameUpdater {
	constructor(renderer, controller) {
		super();

		this._renderer = renderer;
		this._controller = controller;

		this._game = new Tetris(renderer.gridSize.w, renderer.gridSize.h);

		controller.onEvent(name => {
			switch (name) {
				case 'MoveLeft': 			this._game.moveLeft(); 				break;
				case 'MoveRight': 			this._game.moveRight(); 			break;
				case 'Rotate': 				this._game.rotate(); 				break;
				case 'IncreaseFallRate': 	this._game.fallRateMultiplier = 6; 	break;
				case 'ResetFallRate': 		this._game.fallRateMultiplier = 1; 	break;
				case 'Drop':  				this._game.drop();					break;
				case 'Hold':  				this._game.hold();					break;
				case 'Reset':  				this._game.reset();					break;
			}
		});
	}

	onFrame(delta) {
		this._game.update(delta);
		this._renderer.render(this._game.state, delta);
	}
}