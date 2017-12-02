import Phaser from 'phaser'
import store, {gameOverAction, resetLobbyAction} from '../store/'
import socket from '../js/socket'

const ClientGameOver = {}
ClientGameOver.socket = socket

ClientGameOver.resetServer = function () {
  ClientGameOver.socket.emit('gameOverReset')
}

export default class GameOver extends Phaser.State {
  init() {
    console.log(this)
    store.dispatch(resetLobbyAction())
    store.dispatch(gameOverAction())
    ClientGameOver.resetServer()
  }

  destroy() {

  }
}