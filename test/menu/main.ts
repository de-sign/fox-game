// Import
import './style.css';

import * as FOX from '../../src';
import { MenuScene } from './MenuScene';

window.addEventListener('load', () => {
    const oGame = new FOX.Engine( {
        bDebugMode: true,
        
        // Input
        oInput: {
            bGamepad: false,
            oControllersOptions: {
                [FOX.INPUT_SOURCE_TYPE.KEYBOARD]: {
                    oMapping: {
                        MenuUp: ['KeyW', 'ArrowUp'],
                        MenuDown: ['KeyS', 'ArrowDown'],
                        MenuLeft: ['KeyA', 'ArrowLeft'],
                        MenuRight: ['KeyD', 'ArrowRight'],
                        MenuValidate: ['Enter', 'Space', 'NumpadEnter'],
                        MenuCancel: ['Backspace', 'Escape', 'Delete', 'NumpadDecimal'],
                    }
                }
            }
        },

        // Scene
        oScene: {
            oStartingScene: {
                cScene: MenuScene
            }
        },
        
        // Output
        cOutputManager: FOX.OutputPixiJS,
        oOutput: <FOX.IOutputPixiJSOptions>{

            nAspectType: FOX.OUTPUT_ASPECT_TYPE.EXTEND,

            // PIXI Options
            oRenderer: {
                backgroundColor: '#000',
                antialias: true
            }
        }
    } );
    
    oGame.start();
    
    window['oGame'] = oGame;
} );