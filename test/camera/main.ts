// Import
import './style.css';

import * as PIXI from 'pixi.js';

import * as FOX from '../../source';
import { GameScene } from './GameScene';


window.addEventListener('load', () => {
    const oGame = new FOX.Engine( {
        bDebugMode: true,
        
        // Input
        oInput: {
            //bGamepad: false,
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
                },
                [FOX.INPUT_SOURCE_TYPE.GAMEPAD]: {
                    oMapping: {

                        // Menu
                        MenuUp: ['Axe1Minus', 'Button12'],
                        MenuDown: ['Axe1Plus', 'Button13'],
                        MenuLeft: ['Axe0Minus', 'Button14'],
                        MenuRight: ['Axe0Plus', 'Button15'],
                        MenuValidate: ['Button0'],
                        MenuCancel: ['Button1', 'Button3'],

                        GameUp: ['Axe1Minus', 'Button12'],
                        GameDown: ['Axe1Plus', 'Button13'],
                        GameLeft: ['Axe0Minus', 'Button14'],
                        GameRight: ['Axe0Plus', 'Button15'],
                        GameMenu: ['Button9']
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
            nAspectType: FOX.OUTPUT_ASPECT_TYPE.KEEP_RATIO_AND_EXTEND,
            nWidth: 816,
            nHeight: 612,
            
            // PIXI Options
            oRenderer: {
                antialias: false,
                autoDensity: true,
                backgroundColor: '#FFF',
                forceCanvas: false,
            }
        }
    } );
    window['oGame'] = oGame;

    // ControllerSet
    oGame.oStore.set('GNL__Controllers', new FOX.InputControllerSet());
    oGame.oInput.on( FOX.EVENT_NAME.INPUT_CONTROLLER_CREATE, oController => oGame.oStore.get('GNL__Controllers').add(oController) );
    
    // Load Assets
    PIXI.Assets.addBundle('GameScene', {
        background: './test/camera/assets/background_grid.jpg',
        //background: './test/camera/assets/background_paper.png',
        character: './test/camera/assets/character.png',
        helmet: './test/camera/assets/helmet.png',
    } );
    PIXI.Assets.loadBundle('GameScene').then( () => {
        oGame.start();
    } );

} );