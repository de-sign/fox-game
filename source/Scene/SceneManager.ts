// Imports
import EventEmitter from 'eventemitter3';

import { EVENT_NAME } from '../Core/Constants';
import { Engine } from '../Core';
import { Scene } from './Scene';


/**
 * Scene options supplied to constructor.
 */
export interface ISceneOptions {
    cStartingScene: new (oMScene: SceneManager) => Scene,
    aStartingSceneArguments?: [],
}

const oDefaultSceneOptions = {
    aStartingSceneArguments: []
};


export class SceneManager extends EventEmitter {

    
    /** Engine use for update the Scene. */
    public oEngine: Engine;

    /** Current Scene updated and rendered */
    public get oScene(): Scene | null {
        return this._aScenes[ this._aScenes.length - 1 ];
    }


    /** Scene option */
    private _oOptions: ISceneOptions;
    /** Stack of Scene */
    private _aScenes: Scene[] = [];


    constructor(oEngine: Engine, oSceneOptions?: ISceneOptions) {

        super();

        this.oEngine = oEngine;

        // Options par défaut
        this._oOptions = Object.assign( {}, oDefaultSceneOptions, oSceneOptions );
        
        // Event
        this.oEngine.once(EVENT_NAME.ENGINE_START, () => {
            // Scene
            if( this._oOptions.cStartingScene ){
                this.changeScene(this._oOptions.cStartingScene, ...this._oOptions.aStartingSceneArguments || []);
            }
        } );
    }

    destroy(): void {
        this._unsetScene();
        this.removeAllListeners();
    }


    /** Update Current Scene */
    public update(): void {
        const oScene = this.oScene;
        if( oScene ){
            oScene.update();

            // Trigger
            this.emit(EVENT_NAME.SCENE_UPDATE, oScene);
        }
    }

    /** Render Current Scene */
    public render(): void {
        const oScene = this.oScene;
        if( oScene ){
            oScene.render();

            // Trigger
            this.emit(EVENT_NAME.SCENE_RENDER, oScene);
        }
    }
    

    /** Change Current Scene with a new Scene */
    public changeScene(oNewScene: new (oMScene: SceneManager) => Scene, ...aArguments: []): void {
        this.oEngine.once(EVENT_NAME.ENGINE_UPDATE, () => {
            // Enlève et détruit la scène courante
            this._unsetScene();

            // Ajoute la nouvelle scène et la défini comme courante
            this._setScene(oNewScene, aArguments);

            // Trigger
            this.emit(EVENT_NAME.SCENE_CHANGE, this.oScene);
        } );
    }

    /**
     * Add a new Scene like Current and stock last Scene.
     * Used for create Overlay Scene like pause, menu etc ...
     */
    public stackScene(oNewScene: new (oMScene: SceneManager) => Scene, ...aArguments: []): void {
        this.oEngine.once(EVENT_NAME.ENGINE_UPDATE, () => {
            // Trigger
            this.oScene?.emit(EVENT_NAME.SCENE_BLUR);

            // Ajoute la nouvelle scène et la défini comme courante
            this._setScene(oNewScene, aArguments);
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
                this.oScene?.emit(EVENT_NAME.SCENE_FOCUS);
            }
        } );
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

    /** Add New Scene like current. */
    private _setScene(oNewScene: new (oMScene: SceneManager) => Scene, aArguments: []): void {
            
        // Créer la nouvelle scène, l'ajoute et la défini comme courante
        const oScene = new oNewScene(this);
        oScene.initialize.apply(oScene, aArguments);
        this._aScenes.push(oScene);

        // Trigger
        this.emit(EVENT_NAME.SCENE_INITIALIZE, oScene);
    }
}