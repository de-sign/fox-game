// Imports
import * as PIXI from 'pixi.js';
import '@pixi/math-extras';

import EventEmitter from 'eventemitter3';
import { EVENT_NAME, Engine } from '../Core';
import { OutputManager } from './';
import { ScenePixiJS } from '../Scene';


/**
 * Class to create a new Scene, use for be extend.
 * 
 * @class
 */
export class CameraPixiJS extends EventEmitter {

    /** Engine use for update the Scene. */
    public oEngine: Engine;
    /** Output Manager */
    public oOutput: OutputManager;

    /** Position of the center of the camera. */
    public oPosition: PIXI.Point = new PIXI.Point(0, 0);
    /** Zoom */
    public nZoom: number = 1;
    /** Rotation */
    public nAngle: number = 0;

    /** Entity follow by camera. */
    public oTarget: PIXI.DisplayObject | null = null;
    /** Restriction Area for the camera. */
    public oRestrictionArea: PIXI.Rectangle | null = null;

    /** The world container watch by camera. */
    private _oRenderCamera: PIXI.Container = new PIXI.Container;


    /** Constructor */
    constructor(oEngine: Engine) {
        super();
        
        this.oEngine = oEngine;
        this.oOutput = oEngine.oOutput;

        this._centerInView();
        this.oOutput.on(EVENT_NAME.OUTPUT_RESIZE, () => this._centerInView());
    }

    /** Destructor */
    public destroy(): void {
        this._oRenderCamera.destroy( { children: true } );
    }


    /** Update state of camera. Called in Scene.render(). */
    public update(): void {

        let aUpdate = [];

        // Suit la position de la cible
        if( this.oTarget ){
            this.oPosition.set(this.oTarget.x, this.oTarget.y);
        }
        // Et se limite à la zone de restriction
        this._restrictPosition();


        // Update Position
        if( !this._oRenderCamera.pivot.equals(this.oPosition) ){
            this._oRenderCamera.pivot.copyFrom(this.oPosition);
            aUpdate.push('position');
        }

        // Update Scale
        if( this.nZoom != this._oRenderCamera.scale.x || this.nZoom != this._oRenderCamera.scale.y ){
            this._oRenderCamera.scale.set(this.nZoom, this.nZoom);
            aUpdate.push('zoom');
        }

        // Update Rotation
        if( this.nAngle != this._oRenderCamera.angle ){
            this._oRenderCamera.angle = this.nAngle;
            aUpdate.push('angle');
        }

        if( aUpdate.length ){
            this.emit(EVENT_NAME.CAMERA_UPDATE, aUpdate);
        }
    }
    
    /** Watch World of Scene and render result on her RenderContainer. */
    public linkTo(oScene: ScenePixiJS): void {
        oScene.oRenderScene.addChild( this._oRenderCamera );
        this._oRenderCamera.addChild( oScene.oWorld );
    }
    
    /** UnWatch World of Scene. */
    public unlinkTo(oScene: ScenePixiJS): void {
        oScene.oRenderScene.removeChild( this._oRenderCamera );
        this._oRenderCamera.removeChild( oScene.oWorld );
    }

    /** Position of Camera to the World. */
    public getSceneBounds(): PIXI.Rectangle {

        // Setup de la Matrice
        const oMatrix = new PIXI.Matrix(),
            oResolution = this.oOutput.oResolution,
            oCenter = this.oPosition,
            nHalfWidth = Math.floor(oResolution.width / 2),
            nHalfHeight = Math.floor(oResolution.height / 2),
            nLeft = oCenter.x - nHalfWidth,
            nTop = oCenter.y - nHalfHeight,
            nRight = nLeft + oResolution.width,
            nBottom = nTop + oResolution.height,
            nScale = 1 / this.nZoom;
            
        oMatrix
            .translate(-oCenter.x, -oCenter.y)
            .rotate(this.nAngle * Math.PI / 180)
            .scale(nScale, nScale)
            .translate(oCenter.x, oCenter.y);

        // Application de la matrice aux points du Rectangle de la Camera
        const aPoints = [
                new PIXI.Point(nLeft, nTop), // TopLeft
                new PIXI.Point(nRight, nTop), // TopRight
                new PIXI.Point(nLeft, nBottom), // BottomLeft
                new PIXI.Point(nRight, nBottom)  // BottomRight
            ],
            aPositionsX: number[] = [],
            aPositionsY: number[] = [];

        aPoints.forEach( oPoint => {
            const oOrientedPoint = oMatrix.apply(oPoint);
            aPositionsX.push(oOrientedPoint.x);
            aPositionsY.push(oOrientedPoint.y);
        } );

        // Récupération du point TopLeft et BottomRight
        const oTopLeft = new PIXI.Point( Math.min(...aPositionsX), Math.min(...aPositionsY) ),
            oBottomRight = new PIXI.Point( Math.max(...aPositionsX), Math.max(...aPositionsY) ),
            oSizeVector = oBottomRight.subtract(oTopLeft);

        return new PIXI.Rectangle(oTopLeft.x, oTopLeft.y, oSizeVector.x, oSizeVector.y);
    }


    /** Set real position in center of View. */
    private _centerInView(): void {

        const oResolution = this.oOutput.oResolution,
            nHalfWidth = Math.floor(oResolution.width / 2),
            nHalfHeight = Math.floor(oResolution.height / 2);
        
        // Positionne la camera au centre de l'écran
        this._oRenderCamera.position.set( nHalfWidth, nHalfHeight );

        this.emit(EVENT_NAME.CAMERA_UPDATE, ['size']);
    }

    /** Reposition camera into Restriction Area. */
    private _restrictPosition(): void {

        // Update position via restriction
        if( this.oRestrictionArea ){
            const oCameraBounds = this.getSceneBounds();

            // Si la largeur de restriction est plus petite que la camera
            if( this.oRestrictionArea.width < oCameraBounds.width ){
                this.oPosition.x = Math.floor(this.oRestrictionArea.width / 2);
            } else {
                // Trop à gauche
                if( oCameraBounds.x < this.oRestrictionArea.x ){
                    this.oPosition.x = Math.floor(oCameraBounds.width / 2);
                }
                // Trop à droite
                else if( oCameraBounds.right > this.oRestrictionArea.right ) {
                    this.oPosition.x = this.oRestrictionArea.right - Math.floor(oCameraBounds.width / 2);
                }
            }

            // Si la hauteur de restriction est plus petite que la camera
            if( this.oRestrictionArea.height < oCameraBounds.height ){
                this.oPosition.y = Math.floor(this.oRestrictionArea.height / 2);
            } else {
                // Trop en haut
                if( oCameraBounds.y < this.oRestrictionArea.y ){
                    this.oPosition.y = Math.floor(oCameraBounds.height / 2);
                }
                // Trop en bas
                else if( oCameraBounds.bottom > this.oRestrictionArea.bottom ) {
                    this.oPosition.y = this.oRestrictionArea.bottom - Math.floor(oCameraBounds.height / 2);
                }
            }
        }
    }
}