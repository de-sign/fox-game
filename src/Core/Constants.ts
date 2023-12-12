/** ----- EVENT_NAME */
export enum EVENT_NAME {
    // Core
    ENGINE_START = 'EngineStart',
    ENGINE_STOP = 'EngineStop',
    ENGINE_UPDATE = 'EngineUpdate',
    ENGINE_POST_UPDATE = 'EnginePostUpdate',
    ENGINE_RENDER = 'EngineRender',
    ENGINE_POST_RENDER = 'EnginePostRender',

    INPUT_UPDATE = 'InputUpdate',

    INPUT_SOURCE_CREATE = 'InputSourceCreate',
    INPUT_SOURCE_UPDATE = 'InputSourceUpdate',
    INPUT_SOURCE_DISCONNECT = 'InputSourceDisconnect',
    INPUT_SOURCE_RECONNECT = 'InputSourceReconnect',

    INPUT_CONTROLLER_CREATE = 'InputControllerCreate',
    INPUT_CONTROLLER_UPDATE = 'InputControllerUpdate',

    SCENE_UPDATE = 'SceneUpdate',
    SCENE_RENDER = 'SceneRender',
    SCENE_INITIALIZE = 'SceneInitialize',
    SCENE_DESTROY = 'SceneDestroy',
    SCENE_CHANGE = 'SceneChange',
    SCENE_BLUR = 'SceneBlur',
    SCENE_FOCUS = 'SceneFocus',

    OUTPUT_RENDER = 'OuputRender',
    OUTPUT_RESIZE = 'OuputResize',

    CAMERA_UPDATE = 'CameraUpdate',
    CAMERA_RESIZE = 'CameraResize',

    TRANSITION_INITIALIZE = 'TransitionInitialize',
    TRANSITION_END = 'TransitionEnd',
    TRANSITION_DESTROY = 'TransitionDestroy',

    // Components
    MENU_UPDATE = 'MenuUpdate',
    MENU_MOVE = 'MenuMove',
    MENU_VALIDATE = 'MenuValidate',
    MENU_CANCEL = 'MenuCancel',
}


/** ----- INPUT_SOURCE */
export enum INPUT_SOURCE_TYPE {
    KEYBOARD,
    GAMEPAD,
    MOUSE,
    TOUCH
}


/* ----- GAMEPAD_BUTTON */

/** Mapping DeadZone properties of Gamepad buttons */
export enum GAMEPAD_BUTTON_DEAD_ZONE {
    Axe0 = 'nLeftStick',
    Axe1 = 'nLeftStick',
    Axe2 = 'nRightStick',
    Axe3 = 'nRightStick',
    Axe0Minus = 'nLeftStick',
    Axe0Plus = 'nLeftStick',
    Axe1Minus = 'nLeftStick',
    Axe1Plus = 'nLeftStick',
    Axe2Minus = 'nRightStick',
    Axe2Plus = 'nRightStick',
    Axe3Minus = 'nRightStick',
    Axe3Plus = 'nRightStick',
    Button6 = 'nLeftTrigger',
    Button7 = 'nRightTrigger'
};


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


/** ----- OUTPUT_ASPECT */
export enum OUTPUT_ASPECT_TYPE {
    INITIAL,
    KEEP_RATIO,
    KEEP_RATIO_AND_EXTEND,
    EXTEND,
    STRETCH
}


/** ----- MENU_CURSOR */
export enum MENU_CURSOR_VERTICAL {
    MenuUp = 'previous',
    MenuDown = 'next',
    MenuValidate = 'validate',
    MenuCancel = 'cancel'
}

export enum MENU_CURSOR_HORIZONTAL {
    MenuRight = 'next',
    MenuLeft = 'previous',
    MenuValidate = 'validate',
    MenuCancel = 'cancel'
}