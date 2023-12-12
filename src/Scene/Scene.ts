// Imports
import EventEmitter from 'eventemitter3';

import { Engine, Store } from '../Core/';
import { InputManager } from '../Input/';
import { OutputManager } from '../Output/';
import { SceneManager } from './';


/**
 * Class to create a new Scene, use for be extend.
 * 
 * @class
 */
export abstract class Scene extends EventEmitter {


    /** Engine use for update the Scene. */
    public oEngine: Engine;
    /** Store Manager */
    public oStore: Store;
    /** Input Manager */
    public oInput: InputManager;
    /** Scene Manager */
    public oScene: SceneManager;
    /** Output Manager */
    public oOutput: OutputManager;


    /** Constructor */
    constructor(oMScene: SceneManager) {
        super();

        this.oEngine = oMScene.oEngine;
        this.oStore = this.oEngine.oStore;
        this.oInput = this.oEngine.oInput;
        this.oScene = oMScene;
        this.oOutput = this.oEngine.oOutput;
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
     * Use to render entities external to the Output engine.
     * 
     * @example
     * public render(): void {
     *      document.querySelector('#printFPS').innerText = `${this.oEngine.oTicker.FPS} frames/s`;
     * }
     */
    public render(): void { }
}