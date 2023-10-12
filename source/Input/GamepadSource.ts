// Imports
import { TData, TValue } from '../Core/Type';
import {
    EVENT_NAME, INPUT_SOURCE_TYPE,
    GAMEPAD_BUTTON_DEFAULT_NAME, GAMEPAD_BUTTON_PLAYSTATION_NAME, GAMEPAD_BUTTON_XBOX_NAME
} from '../Core/Constants';
import { InputManager, InputSource } from './';


/**
 * Gamepad Source class for Input manager.
 * @class
 */
export class GamepadSource extends InputSource {
    
    
    /** Index of source */
    public readonly nIndex: number;
    /** Identifier of source */
    public readonly sIdentifier: string;
    /** Connection Gamepad state */
    public bConnected: boolean = true;


    /** List of Button name define by Constants. */
    protected _oButtonsName: TData = {};
    /** Gamepad of source from Gamepad API. */
    private _oGamepad: Gamepad | null;
    

    /** Constructor */
    constructor(oInput: InputManager, sName: string, oGamepad: Gamepad) {

        super(oInput, INPUT_SOURCE_TYPE.GAMEPAD, sName);

        // INIT des infos
        this._oGamepad = oGamepad;
        this.nIndex = oGamepad.index;
        this.sIdentifier = oGamepad.id;

        // Création de nom de bouton
        this._createButtonsName();
    }


    /** Update of Button states via states change detected during a tick. */
    public update(): boolean {

        let bUpdated = false;
        const aUpdated = [];

        this._oGamepad = (this.oInput.aAPIGamepads || [])[ this.nIndex ];

        // Si Gamepad connecté
        if( this._oGamepad ) {
            
            // FLAG de reconnection
            if( !this.bConnected ){
                this.bConnected = true;

                // Trigger
                this.oInput.emit(EVENT_NAME.INPUT_SOURCE_RECONNECT, this);

                bUpdated = true;
            }

            // Énumération des axes du Gamepad
            this._oGamepad.axes.forEach( (nValue: number, nIndex: number) => {
                
                let sCode = `Axe${nIndex}`;

                // MAJ de la valeur du bouton général
                if( this._setButtonValue(sCode, nValue) ){
                    aUpdated.push(sCode);
                }

                // MAJ de la valeur des boutons spécifiques
                const nAbsoluteValue = Math.abs(nValue),
                    sSign = nValue == nAbsoluteValue ? 'Plus' : 'Minus',
                    oSignValue: TValue = {
                        Minus: 0.0,
                        Plus: 0.0
                    };
                oSignValue[sSign] = nAbsoluteValue;

                for( let sKey in oSignValue ){
                    sCode = `Axe${nIndex}${sKey}`;
                    if( this._setButtonValue(sCode, oSignValue[sKey]) ){
                        aUpdated.push(sCode);
                    }
                }

            } );

            // Énumération des boutons du Gamepad
            this._oGamepad.buttons.forEach( (oButton: GamepadButton, nIndex: number) => {

                const sCode = `Button${nIndex}`;

                // MAJ de la valeur du bouton
                if( this._setButtonValue(sCode, oButton.value) ){
                    aUpdated.push(sCode);
                }
            } );
        }

        // Si Gamepad déconnecté alors qu'il été connecté auparavant
        else if( this.bConnected ){
            
            // FLAG de déconnection
            this.bConnected = false;

            // RAZ des boutons 
            for( let sCode in this._oButtons ){
                this._setButtonValue(sCode, 0.0);
                aUpdated.push(sCode);
            }

            // Trigger
            this.oInput.emit(EVENT_NAME.INPUT_SOURCE_DISCONNECT, this);
        }

        // MAJ de date si le Gamepad a été reconnecté, déconnecté ou si un bouton a été MAJ
        if( bUpdated || aUpdated.length ){
            bUpdated = true;
            this.nUpdate = this.oInput.oEngine.getTickTime();
            
            if( aUpdated.length ){
                // Trigger
                this.emit(EVENT_NAME.INPUT_SOURCE_UPDATE, aUpdated);
            }
        }

        return bUpdated;
    }


    /**
     * Create list of button name with Keyboard API.
     * If not supported, update name with KeyboardEvent.
    */
    private _createButtonsName(): void {
        // Récupération des nom par défaut
        this._oButtonsName = GAMEPAD_BUTTON_DEFAULT_NAME;
        
        // Surcharge en fonction de l'identifiant du Gamepad
        if( this.sIdentifier.toUpperCase().indexOf('PLAYSTATION') != -1 ){
            Object.assign(this._oButtonsName, GAMEPAD_BUTTON_PLAYSTATION_NAME);
        }
        else if( this.sIdentifier.toUpperCase().indexOf('XBOX') != -1 ){
            Object.assign(this._oButtonsName, GAMEPAD_BUTTON_XBOX_NAME);
        }
    }
}