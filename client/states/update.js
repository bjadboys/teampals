export default Client => function () {

  //physics added for blocks
  if (this.blocksBJAD.children.length) {
    this.blockBJAD.body.velocity.x = 0
    this.blockBJAD.body.velocity.y = 0
  }
  //this collision only matters if we're push blocks. We may want to delete.

  if (this.currentPlayer && this.currentPlayer.alive) {
    this.game.physics.arcade.collide(this.currentPlayer, this.layerCollision)
    this.game.physics.arcade.overlap(this.currentPlayer, this.weaponsBJAD, this.pickUpWeaponPhysicsBJAD, null, this)
    this.hudThrottle()
    //collision added for blocks below. With this on player pushes the block around. Comment in for pushing physics
    // this.game.physics.arcade.collide(this.currentPlayer, this.blocksBJAD)
    //when the above is on it makes it impossible to push  a block out of a corner.
    this.currentPlayer.body.velocity.x = 0;
    this.currentPlayer.body.velocity.y = 0;

    if (this.isInDeathBJAD(this.currentPlayer.position.x, this.currentPlayer.position.y) !== -1) {
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
      this.currentPlayer.body.velocity.y = -106;
      this.currentPlayer.body.velocity.x = -106;
      this.currentPlayer.direction = 'upLeft';
      this.currentPlayer.animations.play('upLeft')
    }
    if (this.cursors.up.isDown && !this.cursors.left.isDown && this.cursors.right.isDown) {
      moving = true
      this.currentPlayer.body.velocity.y = -106;
      this.currentPlayer.body.velocity.x = 106;
      this.currentPlayer.direction = 'upRight';
      this.currentPlayer.animations.play('upRight')
    }
    if (this.cursors.down.isDown && !this.cursors.left.isDown && !this.cursors.right.isDown) {
      moving = true
      this.currentPlayer.body.velocity.y = 150;
      this.currentPlayer.direction = 'down';
      this.currentPlayer.animations.play('down')
    }
    if (this.cursors.down.isDown && this.cursors.left.isDown && !this.cursors.right.isDown) {
      moving = true
      this.currentPlayer.body.velocity.y = 106;
      this.currentPlayer.body.velocity.x = -106;
      this.currentPlayer.direction = 'downLeft';
      this.currentPlayer.animations.play('downLeft')
    }
    if (this.cursors.down.isDown && !this.cursors.left.isDown && this.cursors.right.isDown) {
      moving = true
      this.currentPlayer.body.velocity.y = 106;
      this.currentPlayer.body.velocity.x = 106;
      this.currentPlayer.direction = 'downRight';
      this.currentPlayer.animations.play('downRight')
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
      this.currentPlayer.animations.play('left')
    }
    if (!moving) {
      this.currentPlayer.animations.stop()
    }
    if (this.fireButton.isDown && !this.currentPlayer.firing && this.currentPlayer.children.length === 0) {
      this.currentPlayer.firing = true
      Client.SEND_fire(this.currentPlayer.position, this.currentPlayer.direction, this.currentPlayer.selectedWeapon);
      console.log(this.currentPlayer.selectedWeapon)
      // Cannot shoot if you're holding something
    }
    if (this.pickUpButton.isDown && !this.currentPlayer.holdToggle) {
      this.currentPlayer.holdToggle = true
      if (this.currentPlayer.children.length) {
        this.dropBlockPhysicsBJAD()
      } else {
        this.pickUpBlockPhysicsBJAD()
      }
    }
    if (!this.pickUpButton.isDown) {
      this.currentPlayer.holdToggle = false
    }
    if (!this.fireButton.isDown) {
      this.currentPlayer.firing = false
    }
  }

}
