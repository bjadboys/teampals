import Phaser from 'phaser'
import {throttle} from 'lodash'

import Client from '../js/client'
import updateMaker  from './update'

import store, { gameOverAction, resetLobbyAction } from '../store/'
import socket from '../js/socket'

const ClientGameOver = {}
ClientGameOver.socket = socket

ClientGameOver.resetServer = function () {
  ClientGameOver.socket.emit('gameOverReset')
}

//Throttle Speed Variables
const hudWait = 125
const wait = 30
const deathWait = 500

//Map Variables
const tilePx = 32
const mapHeight = 70
const mapWidth = 70
//Sprite Animation Variables
const animationFrequency = 10
const pointerOffset = 15
const pointerScale = 0.07
const pointerAnchorX = 0.5
const pointerAnchorY = 1.0
const playerAnchorX = 0.5
const playerAnchorY = 0.5

//Gameplay Variables
const targetRange = 200
const baseHealth = 5000
const playerHealth = 100
const playerAmmo = 0

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
    this.changeHealth = this.changeHealth.bind(this)
    this.deathLayerChangeHealth = throttle(this.deathLayerChangeHealth.bind(this), deathWait)
    this.pickUpBlockPhysicsBJAD = throttle(this.pickUpBlockPhysicsBJAD.bind(this), wait)
    this.dropBlockPhysicsBJAD = throttle(this.dropBlockPhysicsBJAD.bind(this), wait)
    this.dropBlockBJAD = this.dropBlockBJAD.bind(this)
    this.isInDeathBJAD = throttle(this.isInDeathBJAD.bind(this), deathWait)
    this.dropBlockPhysicsBJAD = this.dropBlockPhysicsBJAD.bind(this)
    this.movementThrottle = throttle(this.movementThrottle.bind(this), wait)
    this.findPossibleTarget = throttle(this.findPossibleTarget.bind(this), wait)
    this.hudThrottle = throttle(this.hudThrottle.bind(this), hudWait)
    this.isNotLoading = false;
  }

  //here we create everything we need for the game.
  create() {
    //Add the map to the game.
    this.game.world.setBounds(0, 0, mapWidth * tilePx, mapHeight * tilePx)
    this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL
    this.playerMapBJAD = {}
    this.playerBaseBJAD = {}
    this.map = this.game.add.tilemap('map')
    this.map.addTilesetImage('terrain')
    this.map.addTilesetImage('Tiles')

    this.layerGrass = this.map.createLayer('grass')
    this.layerCollision = this.map.createLayer('collision')
    this.game.physics.arcade.enable(this.layerCollision)
    //TODO: Confirm inputs below which .... 48? 32?
    this.map.setCollisionBetween(0, 48 * 32, true, this.layerCollision)

    for (let i = 0; i < this.map.layers.length; i++) {
      this.layer = this.map.createLayer(i)
    }
    this.layer.inputEnabled = true;
    //set up the keyboard for movement
    this.cursors = this.game.input.keyboard.createCursorKeys()
    this.fireButton = this.game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR)
    this.smashButton = this.game.input.keyboard.addKey(Phaser.KeyCode.Z)
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
    this.death = this.map.layers[4].data
    this.deathTiles = this.death.map( array => array.filter((element) => element.index !== -1))
    // this.firstWeapon = this.weaponsBJAD.create(100, 100, 'weapon')
    // this.firstWeapon.id = 0
    // this.firstWeapon.isWeapon = true
    // this.secondWeapon = this.weaponsBJAD.create(200, 200, 'weapon2')
    // this.secondWeapon.isWeapon = true
    // this.secondWeapon.id = 1
  }

  isInDeathBJAD(x, y){
    const xIndex = Math.floor(x / tilePx)
    const yIndex = Math.floor(y / tilePx)
    return this.death[yIndex][xIndex].index
  }

  //adds the block as a child of the current user sprite, if player is holding Shift and Left or Right (just for test)
  //updates the x y of the block so it is 0 0 on the parent element which is now the current player.
  collectBlockBJAD(playerId, blockId){
    this.player = this.playerMapBJAD[playerId]
    const hasBlock = this.player.children.find(item => item.isBlock)
    if (!hasBlock) {//added this second length check in case player is touching two blocks when they do a pick up.
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
    const block = this.player.children.find(item => item.isBlock)
    if (block) {
      this.droppedBlock = this.player.removeChild(block)
      this.droppedBlock.x = this.player.x
      this.droppedBlock.y = this.player.y
      this.blocksBJAD.addChild(this.droppedBlock)
      this.droppedBlock = null;
    }
  }

  pickUpBlockPhysicsBJAD(bool) {
    //turns on the overlap pick up. Having this on all the time a player would automatically pick up any block
    //that they touch.
    const func = bool ? Client.playerPicksUpBlockBJAD : Client.playerSmashCrate
    const hasBlock = this.currentPlayer.children.find(item => item.isBlock)
    if (!hasBlock) {
      this.game.physics.arcade.overlap(this.currentPlayer, this.blocksBJAD, func, null, this)
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
    // this.currentPlayer.selectedWeapon = weapon.key
      Client.playerPicksUpWeaponBJAD(this.currentPlayer, weapon)
  }


  collectWeaponBJAD(playerId, weaponId) {
    this.player = this.playerMapBJAD[playerId]
    const oldWeapon = this.player.children.find(item => item.isWeapon)
    if (oldWeapon){
      const ejectedWeapon = this.player.removeChild(oldWeapon)
      ejectedWeapon.x = this.player.x + 50
      ejectedWeapon.y = this.player.y + 50
      this.weaponsBJAD.addChild(ejectedWeapon)
    }
    let collectedWeapon = this.weaponsBJAD.children.find(weapon => weapon.id == weaponId)
    collectedWeapon.x = 0
    collectedWeapon.y = 0
    this.player.addChild(collectedWeapon)
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
    this.newPlayer.direction = 'down'
    this.newPlayer.health = playerHealth
    this.newPlayer.alive = true
    this.newPlayer.moving = false
    this.newPlayer.serverSideTime = serverSideTime
    this.newPlayer.anchor.x = playerAnchorX
    this.newPlayer.anchor.y = playerAnchorY
    this.game.physics.arcade.enable(this.newPlayer)
    this.newPlayer.body.collideWorldBounds = true
    this.newPlayer.animations.add('right', [0, 1, 2, 3, 4, 5], animationFrequency, true)
    this.newPlayer.animations.add('upRight', [0, 1, 2, 3, 4, 5], animationFrequency, true)
    this.newPlayer.animations.add('downRight', [0, 1, 2, 3, 4, 5], animationFrequency, true)
    this.newPlayer.animations.add('down', [6, 7, 8, 9, 10, 11], animationFrequency, true)
    this.newPlayer.animations.add('left', [12, 13, 14, 15, 16, 17], animationFrequency, true)
    this.newPlayer.animations.add('upLeft', [12, 13, 14, 15, 16, 17], animationFrequency, true)
    this.newPlayer.animations.add('downLeft', [12, 13, 14, 15, 16, 17], animationFrequency, true)
    this.newPlayer.animations.add('up', [18, 19, 20, 21, 22, 23], animationFrequency, true)
    this.playerMapBJAD[id] = this.newPlayer
    console.log(this.playerMapBJAD)
    this.isNotLoading = Object.keys(this.playerMapBJAD).length > 1
    console.log(this.isLoading)
  } 

  addNewBase(base) {
    this.newBase = this.game.add.sprite(base.x, base.y, 'base')
    this.game.physics.arcade.enable(this.newBase)
    this.newBase.body.immovable = true
    this.newBase.health = baseHealth
    this.playerBaseBJAD[base.id] = this.newBase
  }

  setCurrentPlayer(id) {
    this.currentPlayer = this.playerMapBJAD[id]
    this.currentPlayer.direction = 'down'
    this.currentPlayer.health = playerHealth
    this.currentPlayer.ammo = playerAmmo
    this.currentPlayer.id = id
    this.currentPlayer.pointer = null
    this.currentPlayer.possibleTarget = null
    this.currentPlayer.smashToggle = false
    this.currentPlayer.lockOnToggle = false
    this.currentPlayer.targetLocked = false
    this.game.camera.follow(this.currentPlayer)
    this.currentPlayer.enableBody = true
    this.game.physics.arcade.enable(this.currentPlayer)
    this.previousPosition = Object.assign({}, this.currentPlayer.position)
    this.currentPlayer.firing = false
    this.currentPlayer.holdToggle = false
    this.currentPlayer.selectedWeapon = null
  }

  deathLayerChangeHealth(healthNum, id) {
    this.changeHealth(healthNum, id)
  }

  changeHealth(healthNum, id) {
    if (this.currentPlayer.id === id) {
      this.currentPlayer.health += healthNum
      if (this.currentPlayer.health > 100) this.currentPlayer.health = 100;
      if (this.currentPlayer.health < 0) this.currentPlayer.health = 0;
      if (healthNum < 0) {
        this.game.camera.flash([0xde5242], [250])
        this.game.camera.shake([.01], [100])
      } else {
        this.game.camera.flash([0xb3fc95])
      }
      // update health in server
      Client.playerChangeHealth(this.currentPlayer.health)
    }
  }

  changeAmmo(ammoNum){
    this.currentPlayer.ammo += ammoNum
    if (this.currentPlayer.ammo > 30) this.currentPlayer.ammo = 30;
    if (this.currentPlayer.ammo < 0) this.currentPlayer.ammo = 0;
  }

  removePlayer(id) {
    this.playerMapBJAD[id].destroy()
    delete this.playerMapBJAD[id]
  }

  killPlayer(id) {
    this.player = this.playerMapBJAD[id]
    const x = this.player.position.x
    const y = this.player.position.y
    this.deadPlayer = this.game.add.sprite(x, y, 'deathPoof')
    this.deadPlayer.animations.add('die', [0, 1, 2, 3, 4, 5], 10, false, true)
    if (this.player.children.length) {
      this.dropBlockBJAD(id)
    }
    this.player.kill();
    this.deadPlayer.animations.play('die')
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
  }

  smashBlock(blockID){
    const smashedBlock = this.blocksBJAD.children.find(block => block.id === blockID)
    smashedBlock.kill()
  }

  addBlockBJAD(id, x, y) {
    const duplicate = this.blocksBJAD.children.find(block => block.id === id)
    if (!duplicate) {
      this.blockBJAD = this.blocksBJAD.create(x, y, 'block')
      this.blockBJAD.isBlock = true
      this.blockBJAD.id = id;
      this.blockBJAD.body.collideWorldBounds = true
    }
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
    if (this.currentPlayer.possibleTarget.alive) {
      if (this.currentPlayer.pointer) {
        this.currentPlayer.pointer.destroy();
      }
      let solidPointer = this.game.add.sprite(this.currentPlayer.possibleTarget.position.x, this.currentPlayer.possibleTarget.position.y - pointerOffset, 'solidPointer');
      solidPointer.scale.setTo(pointerScale);
      solidPointer.anchor.x = pointerAnchorX;
      solidPointer.anchor.y = pointerAnchorY;
      this.currentPlayer.pointer = solidPointer;
    } else {
      this.currentPlayer.lockOnToggle = false;
      this.currentPlayer.targetLocked = false;
    }
  }

  findPossibleTarget() {
    let allPlayersObj = this.playerMapBJAD
    let closest = [];
    let current = [];

    Object.keys(allPlayersObj).forEach(id => {
      if (Number(id) !== this.currentPlayer.id && allPlayersObj[id].alive) {
        let dx = allPlayersObj[id].position.x - this.currentPlayer.position.x;
        let dy = allPlayersObj[id].position.y - this.currentPlayer.position.y;
        let calcDist = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
        current = [calcDist, id];
        if (calcDist < targetRange) {
          if (!closest.length){
            closest = [...current];
          } else if (closest[0] > current[0]) {
            closest = [...current];
          }
        }
      }
    })
    if (closest.length){
      let targetID = closest[1];
      this.currentPlayer.possibleTarget = allPlayersObj[targetID];
      if (this.currentPlayer.pointer) {
          this.currentPlayer.pointer.destroy();
      }
        let hollowPointer = this.game.add.sprite(allPlayersObj[targetID].position.x, allPlayersObj[targetID].position.y - pointerOffset, 'hollowPointer')
        hollowPointer.scale.setTo(pointerScale);
        hollowPointer.anchor.x = pointerAnchorX;
        hollowPointer.anchor.y = pointerAnchorY;
        this.currentPlayer.pointer = hollowPointer;
    } else {
      if (this.currentPlayer.pointer) {
        this.currentPlayer.pointer.destroy();
      }
      this.currentPlayer.possibleTarget = null;
      this.currentPlayer.pointer = null;
    }
  }

  render(){
    if (this.isNotLoading && Object.keys(this.playerMapBJAD).filter(id => this.playerMapBJAD[id].alive === true).length < 2){
      store.dispatch(resetLobbyAction())
      store.dispatch(gameOverAction())
      ClientGameOver.resetServer()
      this.game.destroy()
    }
  }
}

MainGame.prototype.update = updateMaker(Client)
