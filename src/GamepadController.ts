import gamepad from 'gamepad';

export default class GamepadController {
    private _listener: (v: string) => void;

	constructor() {
		gamepad.init();

        for (var i = 0, l = gamepad.numDevices(); i < l; i++) {
            console.log(i, gamepad.deviceAtIndex(i));
        }

        // Create a game loop and poll for events
        setInterval(gamepad.processEvents, 16);
        // Scan for new gamepads as a slower rate
        setInterval(gamepad.detectDevices, 500);

        // Listen for button down events on all gamepads
        gamepad.on("down", (_, num) => {
            if (num === 0) {
                this._listener('Drop');
            } else if (num === 1) {
                this._listener('IncreaseFallRate');
            } else if (num === 2) {
                this._listener('MoveLeft');
            } else if (num === 3) {
                this._listener('MoveRight');
            } else if (num === 10) {
                this._listener('Rotate');
            } else if (num === 4) {
                this._listener('Reset');
            }
        });

        // Listen for button up events on all gamepads
        gamepad.on("up", (_, num) => {
            if (num === 1) {
                this._listener('ResetFallRate');
            }
        });
	}

	onEvent(func) {
		this._listener = func;
	}
}