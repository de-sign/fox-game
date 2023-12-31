import * as PIXI from 'pixi.js';
import * as FOX from '../../../src';

import { PauseScene } from './PauseScene';


export class GameScene extends FOX.ScenePixiJS {


    private _oControllerSet: FOX.InputControllerSet;
    private _oCube: PIXI.Sprite;
    private _oDirection: { [key: string]: number } | null;
    private _oHMenuButton: FOX.HTML | null;
    

    constructor (oMScene: FOX.SceneManager) {
        super(oMScene);
    }

    destroy() { }

    
    public initialize(): void { 

        // Controller
        this._oControllerSet = this.oInput.oControllersSet;

        // Sprite
        const oSpriteBG = PIXI.Sprite.from('background');
        this._oCube = PIXI.Sprite.from('character');
        
            // BG
        this.oWorld.addChild(oSpriteBG, this._oCube);

            // Character
        this._oCube.anchor.set(0.5);
        this._oCube.position.set(oSpriteBG.width / 2, oSpriteBG.height / 2);

        // Camera
        super.initialize();
        this.oCamera.oPosition.set(oSpriteBG.width / 2, oSpriteBG.height / 2);
        this.oCamera.update();

        // Menu
        const oHMenu = FOX.HTML.get('GameMenuButton');
        if( oHMenu ){
            this._oHMenuButton = oHMenu;
            oHMenu.onEvent('click', () => this._openMenu());
        }

        // Event
        this.on(FOX.EVENT_NAME.SCENE_BLUR, () => {
                if( this._oHMenuButton ){
                    this._oHMenuButton.bHidden = true;
                }
            } )
            .on(FOX.EVENT_NAME.SCENE_FOCUS, () => {
                if( this._oHMenuButton ){
                    this._oHMenuButton.bHidden = false;
                }
            } );
    }

    public update(): void {

        // Menu
        if( this._oControllerSet.hasPressed('GameMenu') ){
            this._openMenu();
        }
        // Character
        else {

            const oDirection = {
                nX: 0,
                nY: 0
            };

            if( this._oControllerSet.isPressed('GameUp') ){
                oDirection.nY -= 1;
            }
            if( this._oControllerSet.isPressed('GameDown') ){
                oDirection.nY += 1;
            }
            if( this._oControllerSet.isPressed('GameLeft') ){
                oDirection.nX -= 1;
            }
            if( this._oControllerSet.isPressed('GameRight') ){
                oDirection.nX += 1;
            }

            if( oDirection.nX || oDirection.nY ){
                this._oDirection = {
                    nX: oDirection.nX * 6,
                    nY: oDirection.nY * 6,
                };
            }
        }
    }

    public render(): void {
        if( this._oDirection ){
            this._oCube.position.set( this._oCube.position.x + this._oDirection.nX, this._oCube.position.y + this._oDirection.nY );
            this._oDirection = null;
        }
    }


    private _openMenu(): void {
        this.oScene.stackScene( {
            cScene: PauseScene
        } );
    }
}