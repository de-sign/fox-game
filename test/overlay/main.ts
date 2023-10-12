// Import
import './style.css';

import * as PIXI from 'pixi.js';

import * as FOX from '../../source';
import { GameScene } from './Scene/GameScene';


window.addEventListener('load', () => {
    const oGame = new FOX.Engine( {
        bDebugMode: true,
        
        // Input
        oInput: {
            bGamepad: false,
            oControllersOptions: {
                [FOX.INPUT_SOURCE_TYPE.KEYBOARD]: {
                    oMapping: {

                        // Menu
                        MenuUp: ['KeyW', 'ArrowUp'],
                        MenuDown: ['KeyS', 'ArrowDown'],
                        MenuLeft: ['KeyA', 'ArrowLeft'],
                        MenuRight: ['KeyD', 'ArrowRight'],
                        MenuValidate: ['Enter', 'Space', 'NumpadEnter'],
                        MenuCancel: ['Backspace', 'Escape', 'Delete', 'NumpadDecimal'],

                        // Game
                        GameUp: ['KeyW', 'ArrowUp'],
                        GameDown: ['KeyS', 'ArrowDown'],
                        GameLeft: ['KeyA', 'ArrowLeft'],
                        GameRight: ['KeyD', 'ArrowRight'],
                        GameMenu: ['Backspace', 'Escape', 'Delete', 'NumpadDecimal']
                    }
                }
            }
        },

        // Scene
        oScene: {
            cStartingScene: GameScene
        },
        
        // Output
        cOutputManager: FOX.OutputPixiJS,
        oOutput: <FOX.IOutputPixiJSOptions>{

            hResizeViewTo: <Window>window,

            // PIXI Options
            backgroundColor: '#FFF',
            antialias: true
        }
    } );
    window['oGame'] = oGame;

    // Event
    oGame.once(FOX.EVENT_NAME.ENGINE_START, () => {
        FOX.HTML.oBody.addClass('--started');
    } );

    // ControllerSet
    oGame.oStore.set('GNL__Controllers', new FOX.InputControllerSet());
    oGame.oInput.on( FOX.EVENT_NAME.INPUT_CONTROLLER_CREATE, oController => oGame.oStore.get('GNL__Controllers').add(oController) );
    
    // Load Assets
    PIXI.Assets.addBundle('GameScene', {
        background: './test/overlay/Assets/background_hex.jpg',
        character: './test/overlay/Assets/hex.png',
    } );
    PIXI.Assets.loadBundle('GameScene').then( () => {
        oGame.start();
    } );

} );