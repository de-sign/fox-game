import { utils } from 'pixi.js';

import { Engine } from '../Engine/Engine';
import { InputManager, InputSource } from '.';
import { EVENT_NAME } from '..';

/**
 * Input Controller button interface.
 */
export interface IControllerButton {
    sName: string,
    nValue: number,
    bPressed: boolean,
    nUpdate: number,
    nPressUpdate: number
}

/**
 * DeadZone options supplied to Controller options.
 */
export interface IControllerDeadZoneOptions {
    [nLeftStick: string]: number,
    nRightStick: number,
    nLeftTrigger: number,
    nRightTrigger: number
}

const oDefaultDeadZoneOptions: IControllerDeadZoneOptions = {
    nLeftStick: 0.150,
    nRightStick: 0.150,
    nLeftTrigger: 0.115,
    nRightTrigger: 0.115
};

// Liste des DeadZone par Source Button
const oDeadZoneOfSourceButton: { [key: string]: string } = {
    Axe0: 'nLeftStick',
    Axe1: 'nLeftStick',
    Axe2: 'nRightStick',
    Axe3: 'nRightStick',
    Axe0Minus: 'nLeftStick',
    Axe0Plus: 'nLeftStick',
    Axe1Minus: 'nLeftStick',
    Axe1Plus: 'nLeftStick',
    Axe2Minus: 'nRightStick',
    Axe2Plus: 'nRightStick',
    Axe3Minus: 'nRightStick',
    Axe3Plus: 'nRightStick',
    Button6: 'nLeftTrigger',
    Button7: 'nRightTrigger'
};

/**
 * Controller options supplied to constructor.
 */
export interface IControllerOptions {
    oMapping: { [key: string]: string },
    oDeadZone?: Partial<IControllerDeadZoneOptions>
}

/**
 * Controller class.
 */
export class InputController extends utils.EventEmitter {

    /** Input that created the source. */
    public readonly oEngine: Engine;
    /** Engine that created the source. */
    public readonly oInput: InputManager;
    /** Source watch by the controller. */
    private _oSource: InputSource;

    /** List of Button states. */
    private _oButtons: { [key: string]: IControllerButton } = {};
    /** Mapping options of controller. */
    private _oMapping: { [key: string]: string };
    /** Deadzone options of controller. */
    private _oDeadZone: IControllerDeadZoneOptions;
    /** Last tick time of Controller update. */
    public nUpdate: number = 0;

    constructor(oSource: InputSource, oOptions: IControllerOptions) {

        super();

        this.oEngine = oSource.oInput.oEngine;
        this.oInput = oSource.oInput;
        this._oSource = oSource;

        // Options
        this._oMapping = oOptions.oMapping;
        this._oDeadZone = Object.assign( {}, oDefaultDeadZoneOptions, oOptions.oDeadZone);

        // Écouteur de MAJ de la source
        this._oSource.on(EVENT_NAME.INPUT_SOURCE_UPDATE, aCodeUpdated => {
            this._updateButtons(aCodeUpdated);
        } );
    }

    /** Update Button Value. */
    private _updateButtons(aCode: Array<string>): void {

        const aUpdated: Array<string> = [];
        
        // Pour chaque Source Button qui ont changés
        aCode.forEach( sCode => {
            // MAJ du Controller Button correspondant
            if( this._setButtonOfSource(sCode) ){
                aUpdated.push( this._oMapping[sCode] );
            }
        } );

        // MAJ de date si un Controller Button a été MAJ
        if( aUpdated.length ){
            this.nUpdate = this.oEngine.getTickTime();

            // Trigger
            this.emit(EVENT_NAME.INPUT_CONTROLLER_UPDATE, aUpdated);
            this.oInput.emit(EVENT_NAME.INPUT_CONTROLLER_UPDATE, this);
        }
    }

    private _setButtonOfSource(sCode: string): boolean {
        
        let bUpdated = false;
        const sName = this._oMapping[sCode];

        // Vérification de Mapping existant
        if( sName ){

            // Récupération du bouton de la source et du controlleur correspondant
            const oSourceButton = this._oSource.getButton(sCode),
                oButton = this.getButton( sName );

            // Si changement de valeur
            if( oButton.nValue != oSourceButton.nValue ){

                // MAJ de la valeur et de la date
                Object.assign( oButton, {
                    nValue: oSourceButton.nValue,
                    nUpdate: this.oEngine.getTickTime()
                } );

                // Check if Source Button is pressed with options defined on DeadZone.
                const sDeadZone = oDeadZoneOfSourceButton[sName],
                    nDeadZone = this._oDeadZone[sDeadZone] || 0.0,
                    bPressed = Math.abs(oSourceButton.nValue) > nDeadZone;

                // Si changement de pression
                if( oButton.bPressed != bPressed ){

                    // MAJ de la pression et de la date
                    Object.assign( oButton, {
                        bPressed,
                        nPressUpdate: this.oEngine.getTickTime()
                    } );
                }
    
                bUpdated = true;
            }
        }

        return bUpdated;
    }

    /** Get button and create if not exist. */
    public getButton(sName: string): IControllerButton {

        // Créer le boutton s'il n'existe pas
        if( !this._oButtons[sName] ){
            this._oButtons[sName] = {
                sName: sName,
                nValue: 0.0,
                bPressed: false,
                nUpdate: 0,
                nPressUpdate: 0
            };
        }
        
        // Retourne le boutton
        return this._oButtons[sName];
    }

    /** Return if Button is pressed. */
    public isPressed(sName: string): boolean {
        return this.getButton(sName).bPressed;
    }

    /** Return if Button has pressed now. */
    public hasPressed(sName: string): boolean {
        const oButton = this.getButton(sName),
            nTickTime = this.oEngine.getTickTime();

        return oButton.bPressed && nTickTime == oButton.nPressUpdate;
    }

    /** Return if Button has released now. */
    public hasReleased(sName: string): boolean {
        const oButton = this.getButton(sName),
            nTickTime = this.oEngine.getTickTime();

        return !oButton.bPressed && nTickTime == oButton.nPressUpdate;
    }
}