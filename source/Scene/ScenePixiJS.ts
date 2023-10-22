// Imports
import * as PIXI from 'pixi.js';

import { SceneManager, Scene } from './';
import { CameraPixiJS } from '../Output';

/**
 * Class to create a new Scene, use for be extend.
 * 
 * @class
 */
export class ScenePixiJS extends Scene {

    /**
     * The Scene display container that's rendered.
     * @member {PIXI.Container}
     */
    public readonly oRenderScene: PIXI.Container = new PIXI.Container();
    /** The world container. */
    public readonly oWorld: PIXI.Container = new PIXI.Container();
    /** The Camera who watch the world and render it via Scene container. */
    public readonly oCamera: CameraPixiJS;


    /** Constructor */
    constructor(oMScene: SceneManager) {
        super(oMScene);
        
        this.oCamera = new CameraPixiJS(this.oEngine);
    }

    /** Destructor */
    public destroy(): void {
        this.oCamera.unlinkTo(this);
        
        this.oCamera.destroy();
        this.oWorld.destroy( { children: true } );
        this.oRenderScene.destroy( { children: true } );
    }

    public initialize(): void {
        this.oCamera.linkTo(this);
    }

    public render(): void {
        this.oCamera.update();
    }
}