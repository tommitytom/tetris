import TetrisApp from './TetrisApp';
import TetrisCanvasRenderer from './TetrisCanvasRenderer';
import KeyboardController from './KeyboardController';

window.onload = () => { 
	let renderer = new TetrisCanvasRenderer('tetris', 12, 24),
		controller = new KeyboardController('tetris'),
		tetris = new TetrisApp(renderer, controller);
		
	tetris.run();
};
