import { EventBus } from "../../EventBus";
import { Scene } from "phaser";

export class OfficeMap extends Scene{
    constructor(){
        super('OfficeMap');
    }
    preload(){
        // Assets for this scene are loaded in the Preloader scene
        this.load.tilemapTiledJSON('house', '/assets/maps/house.json');
        this.load.image('house-tiles', '/assets/tiles/house-tiles.png');
        this.load.image('avatar', '/assets/avatars/avatar.png');
        //WE CAN ADD/LOAD SOME CHARACTERS OVER HERE 
    }

    create(){
        const map = this.make.tilemap({key: "house"});
        const tileset = map.addTilesetImage(map.tilesets[0].name, 'house-tiles');

        map.createLayer('grass', tileset);
        const walls = map.createLayer('walls', tileset);
        walls.setCollisionByProperty({collides: true})

        this.player = this.physics.add.sprite(400, 300, 'avatar');
        this.physics.add.collider(this.player, walls);
        this.cameras.main.startFollow(this.player);
        EventBus.emit('current-scene-ready', this);

    }
    update() {
        const keys = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
        });
        const speed = 175;
        this.player.setVelocity(0);
        if (keys.left.isDown) this.player.setVelocityX(-speed);
        else if (keys.right.isDown) this.player.setVelocityX(speed);
        if (keys.up.isDown) this.player.setVelocityY(-speed);
        else if (keys.down.isDown) this.player.setVelocityY(speed);
    }
}