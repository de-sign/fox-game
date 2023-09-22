// Imports
import EventEmitter from 'eventemitter3';

import { Engine, Store } from '../';
import { InputManager } from '../Input/';


/**
 * Class to create a new Scene, use for be extend.
 * 
 * @class
 */
export class Scene extends EventEmitter {


    /** Engine use for update the Scene. */
    public oEngine: Engine;
    /** Store Manager */
    public oStore: Store;
    /** Input Manager */
    public oInput: InputManager;
    /** Output Manager */
    public oOutput = null;


    /** Constructor */
    constructor(oEngine: Engine) {
        super();

        this.oEngine = oEngine;
        this.oStore = oEngine.oStore;
        this.oInput = oEngine.oInput;
        this.oOutput = oEngine.oOutput;
    }

    /** Destructor */
    public destroy(): void { }


    /** Initialize function call when is set like current Scene. */
    public initialize(): void { }

    /**
     * Update function call at each tick.
     * Use for update state of Entities.
     */
    public update(): void { }

    /**
     * Render function call at each tick.
     * Use to render entities external to the graphics engine.
     * 
     * @example
     * public render(): void {
     *      document.querySelector('#printFPS').innerText = `${this.oEngine.oTicker.FPS} frames/s`;
     * }
     */
    public render(): void { }
}