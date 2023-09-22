// Imports
import EventEmitter from 'eventemitter3';
import { Ticker, UPDATE_PRIORITY } from 'pixi.js';

import { EVENT_NAME } from './Constants';
import { Store, IStoreOptions } from './Store';
import { InputManager, IInputOptions } from '../Input/';
import { Scene } from './Scene';
// import { OutputManager, IOutputOptions } from './Output';


/**
 * Engine options supplied to constructor.
 */
export interface IEngineOptions extends IStoreOptions, IInputOptions {
    oStartingScene?: new (oEgine: Engine) => Scene,
    aStartingSceneArguments?: [],
}


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
    public oScene: Scene | null = null;
    /** Output Manager */
    public oOutput/*: OutputManager */ = null;

    /** Count of frames rendered. */
    public nFrames: number = 0;


    /** Engine Options */
    private _oOptions: Partial<IEngineOptions> | undefined;
    /** List of Listener add via window. */
    private _oWindowListeners: { [key: string]: Function } = {};
    

    /** Constructor */
    constructor(oEngineOptions?: Partial<IEngineOptions>) {

        super();

        // Options
        this._oOptions = oEngineOptions;
        
        // Store
        this.oStore = new Store(this, oEngineOptions);
        // Input
        this.oInput = new InputManager(this, <IInputOptions>oEngineOptions);
        // Scene
        this.once(EVENT_NAME.ENGINE_START, () => {
            if( this._oOptions?.oStartingScene ){
                this._setScene(this._oOptions.oStartingScene, this._oOptions?.aStartingSceneArguments || []);
            }
        } );

        // this.oOutput = new OutputManager(this, <IOutputOptions>oEngineOptions);

        // Ticker
        this.oTicker.add( this._update, this );
        this.oTicker.add( this._render, this, UPDATE_PRIORITY.LOW );
    }

    /** Destructor */
    public destroy(): void {
        
        // Remove listeners
        this.removeAllListeners();
        this.removeAllWindowListeners();

        // Destroy references
        this.oTicker.destroy();
        this.oInput.destroy();
        this.oScene?.destroy();
        // this.oOutput.destroy();
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


    /** Change Current Scene */
    public changeScene(oNewScene: new (oEngine: Engine) => Scene, ...aArguments: []): void {

        this.on(EVENT_NAME.ENGINE_POST_UPDATE, () => {

            // Enlève et détruit la scène courante
            this.oScene?.destroy();

            // Ajoute la nouvelle scène et la défini comme courante
            this._setScene(oNewScene, aArguments);
        } );
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


    /** Add New Scene like current. */
    private _setScene(oNewScene: new (oEngine: Engine) => Scene, aArguments: []): void {
            
        // Ajoute la nouvelle scène et la défini comme courante
        this.oScene = new oNewScene(this);
        this.oScene.initialize.apply(this.oScene, aArguments);
        // this.oOutput.setSceneOutputEntities( this.oScene );
    }

    /** Callback on Ticker for update Input and Scene */
    private _update(): void {

        // Trigger
        this.emit(EVENT_NAME.ENGINE_UPDATE);

        // MAJ des sources d'entrées
        this.oInput.update();

        // MAJ des états de la scène en cours
        this.oScene?.update();

        // Trigger
        this.emit(EVENT_NAME.ENGINE_POST_UPDATE);
    }

    /** Callback on Ticker for render Scene via HTML and via Output */
    private _render(): void {
        
        // Trigger
        this.emit(EVENT_NAME.ENGINE_RENDER);

        // RENDER des entités externe au moteur graphique utilisé
        this.oScene?.render();
        
        // RENDER visuel via Output
        // this.oOutput.render();

        this.nFrames++;
        
        // Trigger
        this.emit(EVENT_NAME.ENGINE_POST_RENDER);
    }

}