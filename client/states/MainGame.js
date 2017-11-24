import Phaser from 'phaser'
import BlocksBJAD from '../items/blocks'

let map, cursors, weapon, fireButton, currentPlayer, previousPosition, playerMapBJAD


export default class MainGame extends Phaser.State {
  constructor() {
    super()
    Phaser.Component.Core.skipTypeChecks = true
  }

  init() {
    this.stage.disableVisibilityChange = true
    this.addNewPlayer = this.addNewPlayer.bind(this)
    this.setCurrentPlayer = this.setCurrentPlayer.bind(this)
    this.removePlayer = this.removePlayer.bind(this)
    this.movePlayer = this.movePlayer.bind(this)
    // this.createBlockBJAD = this.createBlockBJAD.bind(this)
  }

  //here we create everything we need for the game.
  create() {
    //Add the map to the game.
    this.game.world.setBounds(0, 0, 48 * 32, 48 * 32)
    this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL
    this.playerMapBJAD = {}
    this.map = this.game.add.tilemap('map')
    this.map.addTilesetImage('terrain', 'tileset')

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
    this.fireButton = this.game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR)

    //right now a moveable block appears at 100/100 for testing.
    //Block has its own sprite class which I will integrate later.
    //Right now I make the block below:
    //next iteration: server will create the blocks and broadcast to each player/client.
    this.blocksBJAD = this.add.group()
    this.blocksBJAD.enableBody = true
    this.blockBJAD = this.blocksBJAD.create(100, 100, 'block')
    this.blockBJAD.body.collideWorldBounds = true
    // this.blockBJAD.anchor.x = 0.5
    // this.blockBJAD.anchor.y = 0.5
  }

  //adds the block as a child of the current user sprite, if player is holding Shift and Left(just for test)
  collectBlockBJAD(currentPlayer, block){
    currentPlayer.addChild(block)
    console.log(block)
  }

  pickUpBlockPhysicsBJAD(){
    this.game.physics.arcade.overlap(this.currentPlayer, this.blocksBJAD, this.collectBlockBJAD, null, this)
  }

  update() {
    //physics added for blocks
    this.blockBJAD.body.velocity.x = 0
    this.blockBJAD.body.velocity.y = 0
    this.game.physics.arcade.collide(this.blocksBJAD, this.layerCollision)

    if (this.currentPlayer) {
      this.game.physics.arcade.collide(this.currentPlayer, this.layerCollision)
      //collision added for blocks below. With this on player pushes the block around. Comment in for pushing physics
      // this.game.physics.arcade.collide(this.currentPlayer, this.blocksBJAD)
      this.currentPlayer.body.velocity.x = 0;
      this.currentPlayer.body.velocity.y = 0;

      Client.updatePosition(this.previousPosition, this.currentPlayer.position);
      this.previousPosition = Object.assign({}, this.currentPlayer.position);

      let moving = false

      if (this.cursors.left.isDown) {
        moving = true
        this.currentPlayer.body.velocity.x = -150;
        this.currentPlayer.animations.play('right')
        if (this.cursors.left.shiftKey) {
          //collection added for blocks below. Comment in for block to be added as child sprite to player.
          this.pickUpBlockPhysicsBJAD()
        } 
      }
      if (this.cursors.right.isDown) {
        moving = true
        this.currentPlayer.body.velocity.x = 150;
        this.currentPlayer.animations.play('right')
        if(this.cursors.right.shiftKey){
          this.pickUpBlockPhysicsBJAD()
        }
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
      if (!moving) {
        this.currentPlayer.animations.stop()
      }
      if (this.fireButton.isDown) {
        Client.SEND_fire(this.currentPlayer.position);
        //if you shoot the gun, you drop the block.
        //the block is removed from current player's children and added back to blocks group.
        if (this.currentPlayer.children.length) {
          this.blocksBJAD.addChild(this.currentPlayer.removeChildAt(0))
        }
      }
    }
  }



  addNewPlayer(id, x, y) {
    this.newPlayer = this.game.add.sprite(x, y, 'characters')
    this.newPlayer.frame = 0
    this.newPlayer.anchor.x = .5
    this.newPlayer.anchor.y = .5
    this.game.physics.arcade.enable(this.newPlayer)
    this.newPlayer.body.collideWorldBounds = true
    this.newPlayer.animations.add('right', [0, 1, 2, 3, 4, 5, 6, 7], 10, true)
    this.newPlayer.animations.add('up', [18, 19, 20, 21, 22], 10, true)

    this.playerMapBJAD[id] = this.newPlayer
  }

  setCurrentPlayer(id) {
    this.currentPlayer = this.playerMapBJAD[id]
    this.game.camera.follow(this.currentPlayer)
    this.currentPlayer.enableBody = true
    this.game.physics.arcade.enable(this.currentPlayer)
    this.previousPosition = Object.assign({}, this.currentPlayer.position)
  }

  removePlayer(id) {
    this.playerMapBJAD[id].destroy()
    delete this.playerMapBJAD[id]
  }

  killPlayer(id) {
    this.playerMapBJAD[id].kill();
  }

  movePlayer(id, x, y) {
    this.player = this.playerMapBJAD[id]

    this.player.animations.add('breathe', [3, 5], 2, true)
    this.player.animations.play('breathe')
    var distance = Phaser.Math.distance(this.player.x, this.player.y, x, y)
    var duration = distance * 1
    var tween = this.game.add.tween(this.player)
    tween.to({ x: x, y: y }, duration)
    tween.start()
  }



}

import Client from '../js/client'

