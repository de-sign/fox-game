// Imports
import EventEmitter from 'eventemitter3';

import { TObject } from '../Core/Type';
import { EVENT_NAME, INPUT_SOURCE_TYPE } from '../Core/Constants';
import { Engine } from '../Core';
import { InputSource, KeyboardSource, GamepadSource, InputController, IControllerOptions } from '.';


/**
 * Input options supplied to constructor.
 */
export interface IInputOptions {
    bKeyboard?: boolean,
    bGamepad?: boolean,
    bMouse?: boolean, // Not DEV for moment.
    bTouch?: boolean, // Not DEV for moment.

    bAutoCreateController?: boolean,
    oControllersOptions: { [nKey: number]: IControllerOptions }
}

const oDefaultInputOptions = {
    bKeyboard: true,
    bGamepad: true,
    bMouse: false,
    bTouch: false,

    bAutoCreateController: true,
    oControllerOptions: {
        [INPUT_SOURCE_TYPE.KEYBOARD]: null,
        [INPUT_SOURCE_TYPE.GAMEPAD]: null,
        [INPUT_SOURCE_TYPE.MOUSE]: null,
        [INPUT_SOURCE_TYPE.TOUCH]: null
    }
};


/**
 * Input Manager class.
 * @class
 */
export class InputManager extends EventEmitter {

    /** Engine that created the manager. */
    public readonly oEngine: Engine;
    /** Last tick time of one source update. */
    public nUpdate: Number = 0;
    /** List of multiple input created by manager. */
    public oSources: TObject<InputSource | null> = {};
    /** List of controllers */
    public aControllers: InputController[] = [];

    /** Keyboard API */
    public oAPIKeyboard: any = null;
    /** Gamepad API */
    public aAPIGamepads: (Gamepad | null)[] | null = null;


    /** Input option */
    private _oOptions: IInputOptions;
    

    /** Constructor */
    constructor(oEngine: Engine, oInputOptions?: IInputOptions) {

        super();

        this.oEngine = oEngine;

        // Options par défaut
        this._oOptions = Object.assign( {}, oDefaultInputOptions, oInputOptions );
        
        this.oEngine.once(EVENT_NAME.ENGINE_START, () => {
            // Création de source clavier si défini dans option
            if( this._oOptions.bKeyboard ){
                this._createKeyboard();
            }
    
            // Récupèration des Gamepads
            if( this._oOptions.bGamepad ){
                this._createGamepads();
            }
        } );

        if( this._oOptions.bAutoCreateController ){
            this.on(EVENT_NAME.INPUT_SOURCE_CREATE, oSource => {
                this.createController(oSource);
            } );
        }
    }

    /** Destructor */
    public destroy(): void {
        // Remove Listener
        this.removeAllListeners();

        // Destroy references
        Object.values(this.oSources).forEach( oSource => oSource?.destroy() );
        this.aControllers.forEach( oController => oController.destroy() );
    }


    /** Updated all sources and update last tick time if one source updated. */
    public update(): void {
        let bOneSourceUpdated = false;

        // MAJ des Gamepads
        if( this._oOptions.bGamepad ){
            this._createGamepads();
        }

        // MAJ des sources
        Object.values(this.oSources).forEach( (oSource: InputSource | null) => {
            if( oSource?.update() ){
                bOneSourceUpdated = true;
                // Trigger
                this.emit(EVENT_NAME.INPUT_SOURCE_UPDATE, oSource);
            }
        } );

        // MAJ de date si une source a été MAJ
        if( bOneSourceUpdated ){
            this.nUpdate = this.oEngine.getTickTime();
        }

        // Trigger
        this.emit(EVENT_NAME.INPUT_UPDATE, bOneSourceUpdated);
    }


    /** Create a Controller */
    public createController(oSource: InputSource, oOptions?: Partial<IControllerOptions>): InputController {

        oOptions = Object.assign({}, this._oOptions.oControllersOptions[oSource.nType], oOptions);

        // Création
        const oController = new InputController(oSource, <IControllerOptions>oOptions);
        this.aControllers.push(oController);

        // Trigger
        this.emit(EVENT_NAME.INPUT_CONTROLLER_CREATE, oController);

        return oController;
    }


    /** Get Source and create if not exist. */
    private _getSource(nType: number, ...aArguments: any[]): InputSource | null {

        let sKey: string = '',
            oSource: InputSource | null;

        // Création de la KEY
        switch( nType ){
            case INPUT_SOURCE_TYPE.KEYBOARD:
                sKey = 'Keyboard';
                break;

            case INPUT_SOURCE_TYPE.GAMEPAD:
                sKey = `Gamepad${aArguments[0].index}`;
                break;
        }

        oSource = this.oSources[sKey];

        // Si pas de Source pour la KEY
        if( oSource === undefined ){

            // Création de la source
            switch( nType ){
                case INPUT_SOURCE_TYPE.KEYBOARD:
                    oSource = new KeyboardSource(this, sKey);
                    break;
    
                case INPUT_SOURCE_TYPE.GAMEPAD:
                    oSource = new GamepadSource(this, sKey, aArguments[0]);
                    break;
            }

            // Ajout de la source
            this.oSources[sKey] = oSource;
            
            // Trigger
            this.emit(EVENT_NAME.INPUT_SOURCE_CREATE, oSource);
        }

        return oSource;
    }

    /** Create a Keyboard Source Input and listeners. */
    private _createKeyboard(): void {

        // Récupération API
        this.oAPIKeyboard = (navigator as any).keyboard;

        // Création des écouteurs d'EVENT Keayboard
        const oSource = this._getSource(INPUT_SOURCE_TYPE.KEYBOARD),
            fListener = (eEvent: KeyboardEvent): void => {
                oSource?.addEvent(eEvent);
            };

        // Ajout des écouteurs d'EVENT clavier
        this.oEngine.addWindowListener('keydown', fListener);
        this.oEngine.addWindowListener('keyup', fListener);
    }

    /** Create a Gamepad Source Input. */
    private _createGamepads(): void {

        // Récupération API
        this.aAPIGamepads = navigator.getGamepads();

        // Création des écouteurs d'EVENT Gamepad
        this.aAPIGamepads.forEach( oGamepad => {
            if( oGamepad ){
                this._getSource(INPUT_SOURCE_TYPE.GAMEPAD, oGamepad);
            }
        } );        
    }
}