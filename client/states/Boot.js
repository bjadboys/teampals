import Phaser from 'phaser'


//boot starts up game physics and screen size.
export default class Boot extends Phaser.State {
  init() {
    this.physicsReadyBJAD = false
    // this.screenReadyBJAD = true
    this.physicsLoadedBJAD = this.physicsLoadedBJAD.bind(this)
    // this.bootCompleteBJAD = this.physicsReadyBJAD && this.screenReadyBJAD
    // console.log(this.bootCompleteBJAD, 'inside init, bootcompleted')
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
