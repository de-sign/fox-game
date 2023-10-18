// Imports
import * as PIXI from 'pixi.js';

import { Engine } from '../Core';
import { OutputManager, IOutputOptions } from '../Output';
import { ScenePixiJS } from '../Scene';


/**
 * Output options supplied to constructor.
 */
export interface IOutputPixiJSOptions extends IOutputOptions {
    oRenderer: PIXI.IRendererOptionsAuto
}

const oDefaultOutputPixiJSOptions = {
    oRenderer: {
        forceCanvas: false
    }
};


/**
 * Output Manager class.
 * @class
 */
export class OutputPixiJS extends OutputManager {

    
    /** Return reference to the renderer's canvas element. */
    public get hView(): PIXI.ICanvas {
        return this._oRenderer.view;
    }
    /** The root display container that's rendered. */
    declare oRootScene: PIXI.Container;
    /** Return size of renderer */
    public get oSizeView(): PIXI.Rectangle {
        return this._oRenderer.screen;
    }
    /** Scale between Original and Current Size of View applied to viewport. */
    public get oScaleScene(): PIXI.ObservablePoint {
        return this.oRootScene.scale;
    }


    /** Output option */
    declare _oOptions: IOutputPixiJSOptions;

    /**
     * WebGL renderer if available, otherwise CanvasRenderer.
     * @member {PIXI.Renderer|PIXI.CanvasRenderer}
     */
    declare _oRenderer: PIXI.IRenderer;


    /** Constructor */
    constructor(oEngine: Engine, oOutputOptions?: Partial<IOutputPixiJSOptions>) {

        super(oEngine, Object.assign( {}, oDefaultOutputPixiJSOptions, oOutputOptions ) );

        // Creation du Root Scene
        this.oRootScene = new PIXI.Container();
        // Récupération du RENDERER de PixiJS, comme dans PIXI.Application
        this._setRenderer( PIXI.autoDetectRenderer(this._oOptions.oRenderer) );
    }

    /** Destructor */
    public destroy(): void {
        this._oRenderer.destroy();
        super.destroy();
    }


    /** Render function call each tick. */
    public render(): void {

        // RENDER le conteneur PixiJS
        if( this.oRootScene.children.length ) {
            this._oRenderer.render(this.oRootScene);
        }
        
        super.render();
    }


    /** Function call for initialize Entities use by Output for render. */
    public setSceneOutputEntities( oScene: ScenePixiJS ): void {
        if( oScene.oRenderScene ){
            this.oRootScene.addChild( oScene.oRenderScene );
        }
    }

    /** Function call for destroy Entities use by Output for render. */
    public unsetSceneOutputEntities( oScene: ScenePixiJS ): void {
        if( oScene.oRenderScene ){
            this.oRootScene.removeChild( oScene.oRenderScene );
        }
    }

    /** Resize the Renderer */
    protected _resizeView(nWidth: number, nHeight: number): void {
        this._oRenderer.resize(nWidth, nHeight);
    }

    /** Apply scale to Root Scene */
    protected _scaleScene(nScaleX: number, nScaleY: number): void {
        this.oRootScene.scale.set(nScaleX, nScaleY);
    }
}