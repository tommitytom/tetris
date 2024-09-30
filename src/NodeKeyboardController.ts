import { GlobalKeyboardListener, IGlobalKey } from "node-global-key-listener";

const COMMAND_MAP = new Map<IGlobalKey, string>([
    ['LEFT ARROW', 'MoveLeft'],
    ['RIGHT ARROW', 'MoveRight'],
    ['UP ARROW', 'Rotate'],
    ['DOWN ARROW', 'IncreaseFallRate'],
    ['SPACE', 'Drop'],
    ['Z', 'Hold'],
    ['R', 'Reset']
]);

export default class NodeKeyboardController {
    private _listener: GlobalKeyboardListener;
    private _handler: (v: string) => void;

	constructor() {
        this._listener = new GlobalKeyboardListener();

        this._listener.addListener((e, down) => {
            const isDown = e.state === 'DOWN';           

            if (isDown) {
                let cmd = COMMAND_MAP.get(e.name);
                if (cmd && this._handler) {
                    this._handler(cmd);
                }
            } else {
                if (e.name === 'DOWN ARROW' && this._handler) {
                    this._handler('ResetFallRate');
                }
            }

            //console.log(`${e.name} ${e.state == "DOWN" ? "DOWN" : "UP  "} [${e.rawKey._nameRaw}]`);
        });
	}

	public onEvent(func) {
		this._handler = func;
	}
}