import * as FOX from '../source';

export class MyScene extends FOX.Scene {


    private _oControllerSet: FOX.InputControllerSet;
    private _hContainer: HTMLDivElement | null = null;
    private _sHTMLMessage: string = '';


    constructor (oEngine: FOX.Engine) {
        super(oEngine);
    }

    
    public initialize(): void {
        super.initialize();

        if( this.oStore.has('GNL__Controllers') ){
            this._oControllerSet = this.oStore.get('GNL__Controllers');
        }
        else if( this.oInput ){
            this._oControllerSet = new FOX.InputControllerSet( this.oInput.aControllers );
            this.oInput.on( FOX.EVENT_NAME.INPUT_CONTROLLER_CREATE, oController => this._oControllerSet.add(oController) );
            this.oStore.set('GNL__Controllers', this._oControllerSet);
        }

        this._hContainer = document.getElementsByTagName('div')[0];
    }

    public update(): void {
        if( this._oControllerSet.hasPressed('Shoot') ){
            this._sHTMLMessage = `${this._oControllerSet.getActive()?.getSourceKey()} <b>shoot !</b> <i>(frame ${this.oEngine.nFrames})</i>`;
        }
    }

    public render(): void {
        if( this._sHTMLMessage && this._hContainer ){
            this._hContainer.innerHTML = this._sHTMLMessage;
            this._sHTMLMessage = '';
        }
    }
}