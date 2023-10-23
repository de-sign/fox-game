import * as PIXI from 'pixi.js';
import '@pixi/math-extras';

import * as FOX from '../../src';


const oPointZERO = new PIXI.Point(0, 0);

export class GameScene extends FOX.ScenePixiJS {


    private _oControllerSet: FOX.InputControllerSet;
    private _oBackGround: PIXI.TilingSprite;
    private _oCharacter: PIXI.Sprite;
    private _oChange: FOX.TObject | null;
    

    constructor (oMScene: FOX.SceneManager) {
        super(oMScene);
    }

    destroy() { }

    
    public initialize(): void { 

        // Controller
        this._oControllerSet = this.oStore.get('GNL__Controllers');

        // Sprites
            // Background
            /*
        const oResolution = this.oOutput.oResolution;
        this._oBackGround = PIXI.TilingSprite.from('background', { width: oResolution.width, height: oResolution.height });
        this.oWorld.addChild(this._oBackGround);

        this.oCamera.on( FOX.EVENT_NAME.CAMERA_UPDATE, () => {
            const oCameraBounds = this.oCamera.getBounds();
            this._oBackGround.width = oCameraBounds.width;
            this._oBackGround.height = oCameraBounds.height;
            this._oBackGround.position.set(oCameraBounds.x, oCameraBounds.y);
            this._oBackGround.tilePosition.set(-oCameraBounds.x, -oCameraBounds.y);
        } );
        */
       
        this._oBackGround = PIXI.TilingSprite.from('background', { width: 1024 * 3, height: 1024 * 2 });
        this.oWorld.addChild(this._oBackGround);
        
            // Character
        this._oCharacter = PIXI.Sprite.from('character');
        this._oCharacter.anchor.set(0.5);
        this._oCharacter.position.set(153, 153);
        this.oWorld.addChild(this._oCharacter);

        // Camera
        super.initialize();
        this.oCamera.oTarget = this._oCharacter;
        this.oCamera.oRestrictionArea = new PIXI.Rectangle(0, 0, this.oWorld.width, this.oWorld.height);
    }

    public update(): void {
        // Character
        const nSpeed = 6,
            oDirection = new PIXI.Point(0, 0);

        if( this._oControllerSet.isPressed('GameUp') ){
            oDirection.y -= 1;
        }
        if( this._oControllerSet.isPressed('GameDown') ){
            oDirection.y += 1;
        }
        if( this._oControllerSet.isPressed('GameLeft') ){
            oDirection.x -= 1;
        }
        if( this._oControllerSet.isPressed('GameRight') ){
            oDirection.x += 1;
        }

        if( !oDirection.equals(oPointZERO) ){
            this._oChange = {
                oDirection: oDirection.normalize().multiplyScalar(nSpeed),
                nScale: oDirection.x ? (oDirection.x > 0 ? 1 : -1) : 0
            };
        }
    }

    public render(): void {

        // Character
        if( this._oChange ){
            this._oCharacter.position.add( this._oChange.oDirection, this._oCharacter.position );
            if( this._oChange.nScale ){
                this._oCharacter.scale.x = this._oChange.nScale;
            }
            this._oChange = null;
        }

        // Camera
        this.oCamera.update();
    }
}