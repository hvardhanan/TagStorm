import { Scene } from "phaser";
import Player from "../player.js";
import { socketManager } from "@/socket/socketManager.js";

export class BaseMap extends Scene {
    constructor(mapConfig) {
        super(mapConfig.sceneKey);
        this.mapConfig = mapConfig;
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
        this.itPointer = this.add.graphics();
        this.itPointer.fillStyle(0xff0000, 1);
        this.itPointer.fillTriangle(-8, 0, 8, 0, 0, 10); 
        this.itPointer.setDepth(100);
        this.itPointer.setVisible(false);
        this.lastSentX = Math.round(this.player.sprite.x);
        this.lastSentY = Math.round(this.player.sprite.y);
        collisionLayers.forEach(layer => {
            this.physics.add.collider(this.player.sprite, layer);
        });
        this.physics.world.setFPS(60);
        this.cameras.main.startFollow(this.player.sprite, true, 0.05, 0.05);
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.setZoom(1.2)
        this.cameras.main.setRoundPixels(true);

        this.roomId = this.registry.get('roomId');

        // Tag game state
        this.isIt = false;
        this.currentItId = null;
        this._lastTagTime = 0;

        if (this.roomId && socketManager.isConnected) {
            this._setupSocketListeners();
            // Request current "it" status since tag-update may have fired before scene loaded
            socketManager.emit("request-tag-status", { roomId: this.roomId });
        }
    }

    _setupSocketListeners() {
        // When another player moves, update (or create) their sprite
        this._onPlayerMoved = ({ socketId, x, y }) => {
            if (socketId === socketManager.id) return; // ignore self

            let remote = this.remotePlayers.get(socketId);
            if (!remote) {
                // Create a physics-enabled sprite for the remote player
                remote = this.physics.add.sprite(x, y, 'character', 0)
                    .setScale(1.5)
                    .setAlpha(0.85)
                    .setSize(18, 19)
                    .setOffset(7, 5);
                remote.body.setImmovable(true);
                remote.body.setAllowGravity(false);
                remote.targetX = x;
                remote.targetY = y;
                remote.vx = 0;
                remote.vy = 0;
                this.remotePlayers.set(socketId, remote);

                if (socketId === this.currentItId) {
                    remote.setTint(0xff4444);
                }

                // Tag collision detection
                this.physics.add.overlap(this.player.sprite, remote, () => {
                    this._handleCollision(socketId);
                });

            }
            // Calculate difference to determine animation
            const dx = x - remote.x;
            const dy = y - remote.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (dx < -0.5) {
                remote.setFlipX(true);
            } else if (dx > 0.5) {
                remote.setFlipX(false);
            }

            // Assume jumped/falling if significant Y change
            if (dy < -2 || dy > 2) {
                remote.anims.stop();
                remote.setTexture("character", 48);
            } else if (Math.abs(dx) > 0.5) {
                remote.anims.play("player-run", true);
            } else {
                remote.anims.play("player-idle", true);
            }

            // Calculate velocity for client-side extrapolation
            // Assuming updates come ~every 100ms
            remote.targetX = x;
            remote.targetY = y;
            remote.vx = dx / 0.1; // pixels per second
            remote.vy = dy / 0.1;

            // Smooth lerp to the target position with adaptive duration
            // Duration should match expected update interval (~100ms)
            const tweenDuration = 90; // 90ms to ensure smooth transition before next update
            if (remote.moveTween) remote.moveTween.stop();
            remote.moveTween = this.tweens.add({
                targets: remote,
                x,
                y,
                duration: tweenDuration,
                ease: 'Linear',
                onComplete: () => {
                    // Keep idle animation; next update will come soon
                    remote.anims.play("player-idle", true);
                }
            });

        };

        this._onPlayersUpdated = (room) => {
            if (!room || !Array.isArray(room.players)) return;

            const activeSocketIds = new Set(room.players.map(p => p.socketId));
            for (const [sid, sprite] of this.remotePlayers) {
                if (!activeSocketIds.has(sid)) {
                    sprite.destroy();
                    this.remotePlayers.delete(sid);
                }
            }
        };

        // When the server tells us who is "it", update tints
        this._onTagUpdate = ({ itSocketId }) => {
            console.log("[tag-update] received! itSocketId:", itSocketId, "myId:", socketManager.id, "match:", itSocketId === socketManager.id);

            this.currentItId = itSocketId
            const newlyIt = (!this.isIt) && (itSocketId === socketManager.id);
            this.isIt = (itSocketId === socketManager.id);

            // Give the new "It" a 3-second cooldown before they can tag anyone
            // This prevents rapid tag-backs since players might still be overlapping
            if (newlyIt) {
                this._lastTagTime = Date.now();
            }

            // Update visual tints on all remote players
            for (const [sid, sprite] of this.remotePlayers) {
                if (sid === itSocketId) {
                    sprite.setTint(0xff4444); // Red tint = this player is "it"
                } else {
                    sprite.clearTint();
                }
            }

            // Visual feedback on local player
            if (this.isIt) {
                this.player.sprite.setTint(0xff4444);
            } else {
                this.player.sprite.clearTint();
            }
        };

        socketManager.on("player-moved", this._onPlayerMoved);
        socketManager.on("update-players", this._onPlayersUpdated);
        socketManager.on("tag-update", this._onTagUpdate);
    }

    _broadcastPosition() {
        if (!this.roomId || !socketManager.isConnected) return;

        const now = Date.now();
        // Send position updates at fixed 100ms intervals for consistent network traffic
        if (!this._lastPositionUpdateTime) {
            this._lastPositionUpdateTime = now;
        }
        
        if (now - this._lastPositionUpdateTime < 100) return;

        const x = Math.round(this.player.sprite.x);
        const y = Math.round(this.player.sprite.y);

        if (x !== this.lastSentX || y !== this.lastSentY) {
            socketManager.updatePosition(this.roomId, x, y);
            this.lastSentX = x;
            this.lastSentY = y;
        }
        this._lastPositionUpdateTime = now;
    }

    _handleCollision(remoteSocketId) {
        // Only the player who is "it" can tag someone
        if (!this.isIt) return;

        // Cooldown to prevent rapid tagging
        const now = Date.now();
        if (now - this._lastTagTime < 3000) return;
        this._lastTagTime = now;

        // Emit tag event to the server
        socketManager.emit("tag", {
            roomId: this.roomId,
            taggedSocketId: remoteSocketId,
        });
    }

    update() {
        if (this.player) {
            this.player.update();
            this._broadcastPosition();
        }
        let itSprite = null;
        if (this.isIt) {
            itSprite = this.player.sprite;
        } else if (this.currentItId) {
            itSprite = this.remotePlayers.get(this.currentItId);
        }

        if (itSprite && itSprite.active) {
            this.itPointer.setVisible(true);
            const bob = Math.sin(this.time.now / 200) * 5; 
            this.itPointer.x = itSprite.x;
            this.itPointer.y = itSprite.y - 30 + bob;
        } else {
            this.itPointer.setVisible(false);
        }
    }

    shutdown() {
        socketManager.off("player-moved", this._onPlayerMoved);
        socketManager.off("update-players", this._onPlayersUpdated);
        socketManager.off("tag-update", this._onTagUpdate);

        for (const [, sprite] of this.remotePlayers) {
            sprite.destroy();
        }
        this.remotePlayers.clear();
    }
}