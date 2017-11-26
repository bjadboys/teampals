import Phaser from 'phaser'
import BlocksBJAD from '../items/blocks'

let map, cursors, weapon, fireButton, currentPlayer, previousPosition, playerMapBJAD

import Client from '../js/client'

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
    //this.createBlockBJAD = this.createBlockBJAD.bind(this)
    this.stopAnimation = this.stopAnimation.bind(this);
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
    // this.blockBJAD.anchor.x = 0.5
    // this.blockBJAD.anchor.y = 0.5
  }

  //adds the block as a child of the current user sprite, if player is holding Shift and Left or Right (just for test)
  //updates the x y of the block so it is 0 0 on the parent element which is now the current player.
  collectBlockBJAD(playerId, blockId){
    this.player = this.playerMapBJAD[playerId]
    if (!this.player.children.length) {//added this second length check in case player is touching two blocks when they do a pick up.
      this.block = this.blocksBJAD.children.find(block => block.id === blockId)
      if (this.block) {
        this.block.y = 3
        this.block.x = 3
        this.player.addChild(this.block)
      }
    }
  }

  dropBlockBJAD(playerId){
    this.player = this.playerMapBJAD[playerId]
    this.droppedBlock = this.player.removeChild(this.player.children[0])
    this.droppedBlock.x = this.player.x
    this.droppedBlock.y = this.player.y
    this.blocksBJAD.addChild(this.droppedBlock)
    this.droppedBlock = null;
  }

  pickUpBlockPhysicsBJAD() {
    //turns on the overlap pick up. Having this on all the time a player would automatically pick up any block
    //that they touch.
    if (!this.currentPlayer.children.length) { 
      this.game.physics.arcade.overlap(this.currentPlayer, this.blocksBJAD, Client.playerPicksUpBlockBJAD, null, this)
    }
  }

  useBlockBJAD(block){
    Client.blockUsedBJAD(block.id)
  }

  update() {
    //physics added for blocks
    if(this.blocksBJAD.children.length){
      this.blockBJAD.body.velocity.x = 0
      this.blockBJAD.body.velocity.y = 0
    }
    //this collision only matters if we're push blocks. We may want to delete.

    if (this.currentPlayer) {
      this.game.physics.arcade.collide(this.currentPlayer, this.layerCollision)
      //collision added for blocks below. With this on player pushes the block around. Comment in for pushing physics
      // this.game.physics.arcade.collide(this.currentPlayer, this.blocksBJAD)
      //when the above is on it makes it impossible to push  a block out of a corner.
      this.currentPlayer.body.velocity.x = 0;
      this.currentPlayer.body.velocity.y = 0;

      Client.updatePosition(this.previousPosition, this.currentPlayer.position, this.currentPlayer.direction);
      this.previousPosition = Object.assign({}, this.currentPlayer.position);

      this.findPossibleTarget();

      let moving = false
      if (this.cursors.left.isDown) {
        moving = true
        this.currentPlayer.body.velocity.x = -150;
        this.currentPlayer.direction = 'left';
        this.currentPlayer.animations.play('right')
        if (this.cursors.left.shiftKey) {
          //collection added for blocks below. Comment in for block to be added as child sprite to player.
          this.pickUpBlockPhysicsBJAD()
        } 
        console.log(this.currentPlayer.direction)
      }
      if (this.cursors.right.isDown) {
        moving = true
        this.currentPlayer.body.velocity.x = 150;
        this.currentPlayer.direction = 'right';
        this.currentPlayer.animations.play('right')
        if(this.cursors.right.shiftKey){
          this.pickUpBlockPhysicsBJAD()
        }
        console.log(this.currentPlayer.direction)
      }
      if (this.cursors.up.isDown) {

        moving = true
        this.currentPlayer.body.velocity.y = -150;
        this.currentPlayer.direction = 'up';
        this.currentPlayer.animations.play('up')
        if (this.cursors.up.shiftKey) {
          this.pickUpBlockPhysicsBJAD()
        }
        console.log(this.currentPlayer.direction)
      }
      if (this.cursors.down.isDown) {
        moving = true
        this.currentPlayer.body.velocity.y = 150;
        if (this.cursors.down.shiftKey) {
          this.pickUpBlockPhysicsBJAD()
        }
        this.currentPlayer.direction = 'down';
        this.currentPlayer.animations.play('up')
        console.log(this.currentPlayer.direction)
      }
      if (!moving) {
        this.currentPlayer.animations.stop()
      }
      if (this.fireButton.isDown) {
        Client.SEND_fire(this.currentPlayer.position);
        //if you shoot the gun, you drop the block.
        //the block is removed from current player's children and added back to blocks group.
        //the block's x y is updated with the players x y.
        if (this.currentPlayer.children.length) {
          Client.playerDropsBlockBJAD(this.currentPlayer.id)
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
    this.currentPlayer.direction = 'right';
    this.currentPlayer.id = id;
    this.currentPlayer.pointer = null;
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
    //TODO: Add direction parameter to play corresponding animation
    this.player.animations.play('right')
    var distance = Phaser.Math.distance(this.player.x, this.player.y, x, y)
    var duration = distance * 1
    var tween = this.game.add.tween(this.player)
    tween.to({ x: x, y: y }, duration, Phaser.Easing.Default, true, 0, 0)
  }

  removeBlockBJAD(usedBlockId) {
    this.blocksBJAD[usedBlockId].kill()
  }

  addBlockBJAD(id, x, y) {
    this.blockBJAD = this.blocksBJAD.create(x, y, 'block')
    this.blockBJAD.id = id;
    this.blockBJAD.body.collideWorldBounds = true
  }

  stopAnimation(id) {
    this.player = this.playerMapBJAD[id]
    this.player.animations.stop()
  }

  findPossibleTarget() {
    let allPlayersObj = this.playerMapBJAD

    Object.keys(allPlayersObj).forEach(id => {
      if (Number(id) !== this.currentPlayer.id) {
        let dx = allPlayersObj[id].position.x - this.currentPlayer.position.x;
        let dy = allPlayersObj[id].position.y - this.currentPlayer.position.y;
        let calcDist = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
        if (calcDist < 100) {
          this.possibleTarget = allPlayersObj[id];
          if (this.currentPlayer.pointer) {
            this.currentPlayer.pointer.position.x = allPlayersObj[id].position.x;
            this.currentPlayer.pointer.position.y = allPlayersObj[id].position.y - 5;
          } else {
            let hollowPointer = this.game.add.sprite(allPlayersObj[id].position.x, allPlayersObj[id].position.y - 5, 'hollowPointer')
            hollowPointer.anchor.x = 0.5;
            hollowPointer.anchor.y = 1.0;
            this.currentPlayer.pointer = hollowPointer;
          }
        } else {
          if (this.currentPlayer.pointer) {
            this.currentPlayer.pointer.destroy();
          }
          this.possibleTarget = null;
          this.currentPlayer.pointer = null;
        }
      }
    })
  }

}
