import { Scene } from "phaser";
import Player from "../player.js";
import { socketManager } from "@/socket/socketManager.js";

export class BaseMap extends Scene {
    constructor(mapConfig) {
        super(mapConfig.sceneKey);
        this.mapConfig = mapConfig;

        /** @type {Map<string, Phaser.GameObjects.Sprite>} socketId → sprite */
        this.remotePlayers = new Map();
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

        /* ── Socket: multiplayer wiring ──────────── */
        this.roomId = this.registry.get('roomId');

        if (this.roomId && socketManager.isConnected) {
            this._setupSocketListeners();
        }
    }

    /* ─── Socket listener setup ──────────────────── */

    _setupSocketListeners() {
        // When another player moves, update (or create) their sprite
        this._onPlayerMoved = ({ socketId, x, y }) => {
            if (socketId === socketManager.id) return; // ignore self

            let remote = this.remotePlayers.get(socketId);
            if (!remote) {
                // Create a ghost sprite for the remote player
                remote = this.add.sprite(x, y, 'character', 0)
                    .setScale(1.5)
                    .setAlpha(0.85);
                this.remotePlayers.set(socketId, remote);
            }
            // Smooth lerp to the target position
            this.tweens.add({
                targets: remote,
                x,
                y,
                duration: 100,
                ease: 'Linear',
            });
        };

        // When a player disconnects or leaves, remove their sprite
        this._onPlayersUpdated = (playersList) => {
            if (!Array.isArray(playersList)) return;

            const activeSocketIds = new Set(playersList.map(p => p.socketId));
            for (const [sid, sprite] of this.remotePlayers) {
                if (!activeSocketIds.has(sid)) {
                    sprite.destroy();
                    this.remotePlayers.delete(sid);
                }
            }
        };

        socketManager.on("player-moved", this._onPlayerMoved);
        socketManager.on("update-players", this._onPlayersUpdated);
    }

    /* ─── Position broadcast throttle ────────────── */

    _broadcastPosition() {
        if (!this.roomId || !socketManager.isConnected) return;

        const x = Math.round(this.player.sprite.x);
        const y = Math.round(this.player.sprite.y);

        // Only send if the position actually changed
        if (x !== this._lastX || y !== this._lastY) {
            socketManager.updatePosition(this.roomId, x, y);
            this._lastX = x;
            this._lastY = y;
        }
    }

    /* ─── Game loop ──────────────────────────────── */

    update(time, delta) {
        if (this.player) {
            this.player.update();
            this._broadcastPosition();
        }
    }

    /* ─── Cleanup on scene shutdown ──────────────── */

    shutdown() {
        socketManager.off("player-moved", this._onPlayerMoved);
        socketManager.off("update-players", this._onPlayersUpdated);

        for (const [, sprite] of this.remotePlayers) {
            sprite.destroy();
        }
        this.remotePlayers.clear();
    }
}