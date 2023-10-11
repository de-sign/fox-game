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
    public oScene: Scene | null = null;


    /** Scene option */
    private _oOptions: ISceneOptions;


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
        if( this.oScene ){
            this.oScene.update();

            // Trigger
            this.emit(EVENT_NAME.SCENE_UPDATE, this.oScene);
        }
    }

    /** Render Current Scene */
    public render(): void {
        if( this.oScene ){
            this.oScene.render();

            // Trigger
            this.emit(EVENT_NAME.SCENE_RENDER, this.oScene);
        }
    }
    

    /** Change Current Scene */
    public changeScene(oNewScene: new (oMScene: SceneManager) => Scene, ...aArguments: []): void {
        this.oEngine.once(EVENT_NAME.ENGINE_UPDATE, () => {
            // Enlève et détruit la scène courante
            this._unsetScene();

            // Ajoute la nouvelle scène et la défini comme courante
            this._setScene(oNewScene, aArguments);

            // Trigger
            this.emit(EVENT_NAME.SCENE_CHANGE);
        } );
    }



    /** Remove and destroy current Scene. */
    private _unsetScene(): void {

        // Enlève et détruit la scène courante
        const oScene = this.oScene;
        if( oScene ){
            oScene.destroy();
            this.oScene = null;

            // Trigger
            this.emit(EVENT_NAME.SCENE_DESTROY, oScene);
        }
    }

    /** Add New Scene like current. */
    private _setScene(oNewScene: new (oMScene: SceneManager) => Scene, aArguments: []): void {
            
        // Ajoute la nouvelle scène et la défini comme courante
        this.oScene = new oNewScene(this);
        this.oScene.initialize.apply(this.oScene, aArguments);

        // Trigger
        this.emit(EVENT_NAME.SCENE_INITIALIZE, this.oScene);
    }
}