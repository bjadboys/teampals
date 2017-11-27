import Phaser from 'phaser'
import {throttle} from 'lodash'

import Client from '../js/client'

const hudWait = 500
const wait = 30

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
    this.stopAnimation = this.stopAnimation.bind(this);
    this.startAnimation = this.startAnimation.bind(this)
    this.pickUpBlockPhysicsBJAD = throttle(this.pickUpBlockPhysicsBJAD.bind(this), wait)
    this.dropBlockPhysicsBJAD = throttle(this.dropBlockPhysicsBJAD.bind(this), wait)
    this.dropBlockBJAD = this.dropBlockBJAD.bind(this)
    this.isInDeathBJAD = this.isInDeathBJAD.bind(this)
    this.dropBlockPhysicsBJAD = this.dropBlockPhysicsBJAD.bind(this)
    this.movementThrottle = throttle(this.movementThrottle.bind(this), wait)
    this.findPossibleTarget = throttle(this.findPossibleTarget.bind(this), wait)
    this.hudThrottle = throttle(this.hudThrottle.bind(this), hudWait)
  }

  //here we create everything we need for the game.
  create() {
    //Add the map to the game.
    this.game.world.setBounds(0, 0, 48 * 32, 48 * 32)
    this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL
    this.playerMapBJAD = {}
    this.playerBaseBJAD = {}
    this.map = this.game.add.tilemap('map')
    this.map.addTilesetImage('terrain', 'tileset')

    this.layerGrass = this.map.createLayer('grass')
    this.layerCollision = this.map.createLayer('collision')
    this.game.physics.arcade.enable(this.layerCollision)
    this.map.setCollisionBetween(0, 48 * 32, true, this.layerCollision)

    for (let i = 0; i < this.map.layers.length; i++) {
      this.layer = this.map.createLayer(i)
    }
    this.layer.inputEnabled = true;
    Client.askNewPlayer()
    //set up the keyboard for movement
    this.cursors = this.game.input.keyboard.createCursorKeys()
    this.fireButton = this.game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR)
    this.pickUpButton = this.game.input.keyboard.addKey(Phaser.KeyCode.X)

    this.blocksBJAD = this.add.group()
    this.blocksBJAD.enableBody = true
    this.healthText = this.game.add.text(5, 5, 'HEALTH: ')
    this.ammoText = this.game.add.text(250, 5, 'AMMO: ')
    this.healthText.fixedToCamera = true;
    this.ammoText.fixedToCamera = true;
    this.death = this.map.layers[2].data
    this.deathTiles = this.death.map( array => array.filter((element) => element.index !== -1))
  }

  isInDeathBJAD(x, y){
    const xIndex = Math.floor(x / 32)
    const yIndex = Math.floor(y / 32)
    return this.death[yIndex][xIndex].index
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

  dropBlockPhysicsBJAD(){
    this.base = this.playerBaseBJAD[this.currentPlayer.id]
    if (this.game.physics.arcade.overlap(this.currentPlayer, this.base)) {
      const playerId = this.currentPlayer.id
      const blockId = this.currentPlayer.children[0].id
      Client.blockUsedBJAD({playerId, blockId})
    } else {
      Client.playerDropsBlockBJAD(this.currentPlayer.id)
    }
  }

  hudThrottle(){
    this.healthText.setText(`HEALTH: ${this.currentPlayer.health}`)
    this.ammoText.setText(`AMMO: ${this.currentPlayer.ammo}`)
  }

  movementThrottle(){
    Client.updatePosition(this.previousPosition, this.currentPlayer.position, this.currentPlayer.direction);
    this.previousPosition = Object.assign({}, this.currentPlayer.position);
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
      console.log(this.currentPlayer.x, '<x|y>', this.currentPlayer.y)
      this.game.physics.arcade.collide(this.currentPlayer, this.layerCollision)
      this.hudThrottle()
      //collision added for blocks below. With this on player pushes the block around. Comment in for pushing physics
      // this.game.physics.arcade.collide(this.currentPlayer, this.blocksBJAD)
      //when the above is on it makes it impossible to push  a block out of a corner.
      this.currentPlayer.body.velocity.x = 0;
      this.currentPlayer.body.velocity.y = 0;
      if (this.isInDeathBJAD(this.currentPlayer.position.x, this.currentPlayer.position.y) !== -1){
      //TODO: Damage player vs kill.
      }

      this.movementThrottle()
      this.findPossibleTarget();

      let moving = false
      if (this.cursors.up.isDown && !this.cursors.left.isDown && !this.cursors.right.isDown) {
        moving = true
        this.currentPlayer.body.velocity.y = -150;
        this.currentPlayer.direction = 'up';
        this.currentPlayer.animations.play('up')
      }
      if (this.cursors.up.isDown && this.cursors.left.isDown && !this.cursors.right.isDown) {
        moving = true
        this.currentPlayer.body.velocity.y = -150;
        this.currentPlayer.body.velocity.x = -150;
        this.currentPlayer.direction = 'up-left';
        this.currentPlayer.animations.play('up')
      }
      if (this.cursors.up.isDown && !this.cursors.left.isDown && this.cursors.right.isDown) {
        moving = true
        this.currentPlayer.body.velocity.y = -150;
        this.currentPlayer.body.velocity.x = 150;
        this.currentPlayer.direction = 'up-right';
        this.currentPlayer.animations.play('up')
      }
      if (this.cursors.down.isDown && !this.cursors.left.isDown && !this.cursors.right.isDown) {
        moving = true
        this.currentPlayer.body.velocity.y = 150;
        this.currentPlayer.direction = 'down';
        this.currentPlayer.animations.play('up')
      }
      if (this.cursors.down.isDown && this.cursors.left.isDown && !this.cursors.right.isDown) {
        moving = true
        this.currentPlayer.body.velocity.y = 150;
        this.currentPlayer.body.velocity.x = -150;
        this.currentPlayer.direction = 'down-left';
        this.currentPlayer.animations.play('up')
      }
      if (this.cursors.down.isDown && !this.cursors.left.isDown && this.cursors.right.isDown) {
        moving = true
        this.currentPlayer.body.velocity.y = 150;
        this.currentPlayer.body.velocity.x = 150;
        this.currentPlayer.direction = 'down-right';
        this.currentPlayer.animations.play('up')
      }
      if (this.cursors.right.isDown && !this.cursors.up.isDown && !this.cursors.down.isDown) {
        moving = true
        this.currentPlayer.body.velocity.x = 150;
        this.currentPlayer.direction = 'right';
        this.currentPlayer.animations.play('right')
      }
      if (this.cursors.left.isDown && !this.cursors.up.isDown && !this.cursors.down.isDown) {
        moving = true
        this.currentPlayer.body.velocity.x = -150;
        this.currentPlayer.direction = 'left';
        this.currentPlayer.animations.play('right')
      }
      if (!moving) {
        this.currentPlayer.animations.stop()
      }
      if (this.fireButton.isDown && !this.currentPlayer.firing) {
        this.currentPlayer.firing = true
        Client.SEND_fire(this.currentPlayer.position);
        //if you shoot the gun, you drop the block.
        //the block is removed from current player's children and added back to blocks group.
        //the block's x y is updated with the players x y.
        if (this.currentPlayer.children.length) {
          this.dropBlockPhysicsBJAD()
        }
      }
      if (this.pickUpButton.isDown) {
        this.pickUpBlockPhysicsBJAD()
      }
      if (!this.fireButton.isDown){
        this.currentPlayer.firing = false
      }
    }
  }

  addNewPlayer(id, x, y, serverSideTime) {
    this.newPlayer = this.game.add.sprite(x, y, 'characters')
    this.newPlayer.moving = false;
    this.newPlayer.serverSideTime = serverSideTime
    this.newPlayer.frame = 0
    this.newPlayer.anchor.x = 0.5
    this.newPlayer.anchor.y = 0.5
    this.game.physics.arcade.enable(this.newPlayer)
    this.newPlayer.body.collideWorldBounds = true
    this.newPlayer.animations.add('right', [0, 1, 2, 3, 4, 5, 6, 7], 10, true)
    this.newPlayer.animations.add('up', [18, 19, 20, 21, 22], 10, true)
    this.playerMapBJAD[id] = this.newPlayer
  }

  addNewBase(base) {
    this.newBase = this.game.add.sprite(base.x, base.y, 'base')
    this.game.physics.arcade.enable(this.newBase)
    this.newBase.body.immovable = true
    this.newBase.health = 1000
    this.playerBaseBJAD[base.id] = this.newBase
  }

  setCurrentPlayer(id) {
    this.currentPlayer = this.playerMapBJAD[id]
    this.currentPlayer.direction = 'right'
    this.currentPlayer.health = 100
    this.currentPlayer.ammo = 0
    this.currentPlayer.id = id
    this.currentPlayer.pointer = null;
    this.game.camera.follow(this.currentPlayer)
    this.currentPlayer.enableBody = true
    this.game.physics.arcade.enable(this.currentPlayer)
    this.previousPosition = Object.assign({}, this.currentPlayer.position)
    this.currentPlayer.firing = false
  }

  removePlayer(id) {
    this.playerMapBJAD[id].destroy()
    delete this.playerMapBJAD[id]
  }

  killPlayer(id) {
    this.player = this.playerMapBJAD[id]
    if (this.player.children.length) {
      this.dropBlockBJAD(id)
    }
    this.playerMapBJAD[id].kill();
  }

  movePlayer(id, x, y, serverSideTime) {
    this.player = this.playerMapBJAD[id]
    if (this.player.serverSideTime<=serverSideTime){
      if(!this.player.moving){
        this.player.moving = true;
        this.startAnimation(id)
      }
      this.player.serverSideTime = serverSideTime
      //TODO: Add direction parameter to play corresponding animation

      this.player.position.x = x;
      this.player.position.y = y;
    }
  }

  removeBlockBJAD(playerId) {
    this.player = this.playerMapBJAD[playerId]
    this.usedBlock = this.player.removeChild(this.player.children[0])
    this.usedBlock.kill()
    this.player.ammo += 10
  }

  addBlockBJAD(id, x, y) {
    this.blockBJAD = this.blocksBJAD.create(x, y, 'block')
    this.blockBJAD.id = id;
    this.blockBJAD.body.collideWorldBounds = true
  }

  stopAnimation(id) {
    this.player = this.playerMapBJAD[id]
    this.player.animations.stop()
    this.player.moving = false;
  }

  startAnimation(id){
    this.player = this.playerMapBJAD[id]
    this.player.animations.play('right')
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
            this.currentPlayer.pointer.position.y = allPlayersObj[id].position.y - 7;
          } else {
            let hollowPointer = this.game.add.sprite(allPlayersObj[id].position.x, allPlayersObj[id].position.y, 'hollowPointer')
            hollowPointer.scale.setTo(0.07);
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
