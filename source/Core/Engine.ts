// Imports
import EventEmitter from 'eventemitter3';
import { Ticker, UPDATE_PRIORITY } from 'pixi.js';

import { TListeners } from './Type';
import { EVENT_NAME } from './Constants';
import { Store, IStoreOptions } from './Store';
import { InputManager, IInputOptions } from '../Input';
import { SceneManager, ISceneOptions } from '../Scene';
import { OutputManager, IOutputOptions } from '../Output';


/**
 * Engine options supplied to constructor.
 */
export interface IEngineOptions {
    bDebugMode?: boolean,
    cOutputManager?: new (oEngine: Engine, oOutputOptions?: IOutputOptions) => OutputManager,

    oStore?: IStoreOptions,
    oInput?: IInputOptions,
    oScene?: ISceneOptions,
    oOutput?: IOutputOptions
}

const oDefaultEngineOptions = {
    bDebugMode: false
};


/**
 * Convenience class to create a new Fox-Game.
 *
 * This class automatically creates the renderer, ticker and root container.
 * @class
 */
export class Engine extends EventEmitter {

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
    public oScene: SceneManager;
    /** Output Manager */
    public oOutput: OutputManager;


    /** Engine Options */
    private _oOptions: Partial<IEngineOptions>;
    /** List of Listener add via window. */
    private _oWindowListeners: TListeners = {};
    /** Count of frames rendered. */
    private _nFrames: number = 0;
    

    /** Constructor */
    constructor(oEngineOptions?: Partial<IEngineOptions>) {

        super();

        // Options
        this._oOptions = Object.assign ({}, oDefaultEngineOptions, oEngineOptions);
        
        // Store
        this.oStore = new Store(this, this._oOptions.oStore);
        // Input
        this.oInput = new InputManager(this, this._oOptions.oInput);
        // Scene
        this.oScene = new SceneManager(this, this._oOptions.oScene);
        // Output
        if( this._oOptions?.cOutputManager ){
            this.oOutput = new this._oOptions.cOutputManager(this, this._oOptions.oOutput);
        } else {
            this.oOutput = new OutputManager(this, <IOutputOptions>oEngineOptions);
        }

        // Event
        this.oScene
            .on(EVENT_NAME.SCENE_INITIALIZE, oScene => {
                this.oOutput.setSceneOutputEntities( oScene );
            } )
            .on(EVENT_NAME.SCENE_DESTROY, oScene => {
                this.oOutput.unsetSceneOutputEntities( oScene );
            } );

        // Ticker
        this.oTicker.add( this._update, this );
        this.oTicker.add( this._render, this, UPDATE_PRIORITY.LOW );

        // Debug
        if( this.isDebugMode() ){
            console.log('Engine.constructor', this);
        }
    }

    /** Destructor */
    public destroy(): void {
        
        // Remove listeners
        this.removeAllListeners();
        this.removeAllWindowListeners();

        // Destroy references
        this.oTicker.destroy();
        this.oInput.destroy();
        this.oScene.destroy();
        this.oOutput.destroy();
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

    /** Get number of current frame
    */
    public getTickFrame(): number {
        return this._nFrames + 1;
    }


    /** Add Listener into Window. */
    public addWindowListener(sType: string, fCallback: Function): void {
        window.addEventListener(<keyof WindowEventMap>sType, <EventListenerOrEventListenerObject>fCallback);
        this._oWindowListeners[sType] = fCallback;
    }

    /** Remove Listener added on Window. */
    public removeWindowListener(sType: string): void {
        window.removeEventListener(
            <keyof WindowEventMap>sType,
            <EventListenerOrEventListenerObject>this._oWindowListeners[sType]
        );
        delete this._oWindowListeners[sType];
    }

    /** Remove all Listener added on Window. */
    public removeAllWindowListeners(): void {
        for( let sType in this._oWindowListeners ){
            this.removeWindowListener(sType);
        }
    }

    public isDebugMode(): boolean {
        return !!this._oOptions.bDebugMode;
    } 


    

    /** Callback on Ticker for update Input and Scene */
    private _update(): void {

        // Trigger
        this.emit(EVENT_NAME.ENGINE_UPDATE);

        // MAJ des sources d'entrées
        this.oInput.update();
        // MAJ des états de la scène en cours
        this.oScene.update();

        // Trigger
        this.emit(EVENT_NAME.ENGINE_POST_UPDATE);
    }

    /** Callback on Ticker for render Scene via HTML and via Output */
    private _render(): void {
        
        // Trigger
        this.emit(EVENT_NAME.ENGINE_RENDER);

        // RENDER des entités externe au moteur graphique utilisé
        this.oScene.render();
        // RENDER visuel via Output
        this.oOutput.render();

        this._nFrames++;
        
        // Trigger
        this.emit(EVENT_NAME.ENGINE_POST_RENDER, this._nFrames);
    }

}