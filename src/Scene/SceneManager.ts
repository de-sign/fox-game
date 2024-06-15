// Imports
import EventEmitter from 'eventemitter3';

import { EVENT_NAME } from '../Core/Constants';
import { Engine } from '../Core/';
import { Scene } from './';


export interface ISceneOptions {
    cScene: new (oMScene: SceneManager) => Scene,
    aArguments?: [],
    sTransition?: string
}

const oDefaultSceneOptions = {
    aArguments: []
};


/**
 * Scene Manager options supplied to constructor.
 */
export interface ISceneManagerOptions {
    oStartingScene: ISceneOptions,
    sDefaultTransition?: string
}

const oDefaultSceneManagerOptions = {
    sDefaultTransition: 'NONE'
};


export class SceneManager extends EventEmitter {

    
    /** Engine use for update the Scene. */
    public oEngine: Engine;

    /** Current Scene updated and rendered */
    public get oCurrentScene(): Scene | null {
        return this._aScenes[ this._aScenes.length - 1 ];
    }


    /** Scene option */
    private _oOptions: ISceneManagerOptions;
    /** Stack of Scene */
    private _aScenes: Scene[] = [];


    constructor(oEngine: Engine, oSceneManagerOptions?: ISceneManagerOptions) {

        super();

        this.oEngine = oEngine;

        // Options par défaut
        this._oOptions = Object.assign( {}, oDefaultSceneManagerOptions, oSceneManagerOptions );
        
        // Event
        this.oEngine.once(EVENT_NAME.ENGINE_START, () => {
            // Scene
            if( this._oOptions.oStartingScene ){
                this.changeScene(this._oOptions.oStartingScene);
            }
        } );
    }

    destroy(): void {
        this.removeAllListeners();
        this._unsetScene();
    }


    /** Update Current Scene */
    public update(): void {
        const oScene = this.oCurrentScene;
        if( oScene && !oScene.isFrozen() ){
            oScene.update();
        }

        // Trigger
        this.emit(EVENT_NAME.SCENE_UPDATE, oScene);
    }

    /** Render Current Scene */
    public render(): void {
        const oScene = this.oCurrentScene;
        if( oScene ){
            oScene.render();
        }

        // Trigger
        this.emit(EVENT_NAME.SCENE_RENDER, oScene);
    }
    

    /** Change Current Scene with a new Scene */
    public changeScene(oSceneOptions: ISceneOptions): void {

        const oOptions = Object.assign( { sTransition: this._oOptions.sDefaultTransition }, oDefaultSceneOptions, oSceneOptions );

        this.oEngine.once(EVENT_NAME.ENGINE_UPDATE, () => {
            // Enlève et détruit la scène courante
            this._unsetScene();

            // Ajoute la nouvelle scène et la défini comme courante
            this._setScene(oOptions.cScene, oOptions.aArguments);

            // Trigger
            this.emit(EVENT_NAME.SCENE_CHANGE, this.oCurrentScene);
        } );
    }

    /**
     * Add a new Scene like Current and stock last Scene.
     * Used for create Overlay Scene like pause, menu etc ...
     */
    public stackScene(oSceneOptions: ISceneOptions): void {

        const oOptions = Object.assign( { sTransition: this._oOptions.sDefaultTransition }, oDefaultSceneOptions, oSceneOptions );

        this.oEngine.once(EVENT_NAME.ENGINE_UPDATE, () => {
            // Trigger
            this.oCurrentScene?.emit(EVENT_NAME.SCENE_BLUR);

            // Ajoute la nouvelle scène et la défini comme courante
            this._setScene(oOptions.cScene, oOptions.aArguments);
        } );
    }

    /**
     * Destroy current Scene and define last stcoke Scene like Current.
     * Used for Destroy Overlay Scene like pause, menu etc ...
     */
    public unstackScene(nSceneToUnstack: number = 1): void {
        this.oEngine.once(EVENT_NAME.ENGINE_UPDATE, () => {
            for( let nIndex = 0; nIndex < nSceneToUnstack; nIndex++ ){
                // Enlève et détruit la scène courante
                this._unsetScene();
                
                // Trigger
                this.oCurrentScene?.emit(EVENT_NAME.SCENE_FOCUS);
            }
        } );
    }

    /** Add New Scene like current. */
    private _setScene(oNewScene: new (oMScene: SceneManager) => Scene, aArguments: []): void {
        
        // Créer la nouvelle scène, l'ajoute et la défini comme courante
        const oScene = new oNewScene(this);
        oScene.initialize.apply(oScene, aArguments);
        this._aScenes.push(oScene);

        // Trigger
        this.emit(EVENT_NAME.SCENE_INITIALIZE, oScene);
    }

    /** Remove and destroy current Scene. */
    private _unsetScene(): void {

        // Enlève et détruit la scène courante
        const oScene = this._aScenes.pop();
        if( oScene ){
            oScene.destroy();

            // Trigger
            this.emit(EVENT_NAME.SCENE_DESTROY, oScene);
        }
    }
    
}