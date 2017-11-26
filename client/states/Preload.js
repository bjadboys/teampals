import Phaser from 'phaser'

//the preload state--loads game graphic assets.
export default class Preload extends Phaser.State {
  init() {
    this.assetsReadyBJAD = false;
    this.assetsLoadedBJAD = this.assetsLoadedBJAD.bind(this)
  }

  preload() {
    //this is loading all the graphics the game need
    this.load.tilemap('map', '../../assets/map/teamPals.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.spritesheet('tileset', '../../assets/map/terrain.png', 32, 32);
    this.load.image('bullet', '../../assets/sprites/bullet.png')
    this.load.spritesheet('characters', '../../assets/sprites/characters.png', 32, 32)
    this.load.spritesheet('block', '../../assets/sprites/block.png', 24, 24)
    this.load.image('hollowPointer', '../../assets/sprites/hollowPointer.png')
    this.load.image('solidPointer', '../../assets/sprites/solidPointer.png')

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
