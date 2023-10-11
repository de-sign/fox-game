import * as FOX from '../../source';
import { MyScene } from './TestScene';

window.addEventListener('load', () => {
    const oGame = new FOX.Engine( {
        bDebugMode: true,

        // Scene
        cStartingScene: MyScene,
        
        // Input
        oInput: {
            oControllersOptions: {
                [FOX.INPUT_SOURCE_TYPE.KEYBOARD]: {
                    oMapping: {
                        KeyW: 'Up',
                        KeyS: 'Down',
                        KeyA: 'Left',
                        KeyD: 'Right',

                        ArrowUp: 'Up',
                        ArrowDown: 'Down',
                        ArrowLeft: 'Left',
                        ArrowRight: 'Right'
                    }
                },
                [FOX.INPUT_SOURCE_TYPE.GAMEPAD]: {
                    oMapping: {
                        Axe1Minus: 'Up',
                        Axe1Plus: 'Down',
                        Axe0Minus: 'Left',
                        Axe0Plus: 'Right',
                        
                        Button12: 'Up',
                        Button13: 'Down',
                        Button14: 'Left',
                        Button15: 'Right'
                    }
                }
            }
        },
        
        // Output
        cOutputManager: FOX.OutputPixiJS,
        oOutput: <FOX.IOutputPixiJSOptions>{

            hResizeViewTo: <Window>window,
            bKeepAspectRatio: true,
            bAutoApplyScale: true,

            // PIXI Options
            backgroundColor: '#FFFF99'
        }
    } )

    oGame.oOutput.on(FOX.EVENT_NAME.OUTPUT_RESIZE, oOutput => {
        FOX.HTML.oBody.setStyles( {
            '--scale-width': oOutput.nWidthScale,
            '--scale-height': oOutput.nHeightScale,
            'background-color': '#F00'
        } );
    } );

    FOX.HTML.oBody.onceEvent('click', () => {
        FOX.HTML.oBody.setStyle('background-color', '#00F');
    });

    oGame.start();
} );