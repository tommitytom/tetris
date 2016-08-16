import FrameUpdater from './FrameUpdater';
import Tetris from './Tetris';

export default class TetrisApp extends FrameUpdater {
	constructor(renderer, controller, listener) {
		super();

		this._renderer = renderer;
		this._controller = controller;
		this._listener = listener;

		this._game = new Tetris(renderer.gridSize.w, renderer.gridSize.h);

		controller.onEvent(name => {
			switch (name) {
				case 'MoveLeft': 			this._game.moveLeft(); 		break;
				case 'MoveRight': 			this._game.moveRight(); 	break;
				case 'Rotate': 				this._game.rotate(); 		break;
				case 'IncreaseFallRate': 	this._game.fallRate = 2; 	break;
				case 'ResetFallRate': 		this._game.fallRate = 1; 	break;
				case 'Drop':  				this._game.drop();			break;
			}
		});

		this._game.start();
	}

	onFrame(delta) {
		this._game.update(delta);
		this._renderer.render(this._game.state);
		if (this._listener) {
			this._listener.update(this._game.state);
		}
	}
}