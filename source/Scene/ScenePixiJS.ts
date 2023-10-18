// Imports
import * as PIXI from 'pixi.js';

import { SceneManager, Scene } from './';

/**
 * Class to create a new Scene, use for be extend.
 * 
 * @class
 */
export class ScenePixiJS extends Scene {

    /**
     * The root display container that's rendered.
     * @member {PIXI.Container}
     */
    public oRenderScene: PIXI.Container = new PIXI.Container();


    /** Constructor */
    constructor(oMScene: SceneManager) {
        super(oMScene);
    }

    /** Destructor */
    public destroy(): void {
        this.oRenderScene.destroy( { children: true } );
    }
}