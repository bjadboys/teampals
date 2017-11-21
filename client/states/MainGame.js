import Phaser from 'phaser'
import Client from '../js/client'
let map, cursors, weapon, fireButton, currentPlayer, previousPosition

export default class MainGame extends Phaser.State {
  constructor(){
    super()
  }
  
  init() {
    this.stage.disableVisibilityChange = true
    this.addNewPlayer = this.addNewPlayer.bind(this)
    this.setCurrentPlayer = this.setCurrentPlayer.bind(this)
    this.removePlayer = this.removePlayer.bind(this)
    this.movePlayer = this.movePlayer.bind(this)
    this.hitEnemy = this.hitEnemy.bind(this)
  }

    //here we create everything we need for the game.
  create() {
    //Add the map to the game.
    this.playerMapBJAD = {}
    this.map = this.game.add.tilemap('map')
    this.map.addTilesetImage('tilesheet', 'tileset')
    console.log(this.map, 'the map')
    let layer;
    for (let i = 0; i < this.map.layers.length; i++) {
      this.layer = this.map.createLayer(i)
    }
    this.layer.inputEnabled = true;
    Client.askNewPlayer()
    //set up the keyboard for movement
    this.cursors = this.game.input.keyboard.createCursorKeys()
    console.log(this.game, 'game in create')
    //create the weapon, create bullets, give them properties.
    this.weapon = this.game.add.weapon(1, 'sprite')
    this.weapon.enableBody = true
    this.game.physics.arcade.enable(this.weapon)
    this.weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS
    this.weapon.bulletAngleOffset = 90
    this.weapon.bulletSpeed = 75
    this.fireButton = this.game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR)
  }

  update() {
    if (this.currentPlayer) {
      this.currentPlayer.body.velocity.x = 0;
      this.currentPlayer.body.velocity.y = 0;
      this.previousPosition = Object.assign({}, this.currentPlayer.position);
      if (this.cursors.left.isDown) {
        this.currentPlayer.body.velocity.x = -150;
        this.currentPlayer.scale.setTo(-4, 4)
        this.currentPlayer.animations.play('right')
      }
      else if (this.cursors.right.isDown) {
        this.currentPlayer.body.velocity.x = 150;
        this.currentPlayer.animations.play('right')
      }
      else if (this.cursors.up.isDown) {
        this.currentPlayer.body.velocity.y = -150;
        this.currentPlayer.animations.play('up')
      }
      else if (this.cursors.down.isDown) {
        this.currentPlayer.body.velocity.y = 150;
      } else {
        this.currentPlayer.scale.setTo(4, 4)
        this.currentPlayer.animations.stop()
      }
      if (this.fireButton.isDown) {
        console.log('check')
        console.log(this.weapon)
        this.weapon.fire();
      }
    }
    console.log(this.game, 'game in update')
    this.game.physics.arcade.overlap(this.weapon.bullets, currentPlayer, this.hitEnemy)
  }
  addNewPlayer(id, x, y) {
    console.log(game, 'game in add new player')
    const newPlayer = game.add.sprite(x, y, 'characters')
    this.newPlayer.scale.setTo(4, 4)
    this.newPlayer.frame = 0
    this.newPlayer.animations.add('right', [0, 1, 2, 3, 4, 5, 6, 7], 10, true)
    this.newPlayer.animations.add('up', [18, 19, 20, 21, 22], 10, true)

    this.playerMapBJAD[id] = this.newPlayer
  }

  setCurrentPlayer(id) {
    this.currentPlayer = this.playerMapBJAD[id]
    this.currentPlayer.enableBody = true
    this.game.physics.arcade.enable(this.currentPlayer)
    this.previousPosition = Object.assign({}, this.currentPlayer.position)
    this.weapon.trackSprite(this.currentPlayer, 12, -50)
  }

  removePlayer(id) {
    this.playerMapBJAD[id].destroy()
    delete this.playerMapBJAD[id]
  }

  movePlayer(id, x, y) {
    this.player = this.playerMapBJAD[id]

    this.player.animations.add('breathe', [3, 5], 2, true)
    this.player.animations.play('breathe')
    var distance = Phaser.Math.distance(player.x, player.y, x, y)
    var duration = distance * 1
    var tween = this.game.add.tween(player)
    tween.to({ x: x, y: y }, duration)
    tween.start()
  }

  hitEnemy = function () {
    this.weapon.bullets.kill()
    // currentPlayer.kill();
  }


}

export const hitEnemy = MainGame.prototype.hitEnemy
export const movePlayer = MainGame.prototype.movePlayer
export const removePlayer = MainGame.prototype.removePlayer
export const addNewPlayer = MainGame.prototype.addNewPlayer
export const setCurrentPlayer = MainGame.prototype.setCurrentPlayer


// console.log(MainGame.hitEnemy)

// const Client = Object.assign({}, MainGame);
// Client.socket = io.connect();

// Client.askNewPlayer = function () {
//   Client.socket.emit('newplayer');
// };

// Client.socket.on('yourID', function (data) {
//   MainGame.setCurrentPlayer(data);
// });

// Client.socket.on('newplayer', function (data) {
//   MainGame.addNewPlayer(data.id, data.x, data.y);
// });

// Client.socket.on('allplayers', function (data) {
//   for (var i = 0; i < data.length; i++) {
//     MainGame.addNewPlayer(data[i].id, data[i].x, data[i].y);
//   }
// });

// Client.socket.on('remove', function (id) {
//   MainGame.removePlayer(id);
// });

// Client.socket.on('move', function (data) {
//   MainGame.movePlayer(data.id, data.x, data.y);
// });

// Client.updatePosition = function (previous, current) {
//   if (previous.x !== current.x || previous.y !== current.y) {
//     Client.socket.emit('click', { x: current.x, y: current.y })
//   }
// };