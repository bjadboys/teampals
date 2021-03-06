import 'pixi'
import 'p2'
import Phaser from 'phaser'


import Boot from '../states/Boot'
import Preload from '../states/Preload'
import MainGame from '../states/MainGame'
import GameOver from '../states/GameOver'
const HEIGHT = 768
const WIDTH = 416

export default class Game extends Phaser.Game {
  constructor(){
    super(HEIGHT, WIDTH, Phaser.AUTO, 'gameDiv')
    this.state.add('Boot', Boot)
    this.state.add('Preload', Preload)
    this.state.add('MainGame', MainGame)
    this.state.add('GameOver', GameOver)
  }
  startGame(){
    this.state.start('Boot')
  }

}
// export const game = new Game()
