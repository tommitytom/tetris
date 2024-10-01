import Tetris from './Tetris';
import TetrisIldaRenderer from './TetrisIldaRenderer';

import Audic from 'audic';
import { Client } from 'node-osc';
import GamepadController from './GamepadController';
import NodeKeyboardController from './NodeKeyboardController';

import { fileURLToPath } from 'url';
import * as path from 'path';
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const renderer = new TetrisIldaRenderer(12, 24);
const tetris = new Tetris(renderer.gridSize.w, renderer.gridSize.h);
renderer.start(tetris);


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
        case 'Start':  				tetris.start();					break;
    }
}

const gamepadController = new GamepadController();
const keyboardController = new NodeKeyboardController();

gamepadController.onEvent(handleControllerEvent);
keyboardController.onEvent(handleControllerEvent);

const osc = new Client('192.168.0.130', 3333);

const ENABLE_SFX = false;
const ENABLE_BGM = false;

const bgm = new Audic(`${__dirname}/../assets/TEST.ogg`);
const sfx1 = new Audic(`${__dirname}/../assets/SF1.wav`);
const sfx2 = new Audic(`${__dirname}/../assets/SF2.wav`);

tetris.on('begin', () =>{
    console.log('BEGIN');
    
    if (ENABLE_BGM) {
        bgm.loop = true;
        bgm.play();
    }
    //osc.send('/SCENE/0', 1);
});

tetris.on('rotate', () =>{
    if (ENABLE_SFX) {
        sfx1.currentTime = 0;
        sfx1.playing = false;
        sfx1.play();
    }

    //osc.send('/SCENE/0', 1);
});

tetris.on('land', () =>{
    //osc.send('/SCENE/0', 1);
});

tetris.on('death', () =>{
    osc.send('/SCENE/0', 1);
});

tetris.on('removeBegin', (amount: number) => {
    if (ENABLE_SFX) {
        sfx2.play();
    }
    
    osc.send('/SCENE/2', 1);
    //osc.send('/tetris/removeBegin', amount);
});

tetris.on('removeComplete', (amount: number) => {
    osc.send('/SCENE/1', 1);
    //osc.send('/tetris/removeComplete', amount);
});
