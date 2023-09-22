import * as FOX from '../source';
import { MyScene } from './TestScene';

window.addEventListener('load', () => {
    const oGame = new FOX.Engine( {
        oStartingScene: MyScene,
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
    } ).start();
} );