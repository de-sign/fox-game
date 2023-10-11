// Imports
import EventEmitter from 'eventemitter3';

import { HTML } from '../Core/HTML';
import { EVENT_NAME, MENU_CURSOR_VERTICAL } from '../Core/Constants';
import { InputController, InputControllerSet } from '../Input';

/**
 * Menu options supplied to constructor.
 */
export interface IMenuOptions {
    sMenuClass?: string,
    sItemsClass?: string,
    sCursorClass?: string,

    bMouseMoveCursor?: boolean,
    oController?: InputControllerSet | InputController,
    oControllerActions?: { [sKey: string]: keyof Menu | Function },
    nHoldDelay?: number,

    bInfinite?: boolean
}

const oDefaultMenuOptions = {
    sMenuClass: 'Menu',
    sItemsClass: 'Menu_Item',
    sCursorClass: 'Menu_Cursor',

    bMouseMoveCursor: true,
    oControllerActions: MENU_CURSOR_VERTICAL,
    nHoldDelay: 0,

    bInfinite: true
};


/**
 * Convenience class to create a new Menu.
 * @class
 */
export class Menu extends EventEmitter {


    /** Menu option */
    private _oOptions: IMenuOptions;

    private _oElement: HTML;
    private _aItems: HTML[];
    private _nCursorPosition: number = 0;
    private _nLastCursorPosition: number = 0;

    private _bLockUpdate: boolean = false;
    private _oController: InputControllerSet | InputController | null = null;
    private _oControllerActions: { [sKey: string]: Function } | null = null;
    private _nHoldSimulatedPress: number = 0;
    private _sHoldButton: string | null = null;


    constructor(oElement: HTML, oMenuOptions?: IMenuOptions) {
        super();

        // Options par défaut
        this._oOptions = Object.assign( {}, oDefaultMenuOptions, oMenuOptions );

        this._oElement = oElement;
        this._aItems = oElement.getAllClass( <string>this._oOptions.sItemsClass );

        this._oElement.addClass( <string>this._oOptions.sMenuClass );
        this._aItems.forEach( (oItem, nIndex) => {

            if( oItem.hasClass( <string>this._oOptions.sCursorClass ) ){
                this._nCursorPosition = nIndex;
                this._nLastCursorPosition = -1;
            }

            if( this._oOptions.bMouseMoveCursor ){
                oItem.onEvent('mouseenter', () => {
                    this.once( EVENT_NAME.MENU_UPDATE, () => {
                        this.select(nIndex).lock();
                    } );
                } );

                oItem.onEvent('click', () => {
                    this.once( EVENT_NAME.MENU_UPDATE, () => {
                        this.validate().lock();
                    } );
                } );
            }
        } );

        if( this._oOptions.oController ){
            this.setController(this._oOptions.oController, <{ [sKey: string]: keyof Menu | Function }>this._oOptions.oControllerActions);
        }
    }

    destroy(): void {
        this._aItems.forEach( oItem => oItem.offAllEvent() );
    }


    public update(): this {

        this.emit(EVENT_NAME.MENU_UPDATE);

        // Lock via Mouse
        if( this._bLockUpdate ){
            this._bLockUpdate = false;
        }
        // Gestion via Controller
        else if( this._oController && this._oControllerActions ){
            for( let sButton in this._oControllerActions ){

                // Gestion du délai de HOLD
                if( this._oOptions.nHoldDelay ){
                    let bAction = false;

                    if( this._sHoldButton == sButton ){
                        if( this._oController.hasHeld(sButton, this._nHoldSimulatedPress * this._oOptions.nHoldDelay) ){
                            bAction = true;
                        }
                        else if( !this._oController.isPressed(sButton) ) {
                            this._sHoldButton = null;
                            this._nHoldSimulatedPress = 0;
                        }
                    }
                    else if( this._oController.hasPressed(sButton) ){
                        bAction = true;
                        this._sHoldButton = sButton;
                        this._nHoldSimulatedPress = 0;
                    }

                    if( bAction ){
                        this._oControllerActions[sButton](this);
                        this._nHoldSimulatedPress++;
                        break;
                    }
                }
                // Gestion en pression
                else if( this._oController.hasPressed(sButton) ){
                    this._oControllerActions[sButton](this);
                    break;
                }
            }
        }

        // Trigger
        if( this._nLastCursorPosition != -1 ){
            this.emit(EVENT_NAME.MENU_MOVE, this._nLastCursorPosition, this._nCursorPosition);
        }

        return this;
    }

    public render(): this {
        if( this._nLastCursorPosition != -1 ){
            this._aItems[this._nLastCursorPosition].removeClass( <string>this._oOptions.sCursorClass );
            this._aItems[this._nCursorPosition].addClass( <string>this._oOptions.sCursorClass );
            this._nLastCursorPosition = -1;
        }
        return this;
    }


    public lock(): this {
        this._bLockUpdate = true;
        return this;
    }

    public isLock(): boolean {
        return this._bLockUpdate;
    }


    public setController(oController: InputController | InputControllerSet, oControllerActions: { [sKey: string]: keyof Menu | Function }): this {
        
        const oActions: { [sKey: string]: Function } = {};

        for( let sButton in oControllerActions ){
            const uAction = oControllerActions[sButton];
            if( typeof uAction === 'string' ){
                if( this[uAction] instanceof Function ){
                    oActions[sButton] = () => {
                        (<any>this[uAction])();
                    };
                }
            } else {
                oActions[sButton] = uAction;
            }
        }

        this._oController = oController;
        this._oControllerActions = oActions;

        return this;
    }

    public getItem(): HTML {
        return this._aItems[this._nCursorPosition];
    }

    public getItems(): HTML[] {
        return this._aItems;
    }


    public previous(): this {
        this.select( this._nCursorPosition - 1 );
        return this;
    }

    public select(nIndex: number): this {
        nIndex = this._getIndex(nIndex);
        if( nIndex != this._nCursorPosition ){
            if( this._nLastCursorPosition == -1 ){
                this._nLastCursorPosition = this._nCursorPosition;
            }
            this._nCursorPosition = nIndex;
        }
        return this;
    }

    public next(): this {
        this.select( this._nCursorPosition + 1 );
        return this;
    }

    private _getIndex(nIndex: number): number {
        if( nIndex < 0 ){
            nIndex = this._oOptions.bInfinite ? this._aItems.length - 1 : 0;
        } else if( nIndex >= this._aItems.length ){
            nIndex = this._oOptions.bInfinite ? 0 : this._aItems.length - 1;
        }
        return nIndex;
    }


    public validate(): this {
        const nIndex = this._nCursorPosition,
            oItem = this._aItems[nIndex];

        if( oItem.hasData('menu-cancel') ){
            this.cancel();
        } else {
            this.emit(EVENT_NAME.MENU_VALIDATE, nIndex);
        }

        return this;
    }

    public cancel(): this {
        this.emit(EVENT_NAME.MENU_CANCEL);
        return this;
    }

}