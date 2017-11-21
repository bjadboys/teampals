import 'pixi'
import 'p2'
import Phaser from 'phaser'


import Boot from '../states/Boot'
import Preload from '../states/Preload'
import MainGame from '../states/MainGame'
import Lobby from '../states/Lobby'
import GameOver from '../states/GameOver'

export default class Game extends Phaser.Game {
  constructor(){
    super('100%', '100%', Phaser.AUTO, 'app')
    console.log('Game is running')
    this.state.add('Boot', Boot)
    this.state.add('Preload', Preload)
    this.state.add('Lobby', Lobby)
    this.state.add('MainGame', MainGame)
    this.state.add('GameOver', GameOver)

    this.state.start('Boot')
  }

}
console.log('running')
export const game = new Game()
