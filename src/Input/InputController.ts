// Imports
import EventEmitter from 'eventemitter3';

import { TObject, TDataList, TValue } from '../Core/Type';
import { EVENT_NAME, GAMEPAD_BUTTON_DEAD_ZONE } from '../Core/Constants';
import { Engine, Store } from '../Core/';
import { InputManager, InputSource } from './';


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


/**
 * Controller options supplied to constructor.
 */
export interface IControllerOptions {
    bAutoStore?: boolean,
    oMapping: TDataList,
    oDeadZone?: Partial<IControllerDeadZoneOptions>
}

const oDefaultControllerOptions = {
    bAutoStore: true,
    oMapping: {}
};


/**
 * Controller class.
 */
export class InputController extends EventEmitter {


    /** Static values for index. */
    private static _oIndex: TValue = {};

    /** Static function for return index. */
    private static _getIndex(sName: string): number {
        if( !this._oIndex[sName] ){
            this._oIndex[sName] = 0;
        }

        return this._oIndex[sName]++;
    }


    /** Engine that created the source. */
    public readonly oEngine: Engine;
    /** Store of the Engine. */
    public readonly oStore: Store;
    /** Input that created the source. */
    public readonly oInput: InputManager;
    /** Last tick time of Controller update. */
    public nUpdate: number = 0;


    /** Source watch by the controller. */
    private _oSource: InputSource;
    /** List of Button states. */
    private _oButtons: TObject<IControllerButton> = {};

    /** Options Controller. */
    private _oOptions: IControllerOptions;
    /** Mapping options of controller. */
    private _oButtonsMapping: TDataList;
    private _oKeysMapping: TDataList;
    /** Deadzone options of controller. */
    private _oDeadZone: IControllerDeadZoneOptions;

    /** Index of Controller for source */
    private _nIndex: number;
    /** Key for Auto Store. */
    private _sStoreKey: string | null = null;


    /** Constructor */
    constructor(oSource: InputSource, oOptions: IControllerOptions) {

        super();

        this.oEngine = oSource.oInput.oEngine;
        this.oStore = this.oEngine.oStore;
        this.oInput = oSource.oInput;
        this._oSource = oSource;

        // Index
        this._nIndex = InputController._getIndex( this._oSource.sKey );

        // Options
        this._oOptions = Object.assign( {}, oDefaultControllerOptions, oOptions );

        this._oButtonsMapping = Object.assign( {}, oOptions.oMapping );
        this._oKeysMapping = this._parseMapping(this._oButtonsMapping);
        this._oDeadZone = Object.assign( {}, oDefaultDeadZoneOptions, oOptions.oDeadZone );

        // Gestion du Store
        if( this._oOptions.bAutoStore ){

            // Création de la KEY de Store
            this._sStoreKey = `${this._oSource.sKey}_${this._nIndex}`;
            this.oStore.setStorableKey(this._sStoreKey);

            // Recupération de la configuration
            this._restore();
        }

        // Écouteur de MAJ de la source
        this._oSource.on(EVENT_NAME.INPUT_SOURCE_UPDATE, (aCodeUpdated: string[]) => {
            this._updateButtons(aCodeUpdated);
        } );
    }

    /** Destructor */
    public destroy(): void {
        this.removeAllListeners();
    }

    /** Get Key of Source. */
    public getSourceKey(): string {
        return this._oSource.sKey;
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

    /** Return if the button has been held for a while. */
    public hasHeld(sName: string, nTime: number): boolean {
        const oButton = this.getButton(sName),
            nTickTime = this.oEngine.getTickTime();

        return oButton.bPressed && nTickTime >= oButton.nPressUpdate + nTime;
    }

    /** Return if Button has released now. */
    public hasReleased(sName: string): boolean {
        const oButton = this.getButton(sName),
            nTickTime = this.oEngine.getTickTime();

        return !oButton.bPressed && nTickTime == oButton.nPressUpdate;
    }


    /** Set Mapping and Store. */
    public setMapping(oMapping: TDataList): void {
        this._oButtonsMapping = oMapping;
        this._oKeysMapping = this._parseMapping(oMapping);
        this._store();
    }

    /** Get Mapping. */
    public getMapping(): TDataList {
        return this._oButtonsMapping;
    }

    /** Set DeadZone and Store. */
    public setDeadZone(oDeadZone: IControllerDeadZoneOptions): void {
        this._oDeadZone = oDeadZone;
        this._store();
    }

    /** Get DeadZone. */
    public getDeadZone(): IControllerDeadZoneOptions {
        return this._oDeadZone;
    }

    
    /** Update Button Value. */
    private _updateButtons(aCode: string[]): void {

        const aUpdated: string[] = [];
        
        // Pour chaque Source Button qui ont changés
        aCode.forEach( sCode => {
            // MAJ du Controller Button correspondant
            if( this._setButtonOfSource(sCode) ){
                aUpdated.push( ...this._oKeysMapping[sCode] );
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
    
    /** Set Button value or press from Code of Button Source */
    private _setButtonOfSource(sCode: string): boolean {
        
        let bUpdated = false;
        const aName = this._oKeysMapping[sCode];

        // Vérification de Mapping existant
        if( aName && aName.length ){

            // Récupération du bouton de la source
            const oSourceButton = this._oSource.getButton(sCode);
            aName.forEach( sName => {

                // Récupération du bouton du controlleur correspondant
                const oButton = this.getButton( sName );

                // Si changement de valeur
                if( oButton.nValue != oSourceButton.nValue ){

                    // MAJ de la valeur et de la date
                    Object.assign( oButton, {
                        nValue: oSourceButton.nValue,
                        nUpdate: this.oEngine.getTickTime()
                    } );

                    // Check if Source Button is pressed with options defined on DeadZone.
                    const sDeadZone = GAMEPAD_BUTTON_DEAD_ZONE[sCode as keyof typeof GAMEPAD_BUTTON_DEAD_ZONE],
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
            } );
        }

        return bUpdated;
    }


    private _parseMapping(oMapping: TDataList): TDataList {
        const oParsedMapping: TDataList = {};

        for( let sName in oMapping ){
            const aCodes = oMapping[sName];
            aCodes.forEach( sCode => {
                if( !oParsedMapping[sCode] ){
                    oParsedMapping[sCode] = [];
                }
                oParsedMapping[sCode].push( sName );
            } );
        }

        return oParsedMapping;
    }

    
    /** Save Mapping and DeadZone into Store. */
    private _store(): boolean {
        let bStored = false;

        // Si cle dispo
        if( this._sStoreKey ){
            this.oStore.set(this._sStoreKey, {
                oMapping: this._oButtonsMapping,
                oDeadZone: this._oDeadZone
            } );

            bStored = true;
        }

        return bStored;
    }

    /** Restore Mapping and DeadZone from Store. */
    private _restore(): boolean {
        let bRestored = false;

        // Si cle dispo
        if( this._sStoreKey ){
            const oData = this.oStore.get(this._sStoreKey);
            // Si DATA déjà STORE une fois
            if( oData ){
                this._oButtonsMapping = oData.oMapping;
                this._oKeysMapping = this._parseMapping(oData.oMapping);
                this._oDeadZone = oData.oDeadZone;
                
                bRestored = true;
            }
        }
        return bRestored;
    }
}