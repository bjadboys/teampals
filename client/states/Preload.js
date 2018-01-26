import Phaser from 'phaser'

//the preload state--loads game graphic assets.
export default class Preload extends Phaser.State {
  init() {
    this.assetsReadyBJAD = false;
    this.assetsLoadedBJAD = this.assetsLoadedBJAD.bind(this)
  }

  preload() {
    //this is loading all the graphics the game need
    this.load.tilemap('map', '../../assets/map/resourcePals.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.image('Tiles', '../../assets/map/Tiles.png', 32, 32)
    this.load.image('terrain', '../../assets/map/terrain.png', 32, 32);
    this.load.image('bullet', '../../assets/sprites/bullet.png')
    this.load.spritesheet('oldMan', '../../assets/sprites/Character2/Char_2_Run.png', 32, 32)
    this.load.spritesheet('skeleton', '../../assets/sprites/Character3/Char_3_Run.png', 32, 32)
    this.load.spritesheet('goblin', '../../assets/sprites/Character5/Char_5_Run.png', 32, 32)
    this.load.spritesheet('wizard', '../../assets/sprites/Character6/Char_6_Run.png', 32, 32)
    this.load.spritesheet('block', '../../assets/sprites/block.png', 24, 24)
    this.load.spritesheet('corpseBlock', '../../assets/sprites/corpseBlock.png', 32, 32)
    this.load.spritesheet('deathPoof', '../../assets/sprites/Death_Poof.png', 32, 32)
    this.load.image('hollowPointer', '../../assets/sprites/pointerHollow.png', 32, 32)
    this.load.image('solidPointer', '../../assets/sprites/pointerSolid.png', 32, 32)
    this.load.image('base', '../../assets/sprites/Base.png')
    this.load.image('weapon', '../../assets/sprites/Weapons/Spear.png')
    this.load.image('weapon2', '../../assets/sprites/Weapons/Sword.png')


    //lobby assets go here too.
    //Once the above have run, we run assets loaded
    //which sets assets ready to true.
    this.assetsLoadedBJAD()
  }

  //once assets have been loaded, and assets ready is true
  //we can proceed to the lobby, as run in this.state.start('Lobby')
  render() {
    if (this.assetsReadyBJAD) {
      this.state.start('MainGame')
    }
  }

  assetsLoadedBJAD() {
    this.assetsReadyBJAD = true
  }
}
