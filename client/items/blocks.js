import Phaser from 'phaser'

export default class Blocks extends Phaser.Sprite {
  constructor({game, x, y, asset, health}) {
    super({game, x, y, asset})
    this.health = health
    this.outOfBoundsKill = true;
    this.anchor.setTo(0.5)
  }
}

