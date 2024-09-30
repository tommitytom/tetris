import Tetris from './Tetris';
import TetrisIldaRenderer from './TetrisIldaRenderer';

import { Client } from 'node-osc';
import GamepadController from './GamepadController';
import NodeKeyboardController from './NodeKeyboardController';

const renderer = new TetrisIldaRenderer(12, 24);
const tetris = new Tetris(renderer.gridSize.w, renderer.gridSize.h);
renderer.start(tetris);

const gamepadController = new GamepadController();
const keyboardController = new NodeKeyboardController();

function handleControllerEvent(name) {
    switch (name) {
        case 'MoveLeft': 			tetris.moveLeft(); 				break;
        case 'MoveRight': 			tetris.moveRight(); 			break;
        case 'Rotate': 				tetris.rotate(); 				break;
        case 'IncreaseFallRate': 	tetris.fallRateMultiplier = 6; 	break;
        case 'ResetFallRate': 		tetris.fallRateMultiplier = 1; 	break;
        case 'Drop':  				tetris.drop();					break;
        case 'Hold':  				tetris.hold();					break;
        case 'Reset':  				tetris.reset();					break;
    }
}

gamepadController.onEvent(handleControllerEvent);
keyboardController.onEvent(handleControllerEvent);

const osc = new Client('192.168.0.130', 3333);

tetris.on('death', () =>{
    osc.send('/SCENE/0', 1);
});

tetris.on('removeBegin', (amount: number) => { 
    osc.send('/SCENE/2', 1);
    //osc.send('/tetris/removeBegin', amount);
});

tetris.on('removeComplete', (amount: number) => {
    osc.send('/SCENE/1', 1);
    //osc.send('/tetris/removeComplete', amount);
});
