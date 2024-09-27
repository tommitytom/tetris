import Tetris from './Tetris';
import TetrisIldaRenderer from './TetrisIldaRenderer';
import gamepad from 'gamepad';

const renderer = new TetrisIldaRenderer(12, 24);
const tetris = new Tetris(renderer.gridSize.w, renderer.gridSize.h);
renderer.start(tetris);

gamepad.init();

for (var i = 0, l = gamepad.numDevices(); i < l; i++) {
    console.log(i, gamepad.deviceAtIndex(i));
}

// Create a game loop and poll for events
setInterval(gamepad.processEvents, 16);
// Scan for new gamepads as a slower rate
setInterval(gamepad.detectDevices, 500);

// Listen for button up events on all gamepads
gamepad.on("up", function (id, num) {
    console.log("up", {
        id: id,
        num: num,
    });
});

// Listen for button down events on all gamepads
gamepad.on("down", function (id, num) {
    if (tetris.state.playing) {
        if (num === 1) {
            tetris.drop();
        } else if (num === 2) {
            tetris.moveLeft();
        } else if (num === 3) {
            tetris.moveRight();
        } else if (num === 10) {
            tetris.rotate();
        }
    } else {
        if (num === 4) {
            console.log('starting!');      
            tetris.reset();      
            tetris.start();
        }
    }
    
    console.log("down", {
        id: id,
        num: num,
    });
});
