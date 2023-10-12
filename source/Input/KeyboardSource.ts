// Imports
import { TData, TValue } from '../Core/Type';
import { EVENT_NAME, INPUT_SOURCE_TYPE } from '../Core/Constants';
import { InputManager, InputSource } from './';


// Liste des valeurs par type d'EVENT
const oTypeMap: TValue = {
    keydown: 1.0,
    keypress: 1.0, // DEPRECATED ! - not recommended
    keyup: 0.0
};


/**
 * Keyboard Source class for Input manager.
 * @class
 */
export class KeyboardSource extends InputSource {

    /** List of Button states change catch during a tick. */
    private _oButtonsChange: TValue = {};
    /** List of Button name define by KeyboardAPI. */
    protected _oButtonsName: TData = {};

    /** Flag for update name with KeyboardEvent if Keyboard API not supported.*/
    private _bUpdateButtonsName: boolean = false;
    

    /** Constructor */
    constructor(oInput: InputManager, sName: string) {
        super(oInput, INPUT_SOURCE_TYPE.KEYBOARD, sName);

        // MAJ des noms des boutons via KeyboardAPI
        this._createButtonsName();
    }


    /** Update of Button states via states change catch during a tick. */
    public update(): boolean {
        const aUpdated = [];

        // Énumérations des changements de bouton captés par un écouteurs d'EVENT
        for( let sCode in this._oButtonsChange ){
            // Récupération de la nouvelle valeur du bouton
            const nValue = this._oButtonsChange[sCode];

            // MAJ de la valeur du bouton
            if( this._setButtonValue(sCode, nValue) ){
                aUpdated.push(sCode);
            }

            // MAJ du nom du bouton si demandé
            if( this._bUpdateButtonsName ) {
                this._setButtonName(sCode);
            }
        }

        // RAZ des changements de boutons captés par un écouteurs d'EVENT
        this._oButtonsChange = {};

        // MAJ de date si un bouton a été MAJ
        if( aUpdated.length ){
            this.nUpdate = this.oEngine.getTickTime();

            // Trigger
            this.emit(EVENT_NAME.INPUT_SOURCE_UPDATE, aUpdated);
        }

        return !!aUpdated.length;
    }

    /** Catch event and list button states change for next update tick. */
    public addEvent(eEvent: KeyboardEvent): void {
        // Valeur du bouton en fonction du type d'EVENT
        this._oButtonsChange[eEvent.code] = oTypeMap[eEvent.type];

        // MAJ du nom si Keyboard API non supporté
        if( this._bUpdateButtonsName ){
            this._oButtonsName[eEvent.code] = eEvent.key;
        }
    }


    /**
     * Create list of button name with Keyboard API.
     * If not supported, update name with KeyboardEvent.
    */
    private _createButtonsName(): void {
        if( this.oInput.oAPIKeyboard ){
            // Récupération du LAYOUT via API
            this.oInput.oAPIKeyboard.getLayoutMap().then( (oKeyboardLayoutMap: any) => {
                // Itération des boutons pour création des noms
                oKeyboardLayoutMap.forEach( (sName: string, sCode: string) => {
                    this._oButtonsName[sCode] = sName;
                } );
            } );
        }
        else {
            // FLAG sur ON si Keyboard API non supporté
            this._bUpdateButtonsName = true;
        }
    }

    /** Update name of a button. */
    private _setButtonName(sCode: string): void {
        const oButton = this.getButton(sCode),
            sName = this._oButtonsName[sCode];

        // MAJ du nom du bouton si besoin
        if( oButton.sName != sName ){
            oButton.sName = sName;
        }
    }
}