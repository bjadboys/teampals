export default Client => function () {

  let playerSpeed = 200;
  //Adjust Speed when locked on
  if ((this.currentPlayer && this.currentPlayer.targetLocked) || (this.currentPlayer && this.currentPlayer.children.find(item => item.isBlock)) ) playerSpeed = 0.70 * playerSpeed

  //physics added for blocks
  if (this.blocksBJAD.children.length) {
    this.blockBJAD.body.velocity.x = 0;
    this.blockBJAD.body.velocity.y = 0;
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
      this.deathLayerChangeHealth(-5, this.currentPlayer.id)
    }

    this.movementThrottle();

    // Target Lock-On Feature //

    //If target locked, run lockOnTarget to set solid pointer for target lock visual feedback
    if (this.currentPlayer.targetLocked) {
      this.lockOnTarget();
    }
    //If NO target locked, continue to run findPossibleTarget
    else {
      this.findPossibleTarget();
    }

    if (this.lockOnButton.isDown && this.currentPlayer.possibleTarget && !this.currentPlayer.lockOnToggle) {
      this.currentPlayer.lockOnToggle = true
      this.currentPlayer.targetLocked = !this.currentPlayer.targetLocked
    }
    if (!this.lockOnButton.isDown && this.currentPlayer.lockOnToggle) {
      this.currentPlayer.lockOnToggle = false
      if (this.currentPlayer.pointer) {
        this.currentPlayer.pointer.destroy();
        this.currentPlayer.pointer = null;
      }
    }

    let moving = false;

    if (this.cursors.up.isDown && !this.cursors.left.isDown && !this.cursors.right.isDown) {
      moving = true;
      this.currentPlayer.body.velocity.y = -1.0 * playerSpeed;
      this.currentPlayer.direction = 'up';
      this.currentPlayer.animations.play('up');

      if (this.currentPlayer.children.length) {
        this.currentPlayer.children.forEach(child => { child.angle = -90 })
      }
    }
    if (this.cursors.up.isDown && this.cursors.left.isDown && !this.cursors.right.isDown) {
      moving = true;
      this.currentPlayer.body.velocity.y = -0.707 * playerSpeed;
      this.currentPlayer.body.velocity.x = -0.707 * playerSpeed;
      this.currentPlayer.direction = 'upLeft';
      this.currentPlayer.animations.play('upLeft');
      if (this.currentPlayer.children.length) {
        this.currentPlayer.children.forEach(child => { child.angle = -135 })
      }
    }
    if (this.cursors.up.isDown && !this.cursors.left.isDown && this.cursors.right.isDown) {
      moving = true;
      this.currentPlayer.body.velocity.y = -0.707 * playerSpeed;
      this.currentPlayer.body.velocity.x = 0.707 * playerSpeed;
      this.currentPlayer.direction = 'upRight';
      this.currentPlayer.animations.play('upRight');
      if (this.currentPlayer.children.length) {
        this.currentPlayer.children.forEach(child => { child.angle = -45 })
      }
    }
    if (this.cursors.down.isDown && !this.cursors.left.isDown && !this.cursors.right.isDown) {
      moving = true;
      this.currentPlayer.body.velocity.y = 1.0 * playerSpeed;
      this.currentPlayer.direction = 'down';
      this.currentPlayer.animations.play('down');
      if (this.currentPlayer.children.length) {
        this.currentPlayer.children.forEach(child => { child.angle = 90 })
      }
    }
    if (this.cursors.down.isDown && this.cursors.left.isDown && !this.cursors.right.isDown) {
      moving = true;
      this.currentPlayer.body.velocity.y = 0.707 * playerSpeed;
      this.currentPlayer.body.velocity.x = -0.707 * playerSpeed;
      this.currentPlayer.direction = 'downLeft';
      this.currentPlayer.animations.play('downLeft');
      if (this.currentPlayer.children.length) {
        this.currentPlayer.children.forEach(child => { child.angle = 135 })
      }
    }
    if (this.cursors.down.isDown && !this.cursors.left.isDown && this.cursors.right.isDown) {
      moving = true;
      this.currentPlayer.body.velocity.y = 0.707 * playerSpeed;
      this.currentPlayer.body.velocity.x = 0.707 * playerSpeed;
      this.currentPlayer.direction = 'downRight';
      this.currentPlayer.animations.play('downRight');
      if (this.currentPlayer.children.length) {
        this.currentPlayer.children.forEach(child => { child.angle = 45 })
      }
    }
    if (this.cursors.right.isDown && !this.cursors.up.isDown && !this.cursors.down.isDown) {
      moving = true;
      this.currentPlayer.body.velocity.x = 1.0 * playerSpeed;
      this.currentPlayer.direction = 'right';
      this.currentPlayer.animations.play('right');
      if (this.currentPlayer.children.length) {
        this.currentPlayer.children.forEach(child => { child.angle = 0 })
      }
    }
    if (this.cursors.left.isDown && !this.cursors.up.isDown && !this.cursors.down.isDown) {
      moving = true;
      this.currentPlayer.body.velocity.x = -1.0 * playerSpeed;
      this.currentPlayer.direction = 'left';
      this.currentPlayer.animations.play('left');
      if (this.currentPlayer.children.length) {
        this.currentPlayer.children.forEach(child => { child.angle = 180 })
      }
    }
    if (!moving) {
      this.currentPlayer.animations.stop()
    }
    if (this.fireButton.isDown && this.currentPlayer.ammo > 0 && !this.currentPlayer.firing
      && !this.currentPlayer.children.find(item => item.isBlock)) {
      this.currentPlayer.firing = true
      this.changeAmmo(-1)
      Client.SEND_fire(this.currentPlayer.position, this.currentPlayer.direction, this.currentPlayer.selectedWeapon, this.currentPlayer.targetLocked, this.currentPlayer.possibleTarget);

      // Cannot shoot if you're holding something
    }
    if (!this.fireButton.isDown) {
      this.currentPlayer.firing = false;
    }
    if (this.pickUpButton.isDown && !this.currentPlayer.holdToggle) {
      this.currentPlayer.holdToggle = true
      const hasBlock = this.currentPlayer.children.find(item => item.isBlock)
      if (hasBlock) {
        this.dropBlockPhysicsBJAD();
      } else {
        this.pickUpBlockPhysicsBJAD(true);
      }
    }
    if (!this.pickUpButton.isDown) {
      this.currentPlayer.holdToggle = false;
    }
    if (!this.currentPlayer.smashToggle && this.smashButton.isDown) {
      this.currentPlayer.smashToggle = true;
      this.pickUpBlockPhysicsBJAD(false);
    }
    if (!this.smashButton.isDown) {
      this.currentPlayer.smashToggle = false;
    }
  }
}
