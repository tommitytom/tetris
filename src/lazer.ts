import Audic from 'audic';
import midi from 'midi';
//import { Client } from 'node-osc';
import * as path from 'path';
import { fileURLToPath } from 'url';

import GamepadController from './GamepadController';
import NodeKeyboardController from './NodeKeyboardController';
import Tetris from './Tetris';
import TetrisIldaRenderer from './TetrisIldaRenderer';

const ENABLE_SFX = false;
const ENABLE_BGM = false;
const ENABLE_MIDI = false;
const SHOW_SCORE = false;

const NOTE_ROTATE = 55;
const NOTE_LAND = 56;
const NOTE_CLEAR = 57;

//const osc = new Client('192.168.0.130', 3333);

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const bgm = new Audic(`${__dirname}/../assets/TEST.ogg`);
const sfxStart = new Audic(`${__dirname}/../assets/1_START.wav`);
const sfxFlip = new Audic(`${__dirname}/../assets/2_FLIP.wav`);
const sfxLand = new Audic(`${__dirname}/../assets/3_LAND.wav`);
const sfxLine = new Audic(`${__dirname}/../assets/4_LINE.wav`);
const sfxOver = new Audic(`${__dirname}/../assets/5_OVER.wav`);

const BOARD_WIDTH = 12;
const BOARD_HEIGHT = 24;

const renderer = new TetrisIldaRenderer(BOARD_WIDTH, BOARD_HEIGHT);
renderer.showScore = SHOW_SCORE;

const tetris = new Tetris(BOARD_WIDTH, BOARD_HEIGHT);
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

///const gamepadController = new GamepadController();
const keyboardController = new NodeKeyboardController();

//gamepadController.onEvent(handleControllerEvent);
keyboardController.onEvent(handleControllerEvent);

let midiOutput: midi.Output;

if (ENABLE_MIDI) {
    midiOutput = new midi.Output();
    console.log(`Opening midi port ${midiOutput.getPortName(0)}`);
    midiOutput.openPort(0);
}

tetris.on('begin', () =>{
    console.log('BEGIN');
    
    if (ENABLE_BGM) {
        bgm.loop = true;
        bgm.play();
        sfxStart.play();
    }
    //osc.send('/SCENE/0', 1);
});

tetris.on('rotate', () =>{
    if (ENABLE_SFX) {
        sfxFlip.currentTime = 0;
        sfxFlip.playing = false;
        sfxFlip.play();
    }

    if (midiOutput) {
        midiOutput.sendMessage([144,NOTE_ROTATE,127])
    }

    //osc.send('/SCENE/0', 1);
});

tetris.on('land', () =>{
    if (ENABLE_SFX) {
        sfxLand.play();
    }
    if (midiOutput) {
        midiOutput.sendMessage([144,NOTE_LAND,127])
    }
    //osc.send('/SCENE/0', 1);
});

tetris.on('death', () =>{
    if (ENABLE_SFX) {
        sfxOver.play();
        bgm.pause();
        bgm.playing = false;
        bgm.currentTime = 0;
    }
    //osc.send('/SCENE/0', 1);
});

tetris.on('removeBegin', (_: number) => {
    if (ENABLE_SFX) {
        sfxLine.play();
    }

    if (midiOutput) {
        midiOutput.sendMessage([144,NOTE_CLEAR,127])
    }
    
    //osc.send('/SCENE/2', 1);
    //osc.send('/tetris/removeBegin', amount);
});

tetris.on('removeComplete', (_: number) => {
    //osc.send('/SCENE/1', 1);
    //osc.send('/tetris/removeComplete', amount);
});
