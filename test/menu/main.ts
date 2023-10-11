// Import
import './style.css';

import * as FOX from '../../source';
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
                        KeyW: 'MenuUp',
                        KeyS: 'MenuDown',
                        KeyA: 'MenuLeft',
                        KeyD: 'MenuRight',
                        Enter: 'MenuValidate',
                        Space: 'MenuValidate',
                        Backspace: 'MenuCancel',
                        Escape: 'MenuCancel',
                        Delete: 'MenuCancel',
                        
                        ArrowUp: 'MenuUp',
                        ArrowDown: 'MenuDown',
                        ArrowLeft: 'MenuLeft',
                        ArrowRight: 'MenuRight',
                        NumpadEnter: 'MenuValidate',
                        NumpadDecimal: 'MenuCancel'
                    }
                }
            }
        },

        // Scene
        oScene: {
            cStartingScene: MenuScene
        },
        
        // Output
        cOutputManager: FOX.OutputPixiJS,
        oOutput: <FOX.IOutputPixiJSOptions>{

            hResizeViewTo: <Window>window,

            // PIXI Options
            backgroundColor: '#000',
            antialias: true
        }
    } );

    // ControllerSet
    oGame.oStore.set('GNL__Controllers', new FOX.InputControllerSet());
    oGame.oInput.on( FOX.EVENT_NAME.INPUT_CONTROLLER_CREATE, oController => oGame.oStore.get('GNL__Controllers').add(oController) );
    
    oGame.start();
    
    window['oGame'] = oGame;
} );