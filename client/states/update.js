export default Client => function(){
    //physics added for blocks
    if (this.blocksBJAD.children.length) {
      this.blockBJAD.body.velocity.x = 0
      this.blockBJAD.body.velocity.y = 0
    }
    //this collision only matters if we're push blocks. We may want to delete.

    if (this.currentPlayer) {
      this.game.physics.arcade.collide(this.currentPlayer, this.layerCollision)
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
      if (!this.fireButton.isDown) {
        this.currentPlayer.firing = false
      }
    }
  
}