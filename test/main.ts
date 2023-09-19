import * as FOX from '../source';

var oTest: FOX.InputController | null = null;

window.addEventListener('load', () => {
    const oGame = new FOX.Engine( {
        oControllersOptions: {
            [FOX.INPUT_SOURCE_TYPE.KEYBOARD]: {
                oMapping: {
                    Space: 'Shoot'
                }
            },
            [FOX.INPUT_SOURCE_TYPE.GAMEPAD]: {
                oMapping: {
                    Button6: 'Shoot',
                    Button7: 'Shoot'
                }
            }
        }
    } );

    const oSet = new FOX.InputControllerSet();
    oGame.oInput
        .on(FOX.EVENT_NAME.INPUT_CONTROLLER_CREATE, oController => {
            oSet.add(oController);
        } );

    oGame
        .on(FOX.EVENT_NAME.ENGINE_UPDATE, () => {
            if( oSet.hasPressed('Shoot') ){
                console.log(oGame.nFrames, oSet.getActive());
            }
        } )
        .start();
} );