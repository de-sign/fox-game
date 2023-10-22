import * as FOX from '../../source';
import { MyScene } from './TestScene';

window.addEventListener('load', () => {
    const oGame = new FOX.Engine( {
        bDebugMode: true,

        // Scene
        oScene: {
            cStartingScene: MyScene,
        },
        
        // Input
        oInput: {
            oControllersOptions: {
                [FOX.INPUT_SOURCE_TYPE.KEYBOARD]: {
                    oMapping: {
                        GameUp: ['KeyW', 'ArrowUp'],
                        GameDown: ['KeyS', 'ArrowDown'],
                        GameLeft: ['KeyA', 'ArrowLeft'],
                        GameRight: ['KeyD', 'ArrowRight']
                    }
                },
                [FOX.INPUT_SOURCE_TYPE.GAMEPAD]: {
                    oMapping: {
                        GameUp: ['Axe1Minus', 'Button12'],
                        GameDown: ['Axe1Plus', 'Button13'],
                        GameLeft: ['Axe0Minus', 'Button14'],
                        GameRight: ['Axe0Plus', 'Button15']
                    }
                }
            }
        },
        
        // Output
        cOutputManager: FOX.OutputPixiJS,
        oOutput: <FOX.IOutputPixiJSOptions>{

            nAspectType: FOX.OUTPUT_ASPECT_TYPE.EXTEND,

            // PIXI Options
            oRenderer: {
                backgroundColor: '#FFFF99'
            }
        }
    } )

    oGame.oOutput.on(FOX.EVENT_NAME.OUTPUT_RESIZE, oOutput => {
        FOX.HTML.oBody.setStyles( {
            '--scale-width': oOutput.nWidthScale,
            '--scale-height': oOutput.nHeightScale,
            'background-color': '#F00'
        } );
    } );

    oGame.start();

    window['oGame'] = oGame;
} );