import { Ticker, UPDATE_PRIORITY, utils } from 'pixi.js';
import { EVENT_NAME } from '../Utils/Constants';

import { Store, IStoreOptions } from '../Utils/Store';
import { InputManager, IInputOptions } from '../Input/';

/**
 * Engine options supplied to constructor.
 */
export interface IEngineOptions extends IStoreOptions, IInputOptions {}

/**
 * Convenience class to create a new Fox-Game.
 *
 * This class automatically creates the renderer, ticker and root container.
 * @class
 */
export class Engine extends utils.EventEmitter {

    /**
     * Ticker from Pixi
     * 
     * @example
     * performance.now(): this.oTicker.lastTime + this.oTicker.elapsedMS
     * Date.now(): performance.timeOrigin + this.oTicker.lastTime + this.oTicker.elapsedMS
    */
    public oTicker: Ticker = new Ticker();
    /** Store Manager */
    public oStore: Store;

    /** Input Manager */
    public oInput: InputManager;
    /** Current Scene updated and rendered */
    public oScene = null;
    /** Output Manager */
    public oOutput = null;

    /** Count of frames rendered. */
    public nFrames: number = 0;

    /** Engine Options */
    private _oOptions: Partial<IEngineOptions> | undefined;
    
    constructor(oEngineOptions?: Partial<IEngineOptions>) {

        super();

        // Options
        this._oOptions = oEngineOptions;
        
        // Store
        this.oStore = new Store(this, oEngineOptions);
        // Input
        this.oInput = new InputManager(this, <IInputOptions>oEngineOptions);

        // Ticker
        this.oTicker.add( this._update, this );
        this.oTicker.add( this._render, this, UPDATE_PRIORITY.LOW );
    }

    /** Start Engine */
    public start(): Engine {
        this.oTicker.start();

        // Trigger
        this.emit(EVENT_NAME.ENGINE_START);
        return this;
    }

    /** Stop Engine */
    public stop(): Engine {
        this.oTicker.stop();

        // Trigger
        this.emit(EVENT_NAME.ENGINE_STOP);
        return this;
    }

    /** Get current time used for current tick trigger via Pixi.
     * Alias performance.now().
    */
    public getTickTime(): number {
        return this.oTicker.lastTime + this.oTicker.elapsedMS;
    }

    /** Callback on Ticker for update Input and Scene */
    private _update(): void {
        // MAJ des sources d'entrées
        this.oInput.update();
        // MAJ de la scène en cours
        // this.oScene.update();

        // Trigger
        this.emit(EVENT_NAME.ENGINE_UPDATE);
    }

    /** Callback on Ticker for render Scene via HTML and via Output */
    private _render(): void {
        // RENDER spécifique de la scène en cours
        // this.oScene.render();
        // RENDER visuel via Pixi
        // this.oOutput.render();

        this.nFrames++;
        
        // Trigger
        this.emit(EVENT_NAME.ENGINE_RENDER);
    }

}