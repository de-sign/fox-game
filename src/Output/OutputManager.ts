// Imports
import EventEmitter from 'eventemitter3';
import * as PIXI from 'pixi.js';

import { EVENT_NAME, OUTPUT_ASPECT_TYPE } from '../Core/Constants';

import { Engine } from '../Core/';
import { Scene } from '../Scene/';


/**
 * Output options supplied to constructor.
 */
export interface IOutputOptions {
    hAppendViewTo?: HTMLElement,
    nWidth?: number,
    nHeight?: number,
    nAspectType?: number,
    hResizeViewTo?: HTMLElement | Window,
    
    oRenderer?: any,
}

const oDefaultOutputOptions = {
    hAppendViewTo: document.body,
    nWidth: 800,
    nHeight: 600,
    nAspectType: OUTPUT_ASPECT_TYPE.STRETCH,
    hResizeViewTo: window
};


/**
 * Output Manager class.
 * @class
 */
export abstract class OutputManager extends EventEmitter {
    
    
    /** Engine that created the manager. */
    public readonly oEngine: Engine;

    /** Return reference to the renderer's canvas element. */
    public get hView(): any {
        return null;
    }
    /** Aspect Ratio used for Render Scene */
    private _nAspectType: number;
    public set nAspectType(nAspectType: number) {
        this._nAspectType = nAspectType;
        this.resize();
    }
    public get nAspectType(): number {
        return this._nAspectType;
    }
    /** Return size of renderer. */
    public get oSizeView(): any {
        return null;
    }
    /** Return original size of renderer. */
    public readonly oInitialResolution: PIXI.Rectangle;
    /** Return calculated size of renderer. */
    public readonly oResolution: PIXI.Rectangle;
    /** Scale between Original and Current Size of View applied to viewport. */
    public get oScaleScene(): any {
        return null;
    }


    /** Output option */
    protected _oOptions: IOutputOptions;
    /** Render of the manager. */
    protected _oRenderer: any = null;
    /** Root Scene of the manager. */
    protected _oRootScene: any;

    /** Constructor */
    constructor(oEngine: Engine, oOutputOptions?: IOutputOptions) {

        super();

        this.oEngine = oEngine;

        // Options par défaut
        this._oOptions = Object.assign( {}, oDefaultOutputOptions, oOutputOptions );

        // Original size
        this._nAspectType = <number>this._oOptions.nAspectType;
        this.oInitialResolution = new PIXI.Rectangle(0, 0, this._oOptions.nWidth, this._oOptions.nHeight);
        this.oResolution = new PIXI.Rectangle(0, 0, this._oOptions.nWidth, this._oOptions.nHeight);

        // Ecouteurs pour RESIZE
        this.oEngine.addWindowListener('resize', () => {
            if( this._oRenderer && this._nAspectType != OUTPUT_ASPECT_TYPE.INITIAL ){
                this.resize();
            }
        } );
    }

    /** Destructor */
    public destroy(): void {
        this.removeAllListeners();
    }


    /** Render function call each tick. */
    public render(): void {
        // Trigger
        this.emit(EVENT_NAME.OUTPUT_RENDER);
    }


    /** Function call for initialize Entities used by Output for render. */
    public linkToScene( oScene: Scene ): void {
        if( this.oEngine.isDebugMode() ){
            console.log('OutputManager.linkToScene', this, oScene);
        }
    }

    /** Function call for destroy Entities used by Output for render. */
    public unlinkToScene( oScene: Scene ): void {
        if( this.oEngine.isDebugMode() ){
            console.log('OutputManager.unlinkToScene', this, oScene);
        }
    }
    

    /** Change Aspect mode of renderer */
    public setAspect(_nAspectType: number): void {
        if( this._nAspectType != _nAspectType ){
            this._nAspectType = _nAspectType;
            this.resize();
        }
    }

    /** Resize the Renderer with Options set */
    public resize(bInstantly: boolean = false): void {

        let nResizeWidth: number,
            nResizeHeight: number,
            nScaleX: number = 1,
            nScaleY: number = 1,
            nResolutionWidth: number,
            nResolutionHeight: number;

        const fResize = () => {
            // Redimensionnement de la VIEW
            this._resizeView(nResizeWidth, nResizeHeight);
            // SCALE de la VIEW
            this._scaleScene(nScaleX, nScaleY);
            // Modification de la résolution affiché
            this.oResolution.width = nResolutionWidth;
            this.oResolution.height = nResolutionHeight;
            // Trigger
            this.emit(EVENT_NAME.OUTPUT_RESIZE, this);
        };


        // Si aucun type d'aspect particulier
        if( this._nAspectType == OUTPUT_ASPECT_TYPE.INITIAL ) {
            // Redimensionnement aux dimensions transmises
            nResizeWidth = this.oInitialResolution.width;
            nResizeHeight = this.oInitialResolution.height;
            // SCALE de base
            nScaleX = nScaleY = 1;
            // Resolution aux dimensions transmises
            nResolutionWidth = this.oInitialResolution.width;
            nResolutionHeight = this.oInitialResolution.height;
        }
        // Sinon gestion des aspects particuliés
        else {

            let nTargetWidth, nTargetHeight;
            
            // Récupération des dimensions de la cible
            if( this._oOptions.hResizeViewTo == window ){
                // Récupération de WINDOW
                nTargetWidth = this._oOptions.hResizeViewTo.innerWidth;
                nTargetHeight = this._oOptions.hResizeViewTo.innerHeight;
            }
            else {
                // Récupération de HTMLElement
                const hResizeViewTo = <HTMLElement>this._oOptions.hResizeViewTo;
                nTargetWidth = hResizeViewTo.clientWidth;
                nTargetHeight = hResizeViewTo.clientHeight;
            }

            // Calcul des SCALE
            const nScaleWidth = nTargetWidth / this.oInitialResolution.width,
                nScaleHeight = nTargetHeight / this.oInitialResolution.height,
                nMinScale = Math.min(nScaleWidth, nScaleHeight);


            // Redimensionnement en fonction de l'aspect choisi
            if( this._nAspectType == OUTPUT_ASPECT_TYPE.KEEP_RATIO ) {
                // Redimensionnement en gardant le ratio d'aspect
                nResizeWidth = this.oInitialResolution.width * nMinScale;
                nResizeHeight = this.oInitialResolution.height * nMinScale;
            } else {
                // Redimensionnement aux dimensions de la cible
                nResizeWidth = nTargetWidth;
                nResizeHeight = nTargetHeight;
            }


            // MAJ des SCALE en fonction de l'aspect choisi
            switch( this._nAspectType ){
                // SCALE en gardant le ratio d'aspect
                case OUTPUT_ASPECT_TYPE.KEEP_RATIO :
                case OUTPUT_ASPECT_TYPE.KEEP_RATIO_AND_EXTEND :
                    nScaleX = nScaleY = nMinScale;
                    break;

                // SCALE de base
                case OUTPUT_ASPECT_TYPE.EXTEND :
                    nScaleX = nScaleY = 1;
                    break;

                // SCALE d'étirement 
                case OUTPUT_ASPECT_TYPE.STRETCH :
                    nScaleX = nScaleWidth;
                    nScaleY = nScaleHeight;
                    break;
            }


            // MAJ de la Resolution en fonction de l'aspect choisi
            switch( this._nAspectType ){
                // Résolution aux dimensions transmises
                case OUTPUT_ASPECT_TYPE.KEEP_RATIO :
                case OUTPUT_ASPECT_TYPE.STRETCH :
                    nResolutionWidth = this.oInitialResolution.width;
                    nResolutionHeight = this.oInitialResolution.height;
                    break;

                // Resolution en fonction du SCALE et de la VIEW
                case OUTPUT_ASPECT_TYPE.KEEP_RATIO_AND_EXTEND :
                    nResolutionWidth = nTargetWidth / nScaleX;
                    nResolutionHeight = nTargetHeight / nScaleY;
                    break;

                // Resolution aux dimensions de la VIEW
                case OUTPUT_ASPECT_TYPE.EXTEND :
                    nResolutionWidth = nTargetWidth;
                    nResolutionHeight = nTargetHeight;
                    break;
            }

        }

        if( bInstantly ){
            fResize();
        } else {
            this.oEngine.once(EVENT_NAME.ENGINE_RENDER, () => fResize() );
        }
    }

    
    /** Set the renderer, add to DOM and resize him  */
    protected _setRenderer(oRenderer: any): void {
        
        // Initialisation du RENDERER
        this._oRenderer = oRenderer;

        this.oEngine.once(EVENT_NAME.ENGINE_START, () => {
            // Insertion du Canvas
            if( this._oOptions.hAppendViewTo ){
                this._oOptions.hAppendViewTo.append( this.hView );
            }
            
            // Mise en echelle
            this.resize(true);
        } );
    }
    
    /** Resize the Renderer */
    protected _resizeView(nWidth: number, nHeight: number): void {
        if( this.oEngine.isDebugMode() ){
            console.log('OutputManager._resizeView', this, nWidth, nHeight);
        }
    }

    /** Apply scale to Root Scene */
    protected _scaleScene(nScaleX: number, nScaleY: number): void {
        if( this.oEngine.isDebugMode() ){
            console.log('OutputManager._scaleScene', this, nScaleX, nScaleY);
        }
    }

}