import Phaser from 'phaser'
import {throttle} from 'lodash'

import Client from '../js/client'
import updateMaker  from './update'
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
    this.stopAnimation = this.stopAnimation.bind(this)
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
    this.lockOnButton = this.game.input.keyboard.addKey(Phaser.KeyCode.C)
    this.blocksBJAD = this.add.group()
    this.blocksBJAD.enableBody = true
    this.weaponsBJAD = this.add.group()
    this.weaponsBJAD.enableBody = true
    this.healthText = this.game.add.text(5, 5, 'HEALTH: ')
    this.ammoText = this.game.add.text(250, 5, 'AMMO: ')
    this.healthText.fixedToCamera = true;
    this.ammoText.fixedToCamera = true;
    this.death = this.map.layers[2].data
    this.deathTiles = this.death.map( array => array.filter((element) => element.index !== -1))
    this.game.world.bringToTop(this.ammoText)
    this.game.world.bringToTop(this.healthText)

    this.firstWeapon = this.weaponsBJAD.create(100, 100, 'weapon')
    this.firstWeapon.id = 0
    this.secondWeapon = this.weaponsBJAD.create(200, 200, 'weapon2')
    this.secondWeapon.id = 1

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

    //Getting a weapon
  pickUpWeaponPhysicsBJAD() {
    let weapon = arguments[1]
    this.currentPlayer.selectedWeapon = weapon.key
    Client.playerPicksUpWeaponBJAD(this.currentPlayer, weapon)
  }

  removeWeaponBJAD(weaponId) {
    this.weaponsBJAD.children[weaponId].kill()

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

  addNewPlayer(id, x, y, serverSideTime) {
    this.newPlayer = this.game.add.sprite(x, y, 'characters')
    this.newPlayer.alive = true;
    this.newPlayer.moving = false;
    this.newPlayer.serverSideTime = serverSideTime
    this.newPlayer.frame = 0
    this.newPlayer.anchor.x = 0.5
    this.newPlayer.anchor.y = 0.5
    this.game.physics.arcade.enable(this.newPlayer)
    this.newPlayer.body.collideWorldBounds = true
    this.newPlayer.animations.add('right', [0, 1, 2, 3, 4, 5], 10, true)
    this.newPlayer.animations.add('upRight', [0, 1, 2, 3, 4, 5], 10, true)
    this.newPlayer.animations.add('downRight', [0, 1, 2, 3, 4, 5], 10, true)
    this.newPlayer.animations.add('down', [6, 7, 8, 9, 10, 11], 10, true)
    this.newPlayer.animations.add('left', [12, 13, 14, 15, 16, 17], 10, true)
    this.newPlayer.animations.add('upLeft', [12, 13, 14, 15, 16, 17], 10, true)
    this.newPlayer.animations.add('downLeft', [12, 13, 14, 15, 16, 17], 10, true)
    this.newPlayer.animations.add('up', [18, 19, 20, 21, 22, 23], 10, true)
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
    this.currentPlayer.direction = 'down'
    this.currentPlayer.health = 100
    this.currentPlayer.ammo = 0
    this.currentPlayer.id = id
    this.currentPlayer.pointer = null;
    this.currentPlayer.possibleTarget = null;
    this.currentPlayer.lockOnToggle = false;
    this.currentPlayer.targetLocked = false;
    this.game.camera.follow(this.currentPlayer)
    this.currentPlayer.enableBody = true
    this.game.physics.arcade.enable(this.currentPlayer)
    this.previousPosition = Object.assign({}, this.currentPlayer.position)
    this.currentPlayer.firing = false
    this.currentPlayer.holdToggle = false


    this.currentPlayer.selectedWeapon = null
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
    this.player.kill();
    if (this.currentPlayer.id === id && !this.currentPlayer.alive && this.currentPlayer.pointer){
      this.currentPlayer.pointer.destroy();
      this.currentPlayer.pointer = null;
    }
  }

  movePlayer(id, x, y, serverSideTime, direction) {
    this.player = this.playerMapBJAD[id]

    if (this.player.serverSideTime <= serverSideTime){
      if (!this.player.moving || this.player.direction !== direction){
        this.player.moving = true;
        this.startAnimation(id, direction)
      }
      this.player.serverSideTime = serverSideTime
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

  startAnimation(id, direction){
    this.player = this.playerMapBJAD[id]
    this.player.animations.play(direction)
  }

  lockOnTarget() {
    if (this.currentPlayer.pointer) {
      this.currentPlayer.pointer.destroy();
    }
    let solidPointer = this.game.add.sprite(this.currentPlayer.possibleTarget.position.x, this.currentPlayer.possibleTarget.position.y - 15, 'solidPointer');
    solidPointer.scale.setTo(0.07);
    solidPointer.anchor.x = 0.5;
    solidPointer.anchor.y = 1.0;
    this.currentPlayer.pointer = solidPointer;
  }

  findPossibleTarget() {
    let allPlayersObj = this.playerMapBJAD

    Object.keys(allPlayersObj).forEach(id => {
      if (Number(id) !== this.currentPlayer.id) {
        let dx = allPlayersObj[id].position.x - this.currentPlayer.position.x;
        let dy = allPlayersObj[id].position.y - this.currentPlayer.position.y;
        let calcDist = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
        if (calcDist < 100) {
          this.currentPlayer.possibleTarget = allPlayersObj[id];
          if (this.currentPlayer.pointer) {
            if (!allPlayersObj[id].alive) {
              this.currentPlayer.pointer.destroy();
            }
            this.currentPlayer.pointer.position.x = allPlayersObj[id].position.x;
            this.currentPlayer.pointer.position.y = allPlayersObj[id].position.y - 15;
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
          this.currentPlayer.possibleTarget = null;
          this.currentPlayer.pointer = null;
        }
      }
    })
  }

}

MainGame.prototype.update = updateMaker(Client)
