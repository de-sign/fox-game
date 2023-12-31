// Imports
import EventEmitter from 'eventemitter3';

import { TObject, TData } from '../Core/Type';
import { Engine } from '../Core/';
import { InputManager, InputController, IControllerOptions } from './';


/**
 * Input source button interface.
 */
export interface ISourceButton {
    sCode: string,
    sName: string,
    nValue: number,
    nUpdate: number
}


/**
 * Input source class.
 */
export class InputSource extends EventEmitter {

    /** Input that created the source. */
    public readonly oEngine: Engine;
    /** Engine that created the source. */
    public readonly oInput: InputManager;

    /** Type of source */
    public readonly nType: number;
    /** Key of source */
    public readonly sKey: string;
    /** Last tick time of source update. */
    public nUpdate: number = 0;


    /** List of Button states. */
    protected _oButtons: TObject<ISourceButton> = {};
    /** List of Button name define by inherit. */
    protected _oButtonsName: TData = {};


    /** Constructor */
    constructor(oInput: InputManager, nType: number, sKey: string) {
        super();
        
        this.oEngine = oInput.oEngine;
        this.oInput = oInput;

        this.nType = nType;
        this.sKey = sKey;
    }

    /** Destructor */
    public destroy(): void {
        this.removeAllListeners();
    }
    

    /** Update of Button states via inherite. */
    public update(): boolean {
        return false;
    }

    /** Catch event and list button states change for next update tick. */
    public addEvent(eEvent: Event): void {
        if( this.oEngine.isDebugMode() ){
            console.log('InputSource.addEvent', this, eEvent);
        }
    }


    /** Get button and create if not exist. */
    public getButton(sCode: string): ISourceButton {

        // Créer le boutton s'il n'existe pas
        if( !this._oButtons[sCode] ){
            this._oButtons[sCode] = {
                sCode: sCode,
                sName: this._getButtonsName(sCode),
                nValue: 0.0,
                nUpdate: 0
            };
        }
        
        // Retourne le boutton
        return this._oButtons[sCode];
    }

    /** Create a Controller */
    public createController(oOptions: IControllerOptions): InputController {
        return this.oInput.createController(this, oOptions);
    }


    /** Get button name defined on _oButtonsName */
    private _getButtonsName(sCode: string): string {
        return this._oButtonsName[sCode] || sCode;
    }

    /** Generic setter for SourceButton value and update. */
    protected _setButtonValue(sCode: string, nValue: number): boolean {
        let bUpdated = false;

        // MAJ du bouton de la source si besoin
        const oButton = this.getButton(sCode);
        if( oButton.nValue != nValue ){
            Object.assign( oButton, {
                nValue,
                nUpdate: this.oEngine.getTickTime()
            } );

            bUpdated = true;
        }

        return bUpdated;
    }
}