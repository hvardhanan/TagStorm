import Phaser from 'phaser';
import { OfficeMap } from './scenes/maps/house-map';

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    scene: [
        OfficeMap
    ],
    pixelArt: true,
    physics: {default: 'arcade'}
};

const StartGame = (parent) => {

    return new Phaser.Game({ ...config, parent });

}

export default StartGame;
