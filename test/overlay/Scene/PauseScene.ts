import * as FOX from '../../../src';


enum MENU_ACTION {
    RESUME,
    SETTINGS,
    REDIRECT
};


export class PauseScene extends FOX.Scene {
    

    private _oHLayout: FOX.HTML | null = null;
    private _oMenu: FOX.Menu | null = null;


    constructor (oMScene: FOX.SceneManager) {
        super(oMScene);
    }

    destroy() {
        this._oMenu?.destroy();
        if( this._oHLayout ){
            this._oHLayout.bHidden = true;
        }
    }

    
    public initialize(): void {
        super.initialize();

        const oHLayout = FOX.HTML.get('PauseScene');
        if( oHLayout ){
            this._oHLayout = oHLayout;
            oHLayout.bHidden = false;
            this.oEngine.once( FOX.EVENT_NAME.ENGINE_UPDATE, () => oHLayout.addClass('--appear') );
            
        }

        const oHMenu = FOX.HTML.get('PauseMenu');
        if( oHMenu ){
            this._oMenu = new FOX.Menu(oHMenu, {
                sMenuClass: 'DS__Menu',
                oController: this.oInput.oControllersSet
            } );

            this._oMenu
                .on(FOX.EVENT_NAME.MENU_CANCEL, () => {
                    this.freeze();
                    this._oHLayout?.removeClass('--appear');
                    setTimeout( () => this.oScene.unstackScene(), 500 );
                } )
                .on(FOX.EVENT_NAME.MENU_VALIDATE, nIndex => {
                    switch( nIndex ){
                        case MENU_ACTION.REDIRECT:
                            window.open('https://github.com/de-sign/fox-game', '_blank');
                            break;
                        default:
                            console.log(nIndex);
                    }
                } );
        }
    }

    public update(): void {
        this._oMenu?.update();
    }

    public render(): void {
        this._oMenu?.render();
    }
}