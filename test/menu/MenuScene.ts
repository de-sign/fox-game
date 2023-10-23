import * as FOX from '../../src';


const aBackgroundColor = [
    '--theme-red',
    '--theme-blue',
    '--theme-yellow'
];

enum MENU_ACTION {
    NEW,
    SETTINGS,
    REDIRECT
};


export class MenuScene extends FOX.Scene {
    

    private _oMenu: FOX.Menu | null = null;


    constructor (oMScene: FOX.SceneManager) {
        super(oMScene);
    }

    destroy() {
        this._oMenu?.destroy();
    }

    
    public initialize(): void {
        super.initialize();

        const oHMenu = FOX.HTML.get('MainMenu');
        if( oHMenu ){
            this._oMenu = new FOX.Menu(oHMenu, {
                sMenuClass: 'DS__Menu',
                oController: this.oInput.oControllersSet
            } );

            this._oMenu
                .on(FOX.EVENT_NAME.MENU_MOVE, (nLast, nCurrent) => {
                    this.oOutput.once(FOX.EVENT_NAME.OUTPUT_RENDER, () => {
                        FOX.HTML.oBody.sClass = aBackgroundColor[nCurrent];
                    } );
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