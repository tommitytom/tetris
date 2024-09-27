import KeyboardController from './KeyboardController';
import './style.css'
import './tetris.css'
import TetrisApp from './TetrisApp';
import TetrisCanvasRenderer from './TetrisCanvasRenderer';

const renderer = new TetrisCanvasRenderer('tetris', 12, 24);
const controller = new KeyboardController('tetris');
const tetris = new TetrisApp(renderer, controller);

tetris.run();
