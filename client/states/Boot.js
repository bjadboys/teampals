import Phaser from 'phaser'


//boot starts up game physics and screen size.
export default class Boot extends Phaser.State {
  init() {
    this.physicsReadyBJAD = false
    this.physicsLoadedBJAD = this.physicsLoadedBJAD.bind(this)
  }

  create() {
    this.game.physics.startSystem(Phaser.Physics.ARCADE)
    this.physicsLoadedBJAD()
  }

  render(){
    if (this.physicsReadyBJAD) {
      this.state.start('Preload')
    }
  }

  physicsLoadedBJAD() {
    this.physicsReadyBJAD = true;
  }

}
