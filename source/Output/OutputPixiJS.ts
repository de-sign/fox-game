// Imports
import * as PIXI from 'pixi.js';

import { Engine } from '../Core';
import { OutputManager, IOutputOptions } from '../Output';
import { ScenePixiJS } from '../Scene';


/**
 * Output options supplied to constructor.
 */
export interface IOutputPixiJSOptions extends IOutputOptions, PIXI.IRendererOptionsAuto {
    bAutoApplyScale?: boolean
}

const oDefaultOutputPixiJSOptions = {
    bAutoApplyScale: false,

    forceCanvas: false,
};


/**
 * Output Manager class.
 * @class
 */
export class OutputPixiJS extends OutputManager {

    
    /** Return reference to the renderer's canvas element. */
    public get view(): PIXI.ICanvas {
        return this._oRenderer.view;
    }


    /** Output option */
    declare _oOptions: IOutputPixiJSOptions;

    /**
     * WebGL renderer if available, otherwise CanvasRenderer.
     * @member {PIXI.Renderer|PIXI.CanvasRenderer}
     */
    declare _oRenderer: PIXI.IRenderer;

    /**
     * The root display container that's rendered.
     * @member {PIXI.Container}
     */
    private _oRenderContainer: PIXI.Container = new PIXI.Container();


    /** Constructor */
    constructor(oEngine: Engine, oOutputOptions?: Partial<IOutputPixiJSOptions>) {

        super(oEngine, Object.assign( {}, oDefaultOutputPixiJSOptions, oOutputOptions ) );

        // Récupération du RENDERER de PixiJS, comme dans PIXI.Application
        this.setRenderer( PIXI.autoDetectRenderer(<PIXI.IRendererOptionsAuto>this._oOptions) );
    }

    /** Destructor */
    public destroy(): void {
        this._oRenderer.destroy();
        super.destroy();
    }


    /** Render function call each tick. */
    public render(): void {

        // RENDER le conteneur PixiJS de la scène
        if( this._oRenderContainer ) {
            this._oRenderer.render(this._oRenderContainer);
        }
        
        super.render();
    }


    /** Function call for initialize Entities use by Output for render. */
    public setSceneOutputEntities( oScene: ScenePixiJS ): void {
        if( oScene.oRenderContainer ){
            this._oRenderContainer.addChild( oScene.oRenderContainer );
        }
    }

    /** Function call for destroy Entities use by Output for render. */
    public unsetSceneOutputEntities( oScene: ScenePixiJS ): void {
        if( oScene.oRenderContainer ){
            this._oRenderContainer.removeChild( oScene.oRenderContainer );
        }
    }

    /** Resize the Renderer */
    protected _resizeView(nWidth: number, nHeight: number): void {
        this._oRenderer.resize(nWidth, nHeight);
        
        // Auto Scale
        if( this._oOptions.hResizeViewTo && this._oOptions.bAutoApplyScale ){
            this._oRenderContainer.scale.set(this.nWidthScale, this.nHeightScale);
        }
    }
}