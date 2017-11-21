import Phaser from 'phaser'
let map, cursors, weapon, fireButton, currentPlayer, previousPosition, playerMapBJAD 

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

    this.layerGrass = this.map.createLayer('grass')
    this.layerCollision = this.map.createLayer('collision')
    this.game.physics.arcade.enable(this.layerCollision)
    this.map.setCollisionBetween(0, 48 * 32, true, this.layerCollision)

    let layer;
    for (let i = 0; i < this.map.layers.length; i++) {
      this.layer = this.map.createLayer(i)
    }
    this.layer.inputEnabled = true;
    Client.askNewPlayer()
    //set up the keyboard for movement
    this.cursors = this.game.input.keyboard.createCursorKeys()
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
      this.game.physics.arcade.collide(this.currentPlayer, this.layerCollision)

      this.currentPlayer.body.velocity.x = 0;
      this.currentPlayer.body.velocity.y = 0;

      Client.updatePosition(this.previousPosition, this.currentPlayer.position);
      this.previousPosition = Object.assign({}, this.currentPlayer.position);
      
      let moving = false
      
      if (this.cursors.left.isDown) {
        moving = true
        this.currentPlayer.body.velocity.x = -150;
        this.currentPlayer.animations.play('right')
      }
      if (this.cursors.right.isDown) {
        moving = true
        this.currentPlayer.body.velocity.x = 150;
        this.currentPlayer.animations.play('right')
      }
      if (this.cursors.up.isDown) {
        moving = true
        this.currentPlayer.body.velocity.y = -150;
        this.currentPlayer.animations.play('up')
      }
      if (this.cursors.down.isDown) {
        moving = true
        this.currentPlayer.body.velocity.y = 150;
      } 
      if (!moving){
        this.currentPlayer.animations.stop()
      }
      if (this.fireButton.isDown) {
        Client.SEND_fire(this.currentPlayer.position);
      }
    }
  }
  
  addNewPlayer(id, x, y) {
    this.newPlayer = this.game.add.sprite(x, y, 'characters')
    this.newPlayer.scale.setTo(4, 4)
    this.newPlayer.frame = 0
    this.newPlayer.animations.add('right', [0, 1, 2, 3, 4, 5, 6, 7], 10, true)
    this.newPlayer.animations.add('up', [18, 19, 20, 21, 22], 10, true)
    
    this.playerMapBJAD[id] = this.newPlayer
  }
  
  setCurrentPlayer(id) {
    console.log(this.playerMapBJAD, 'this is the map')
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
import Client from '../js/client'


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