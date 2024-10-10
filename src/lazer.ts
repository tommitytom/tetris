import Audic from 'audic';
import midi from 'midi';
import { Client } from 'node-osc';
import * as path from 'path';
import { fileURLToPath } from 'url';

//import GamepadController from './GamepadController';
import NodeKeyboardController from './NodeKeyboardController';
import Tetris from './Tetris';
import TetrisIldaRenderer, { GameStage } from './TetrisIldaRenderer';

const ENABLE_SFX = false;
const ENABLE_BGM = false;
const ENABLE_MIDI = false;
const SHOW_SCORE = false;

const NOTE_ROTATE = 55;
const NOTE_LAND = 56;
const NOTE_CLEAR = 57;

const osc = new Client('192.168.0.170', 3333);

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
    switch (renderer.state.stage) {
        case GameStage.StartScreen: {
            switch (name) {
                case 'Start':
                    // Trigger start sound
                    tetris.start();
                    renderer.state.stage = GameStage.Playing;
                    break;
            }

            break;
        }
        case GameStage.Playing: {
            switch (name) {
                case 'MoveLeft': 			tetris.moveLeft(); 				break;
                case 'MoveRight': 			tetris.moveRight(); 			break;
                case 'Rotate': 				tetris.rotate(); 				break;
                case 'IncreaseFallRate': 	tetris.fallRateMultiplier = 6; 	break;
                case 'ResetFallRate': 		tetris.fallRateMultiplier = 1; 	break;
                case 'Drop':  				tetris.drop();					break;
                case 'Hold':  				tetris.hold();					break;
                case 'Start':  				tetris.start();					break;
                case 'Reset':  				
                    tetris.reset();
                    renderer.state.stage = GameStage.StartScreen;
                    break;
            }

            break;
        }
        case GameStage.GameOver: {
            switch (name) {
                case 'Start':
                    tetris.reset();
                    renderer.state.stage = GameStage.StartScreen;
                    break;
            }
            break;
        }
        case GameStage.Greets: {
            switch (name) {
                case 'Start':
                    renderer.state.stage = GameStage.StartScreen;
                    break;
            }
            break;
        }
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
    osc.send('/tetris/begin', 1);
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

    osc.send('/tetris/rotate', 1);
});

tetris.on('land', () =>{
    if (ENABLE_SFX) {
        sfxLand.currentTime = 0;
        sfxLand.playing = false;
        sfxLand.play();
    }
    if (midiOutput) {
        midiOutput.sendMessage([144,NOTE_LAND,127])
    }
    osc.send('/tetris/land', 1);
});

tetris.on('death', () =>{
    if (ENABLE_SFX) {
        sfxOver.play();
        bgm.pause();
        bgm.playing = false;
        bgm.currentTime = 0;
    }
    osc.send('/tetris/death', 1);
});

tetris.on('removeBegin', (amount: number) => {
    if (ENABLE_SFX) {
        sfxLine.play();
    }

    if (midiOutput) {
        midiOutput.sendMessage([144,NOTE_CLEAR,127])
    }
    
    osc.send('/tetris/removeBegin', amount);
});

tetris.on('removeComplete', (amount: number) => {
    osc.send('/tetris/removeComplete', amount);
});

tetris.on('next', (type: number) => {
    switch (type) {
        case 0: osc.send('/tetris/next/o', 1); break;
        case 1: osc.send('/tetris/next/t', 1); break;
        case 2: osc.send('/tetris/next/z', 1); break;
        case 3: osc.send('/tetris/next/s', 1); break;
        case 4: osc.send('/tetris/next/j', 1); break;
        case 5: osc.send('/tetris/next/l', 1); break;
        case 6: osc.send('/tetris/next/i', 1); break;
    }
});
