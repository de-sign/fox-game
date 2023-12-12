// Imports
import EventEmitter from 'eventemitter3';
import * as PIXI from 'pixi.js';

import { TObject, TCallback } from '../Core/Type';
import { EVENT_NAME } from '../Core/Constants';
import { OutputManager } from '.';


/** Output Transition Definition Interface */
export interface IOutputEffect {
    fInitialize?: TCallback,
    fDestroy?: TCallback,
    oMask?: PIXI.Container,
    fEffect: TCallback
}


/**
 * Output Transition class.
 * @class
 */
export class OutputEffect extends EventEmitter {


    public static define( oTransitions: TObject<IOutputEffect> ): void {
        Object.assign( this._oDefinitions, oTransitions );
    }

    private static _oDefinitions: TObject<IOutputEffect> = {
        NONE: {
            fEffect: fResolve => fResolve()
        }
    };


    public readonly oOutput: OutputManager;

    public get oMask(): PIXI.Container | undefined {
        return this._oEffect.oMask;
    }

    private _oTarget: PIXI.Container;
    private _oEffect: IOutputEffect;
    private _fResize: TCallback | null = null;

    constructor( oOutput: OutputManager, oTarget: PIXI.Container, oEffect: IOutputEffect ) {
        super();

        this.oOutput = oOutput;
        this._oTarget = oTarget;
        this._oEffect = oEffect;
    }

    public destroy(): void {
        this.removeAllListeners();
        this._unsetMask();
    }


    public play( oOptions?: TObject ): this {

        const oPromise = new Promise( fResolve => {
            this._setMask();
            this._oEffect.fEffect.call(this, fResolve, oOptions);
        } );

        oPromise.then( () => {
            this._unsetMask();

            this.emit(EVENT_NAME.TRANSITION_END, this );
        } );

        return this;
    }


    private _setMask(): void {

        const oMask = this.oMask;

        if( oMask ){
            this._oTarget.addChild( oMask );
            this._oTarget.mask = oMask;
            this._centerMask();

            this._fResize = this._centerMask.bind(this);
            this.oOutput.on(EVENT_NAME.OUTPUT_RESIZE, this._fResize);
        }
    }

    private _unsetMask(): void {

        const oMask = this.oMask;

        if( oMask ){
            this._oTarget.removeChild( oMask );
            this._oTarget.mask = null;

            if( this._fResize ){
                this.oOutput.off(EVENT_NAME.OUTPUT_RESIZE, this._fResize);
            }
        }
    }

    private _centerMask(): void {
        const oMask = this.oMask;
        if( oMask ){
            oMask.pivot.set( oMask.width / 2, oMask.height / 2 );
            oMask.position.set( this.oOutput.oResolution.width / 2, this.oOutput.oResolution.height / 2 );
        }
    }

}