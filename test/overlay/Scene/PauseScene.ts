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
        }

        const oHMenu = FOX.HTML.get('PauseMenu');
        if( oHMenu ){
            this._oMenu = new FOX.Menu(oHMenu, {
                sMenuClass: 'DS__Menu',
                oController: this.oStore.get('GNL__Controllers')
            } );

            this._oMenu
                .on(FOX.EVENT_NAME.MENU_CANCEL, () => {
                    this.oScene.unstackScene();
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