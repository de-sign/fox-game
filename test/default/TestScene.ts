import * as PIXI from 'pixi.js';
import * as FOX from '../../source';


export class MyScene extends FOX.ScenePixiJS {


    private _oControllerSet: FOX.InputControllerSet;
    private _oCube: PIXI.Graphics = new PIXI.Graphics;
    private _oDirection: { [key: string]: number } | null;


    constructor (oEngine: FOX.Engine) {
        super(oEngine);
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
        this.oRenderContainer.addChild(this._oCube);

        this._oCube.pivot.set(100, 100);
        this._oCube.position.set(400, 300);

    }

    public update(): void {
        const oCtrl = this._oControllerSet.getActive(),
            oDirection = {
            nX: 0,
            nY: 0
        };

        if( this._oControllerSet.isPressed('Up') ){
            oDirection.nY -= oCtrl ? oCtrl.getButton('Up').nValue : 0;
        }
        if( this._oControllerSet.isPressed('Down') ){
            oDirection.nY += oCtrl ? oCtrl.getButton('Down').nValue : 0;
        }
        if( this._oControllerSet.isPressed('Left') ){
            oDirection.nX -= oCtrl ? oCtrl.getButton('Left').nValue : 0;
        }
        if( this._oControllerSet.isPressed('Right') ){
            oDirection.nX += oCtrl ? oCtrl.getButton('Right').nValue : 0;
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