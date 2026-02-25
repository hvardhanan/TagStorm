import Phaser from 'phaser';
import { DungeonMap } from './scenes/maps/dungeon';

const ALL_SCENES = [DungeonMap];

/**
 * Starts the Phaser game with the selected map scene first.
 * @param {string} parent   – DOM element ID to mount into
 * @param {string} sceneKey – Scene key of the map to launch (matches maps[].sceneKey)
 */
const StartGame = (parent, sceneKey) => {
    const selectedIdx = sceneKey
        ? ALL_SCENES.findIndex(S => S.SCENE_KEY === sceneKey)
        : 0;
    const orderedScenes = selectedIdx > 0
        ? [ALL_SCENES[selectedIdx], ...ALL_SCENES.filter((_, i) => i !== selectedIdx)]
        : ALL_SCENES;

    const config = {
        type: Phaser.AUTO,
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: '#000000',
        parent,
        scene: orderedScenes,
        pixelArt: true,
        roundPixels: true,
        physics: {
            default: 'arcade',
            arcade: {
                // debug: true,
                gravity: { y: 1000 },
            }
        },
        // scale: {
        // mode: Phaser.Scale.FIT,
        // autoCenter: Phaser.Scale.CENTER_BOTH,
        // },
    };

    return new Phaser.Game(config);
};
export default StartGame;
