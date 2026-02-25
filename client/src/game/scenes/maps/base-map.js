import { Scene } from "phaser";
import Player from "../player.js";

export class BaseMap extends Scene {
    constructor(mapConfig) {
        super(mapConfig.sceneKey);
        this.mapConfig = mapConfig;
    }

    preload() {
        const { tilemapKey, tilemapJson, tilesets } = this.mapConfig;
        for (const { key, image } of tilesets) {
            this.load.image(key, image);
        }
        this.load.tilemapTiledJSON(tilemapKey, tilemapJson);
        this.load.spritesheet('character', '/assets/tiles/character.png', { frameWidth: 32, frameHeight: 32 });
    }

    create() {
        const map = this.make.tilemap({ key: this.mapConfig.tilemapKey });
        const tilesetName = this.mapConfig.tilesets[0].name;
        const tilesetKey = this.mapConfig.tilesets[0].key;
        const tiles = map.addTilesetImage(tilesetName, tilesetKey, 16, 16, 0, 0);

        let collisionLayers = [];
        this.mapConfig.layers.forEach(({ name, collides }) => {
            const layer = map.createLayer(name, tiles);
            if (collides) {
                layer.setCollisionByExclusion([-1]);
                collisionLayers.push(layer);
            }
        });

        const spawnPoints = map.getObjectLayer('SpawnPoints');
        let spawnX = this.mapConfig.spawnX;
        let spawnY = this.mapConfig.spawnY;

        if (spawnPoints && spawnPoints.objects.length > 0) {
            const randomSpawn = spawnPoints.objects[Math.floor(Math.random() * spawnPoints.objects.length)];
            spawnX = randomSpawn.x;
            spawnY = randomSpawn.y;
        }

        this.player = new Player(this, spawnX, spawnY);
        collisionLayers.forEach(layer => {
            this.physics.add.collider(this.player.sprite, layer);
        });
        this.cameras.main.startFollow(this.player.sprite, true, 0.05, 0.05);
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.setRoundPixels(true);
    }

    update() {
        if (this.player) {
            this.player.update();
        }
    }
}