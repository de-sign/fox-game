/** ----- EVENT_NAME */
export enum EVENT_NAME {
    ENGINE_START = 'EngineStart',
    ENGINE_STOP = 'EngineStop',
    ENGINE_UPDATE = 'EngineUpdate',
    ENGINE_RENDER = 'EngineRender',

    INPUT_UPDATE = 'InputUpdate',

    INPUT_SOURCE_CREATE = 'InputSourceCreate',
    INPUT_SOURCE_UPDATE = 'InputSourceUpdate',
    INPUT_SOURCE_DISCONNECT = 'InputSourceDisconnect',
    INPUT_SOURCE_RECONNECT = 'InputSourceReconnect',

    INPUT_CONTROLLER_CREATE = 'InputControllerCreate',
    INPUT_CONTROLLER_UPDATE = 'InputControllerUpdate'
}

/** ----- INPUT_SOURCE */
export enum INPUT_SOURCE_TYPE {
    KEYBOARD,
    GAMEPAD,
    MOUSE,
    TOUCH
}

/* ----- GAMEPAD_BUTTON */

/** Generic gamepad button names */
export enum GAMEPAD_BUTTON_DEFAULT_NAME {
    Axe0 = 'L-Stick X Axe',
    Axe1 = 'L-Stick Y Axe',
    Axe2 = 'R-Stick X Axe',
    Axe3 = 'R-Stick Y Axe',
    Axe0Minus = 'L-Stick Left',
    Axe0Plus = 'L-Stick Right',
    Axe1Minus = 'L-Stick Up',
    Axe1Plus = 'L-Stick Down',
    Axe2Minus = 'R-Stick Left',
    Axe2Plus = 'R-Stick Right',
    Axe3Minus = 'R-Stick Up',
    Axe3Plus = 'R-Stick Down',
    Button10 = 'L-Stick Button',
    Button11 = 'R-Stick Button',
    Button12 = 'D-Pad Up',
    Button13 = 'D-Pad Down',
    Button14 = 'D-Pad Left',
    Button15 = 'D-Pad Right',
}

/** Playstation gamepad button names */
export enum GAMEPAD_BUTTON_PLAYSTATION_NAME {
    Button0 = 'Cross',
    Button1 = 'Circle',
    Button2 = 'Square',
    Button3 = 'Triangle',
    Button4 = 'L1',
    Button5 = 'R1',
    Button6 = 'L2',
    Button7 = 'R2',
    Button8 = 'Select',
    Button9 = 'Start',
    Button10 = 'L3',
    Button11 = 'R3',
    Button16 = 'Home'
}

/** Xbox gamepad button names */
export enum GAMEPAD_BUTTON_XBOX_NAME {
    Button0 = 'A',
    Button1 = 'B',
    Button2 = 'X',
    Button3 = 'Y',
    Button4 = 'L-Bumper',
    Button5 = 'R-Bumper',
    Button6 = 'L-Trigger',
    Button7 = 'R-Trigger',
    Button8 = 'View',
    Button9 = 'Menu',
    Button16 = 'Xbox'
}