import * as PIXI from 'pixi.js';
import * as FOX from '../../source';


export class MyScene extends FOX.ScenePixiJS {


    private _oControllerSet: FOX.InputControllerSet;
    private _oCube: PIXI.Graphics = new PIXI.Graphics;
    private _oDirection: { [key: string]: number } | null;


    constructor (oMScene: FOX.SceneManager) {
        super(oMScene);
    }

    
    public initialize(): void {
        super.initialize();

        // Set Controller
        if( this.oStore.has('GNL__Controllers') ){
            this._oControllerSet = this.oStore.get('GNL__Controllers');
        }
        else if( this.oInput ){
            this._oControllerSet = new FOX.InputControllerSet( this.oInput.aControllers );
            this.oInput.on( FOX.EVENT_NAME.INPUT_CONTROLLER_CREATE, oController => this._oControllerSet.add(oController) );
            this.oStore.set('GNL__Controllers', this._oControllerSet);
        }

        // Cube
        this._oCube.beginFill('#99FFFF');
        this._oCube.drawRect(0, 0, 200, 200);
        this.oWorld.addChild(this._oCube);

    }

    public update(): void {
        const oCtrl = this._oControllerSet.getActive(),
            oDirection = {
            nX: 0,
            nY: 0
        };

        if( this._oControllerSet.isPressed('GameUp') ){
            oDirection.nY -= oCtrl ? oCtrl.getButton('GameUp').nValue : 0;
        }
        if( this._oControllerSet.isPressed('GameDown') ){
            oDirection.nY += oCtrl ? oCtrl.getButton('GameDown').nValue : 0;
        }
        if( this._oControllerSet.isPressed('GameLeft') ){
            oDirection.nX -= oCtrl ? oCtrl.getButton('GameLeft').nValue : 0;
        }
        if( this._oControllerSet.isPressed('GameRight') ){
            oDirection.nX += oCtrl ? oCtrl.getButton('GameRight').nValue : 0;
        }

        if( oDirection.nX || oDirection.nY ){
            this._oDirection = {
                nX: oDirection.nX * 6,
                nY: oDirection.nY * 6,
            };
        }
    }

    public render(): void {
        if( this._oDirection ){
            this._oCube.position.set( this._oCube.position.x + this._oDirection.nX, this._oCube.position.y + this._oDirection.nY );
            this._oDirection = null;
        }
    }
}