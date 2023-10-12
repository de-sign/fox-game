// Imports
import EventEmitter from 'eventemitter3';

import { EVENT_NAME } from '../Core/Constants';
import { Engine } from '../Core';
import { Scene } from '../Scene';


/**
 * Output options supplied to constructor.
 */
export interface IOutputOptions {
    hAppendViewTo?: HTMLElement,
    nWidth?: number,
    nHeight?: number,
    hResizeViewTo?: HTMLElement | Window,
    bKeepAspectRatio?: boolean
}

const oDefaultOutputOptions = {
    hAppendViewTo: document.body,
    nWidth: 800,
    nHeight: 600,
    bKeepAspectRatio: false
};


/**
 * Output Manager class.
 * @class
 */
export class OutputManager extends EventEmitter {
    
    
    /** Engine that created the manager. */
    public readonly oEngine: Engine;
    /** Width scale between Width Option and Resize target. */
    public nWidthScale: number = 1;
    /** Height scale between Height Option and Resize target. */
    public nHeightScale: number = 1;
    /** Return reference to the renderer's canvas element. */
    public get view(): any {
        return null;
    }

    /** Output option */
    protected _oOptions: IOutputOptions;
    /** Render of the manager. */
    protected _oRenderer: any = null;


    /** Constructor */
    constructor(oEngine: Engine, oOutputOptions?: IOutputOptions) {

        super();

        this.oEngine = oEngine;

        // Options par défaut
        this._oOptions = Object.assign( {}, oDefaultOutputOptions, oOutputOptions );

        // Ecouteurs pour RESIZE
        if( this._oOptions.hResizeViewTo ){
            this.oEngine.addWindowListener('resize', () => {
                if( this._oRenderer ){
                    this.oEngine.once(EVENT_NAME.ENGINE_RENDER, () => this.resize() );
                }
            } );
        }
    }

    /** Destructor */
    public destroy(): void {
        this.removeAllListeners();
    }


    /** Set the renderer, add to DOM and resize him  */
    public setRenderer(oRenderer: any): void {
        
        // Initialisation du RENDERER
        this._oRenderer = oRenderer;

        this.oEngine.once(EVENT_NAME.ENGINE_START, () => {
            // Insertion du Canvas
            if( this._oOptions.hAppendViewTo ){
                this._oOptions.hAppendViewTo.append( this.view );
            }
            
            // Mise en echelle
            this.resize();
        } );
    }

    /** Render function call each tick. */
    public render(): void {
        // Trigger
        this.emit(EVENT_NAME.OUTPUT_RENDER);
    }
    

    /** Function call for initialize Entities use by Output for render. */
    public setSceneOutputEntities( oScene: Scene ): void {
        if( this.oEngine.isDebugMode() ){
            console.log('OutputManager.setSceneOutputEntities', this, oScene);
        }
    }

    /** Function call for destroy Entities use by Output for render. */
    public unsetSceneOutputEntities( oScene: Scene ): void {
        if( this.oEngine.isDebugMode() ){
            console.log('OutputManager.unsetSceneOutputEntities', this, oScene);
        }
    }


    /** Resize the Renderer with Options set */
    public resize(): void {

        // Si cible défini pour redimensionnement
        if( this._oOptions.hResizeViewTo ) {

            let nTargetWidth, nTargetHeight;
            
            // Redimensionnement aux dimensions de la cible
            if( this._oOptions.hResizeViewTo == window ){
                // Récupération des dimensions de WINDOW
                nTargetWidth = this._oOptions.hResizeViewTo.innerWidth;
                nTargetHeight = this._oOptions.hResizeViewTo.innerHeight;
            }
            else {
                // Récupération des dimensions de HTMLElement
                const hResizeViewTo = <HTMLElement>this._oOptions.hResizeViewTo;
                nTargetWidth = hResizeViewTo.clientWidth;
                nTargetHeight = hResizeViewTo.clientHeight;
            }

            // MAJ des SCALE
            const nWidthScale = nTargetWidth / <number>this._oOptions.nWidth,
                nHeightScale = nTargetHeight / <number>this._oOptions.nHeight;

            // Si AscpectRatio à garder
            if( this._oOptions.bKeepAspectRatio ){
                const nMinScale = Math.min(nWidthScale, nHeightScale);

                // MAJ des SCALE
                this.nWidthScale = nMinScale;
                this.nHeightScale = nMinScale;
            
                this._resizeView(
                    Math.floor(<number>this._oOptions.nWidth * nMinScale),
                    Math.floor(<number>this._oOptions.nHeight * nMinScale)
                );
            }
            // Sinon BALEC
            else {

                // MAJ des SCALE
                this.nWidthScale = nWidthScale;
                this.nHeightScale = nHeightScale;
            
                this._resizeView(nTargetWidth, nTargetHeight);
            }

        }
        // Sinon Redimensionnement aux dimensions transmises
        else {

            // MAJ des SCALE
            this.nWidthScale = 1;
            this.nHeightScale = 1;

            this._resizeView(<number>this._oOptions.nWidth, <number>this._oOptions.nHeight);
        }
        
        // Trigger
        this.emit(EVENT_NAME.OUTPUT_RESIZE, this);
    }
    
    /** Resize the Renderer */
    protected _resizeView(nWidth: number, nHeight: number): void {
        if( this.oEngine.isDebugMode() ){
            console.log('OutputManager.resizeView', this, nWidth, nHeight);
        }
    }

}