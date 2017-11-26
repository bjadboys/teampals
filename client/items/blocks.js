import Phaser from 'phaser'

export default class BlocksBJAD extends Phaser.Sprite {
  constructor({game, x, y, asset, health}) {
    super({game, x, y, asset})
    this.game = game
    this.health = health
    this.outOfBoundsKill = true;
    this.anchor.setTo(0.5)
    this.game.physics.arcade.enable(this)
  }
}