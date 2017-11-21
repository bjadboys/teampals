import Phaser from 'phaser'

//preload state--loads game graphic assets.
export default class Preload extends Phaser.State {
  init() {
    this.assetsReady = false;
    this.assetsLoaded = this.assetsLoaded.bind(this)
  }

  preload() {
    this.load.tilemap('map', '../../assets/map/example_map.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.spritesheet('tileset', '../../assets/map/tilesheet.png', 32, 32);
    this.load.image('sprite', '../../assets/sprites/sprite.png');
    this.load.spritesheet('characters', '../../assets/sprites/characters.png', 32, 32)
    this.assetsLoaded()
  }

  //once assets have been loaded, we proceed to the lobby.
  render(){
    if (this.assetsReady) {
      this.state.start('Lobby')
    }
  }

  assetsLoaded() {
    this.assetsReady = true
  }
}