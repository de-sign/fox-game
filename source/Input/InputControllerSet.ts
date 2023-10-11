import { InputController } from '.';
import { EVENT_NAME } from '..';

/**
 * Controller Set class.
 */
export class InputControllerSet {
    

    /** Last tick time of Controller update. */
    public nUpdate: number = 0;


    /** List of Controller */
    private _aControllers: InputController[] = [];
    /** Last Updated Controller */
    private _oActiveController: InputController | null = null;


    /** Constructor */
    constructor(_aControllers?: InputController[]){
        if( _aControllers?.length ){
            this._oActiveController = _aControllers[0];
            this.add.apply(this, _aControllers);
        }
    }


    /** Add Controler at set. */
    public add( ...aControllers: InputController[] ): InputControllerSet {

        // Pour chaque Controller donné en arguments
        aControllers.forEach( oController => {
            // Ajout du Controller
            this._aControllers.push(oController);

            // Écouteur d'EVENT sur une MAJ
            oController.on(EVENT_NAME.INPUT_CONTROLLER_UPDATE, () => {
                this._oActiveController = oController;
                this.nUpdate = oController.nUpdate;
            } );
        } );

        return this;
    }

    /** Return last Updated Controller */
    public getActive(): InputController | null {
        return this._oActiveController;
    }
    

    /** Return if Button of one Controller is pressed. */
    public isPressed(sName: string): boolean {
        return !this._aControllers.every( oController => !oController.isPressed(sName) );
    }

    /** Return if the button has been held for a while. */
    public hasHeld(sName: string, nTime: number): boolean {
        return !this._aControllers.every( oController => !oController.hasHeld(sName, nTime) );
    }

    /** Return if one Button of one Controller  has pressed now. */
    public hasPressed(sName: string): boolean {
        return !this._aControllers.every( oController => !oController.hasPressed(sName) );
    }

    /** Return if one Button of one Controller has released now. */
    public hasReleased(sName: string): boolean {
        return !this._aControllers.every( oController => !oController.hasReleased(sName) );
    }

}