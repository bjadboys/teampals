import Game from '../game/'
import socket from './socket'
import store, {gameInProgressAction} from '../store/'

const Client = {};
let bulletArray = [];
let offsetX = 0;
let offsetY = 0;
let sendStopCalls = false;
let game;

Client.socket = socket

Client.SEND_fire = function (position, direction, selectedWeapon, targetLocked, target) {
  const state = store.getState()
  if (state.game.joined) {
    let xv, yv = null;
    if (targetLocked) {
      const dx = target.position.x - position.x;
      const dy = target.position.y - position.y;
      const distBtwn = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
      xv = dx / distBtwn;
      yv = dy / distBtwn;
    }
    Client.socket.emit('fire', { x: position.x + offsetX, y: position.y + offsetY, direction, selectedWeapon, xv, yv })
  }
};

Client.updatePosition = function (previous, current, direction) {
  const state = store.getState()
  if (state.game.joined) {
    if (previous.x !== current.x || previous.y !== current.y) {
      Client.socket.emit('update-position', { x: current.x, y: current.y, playerSideTime: Date.now(), direction })
      sendStopCalls = false;
    }
    else if (!sendStopCalls) {
      Client.socket.emit('stopped-moving')
      sendStopCalls = true;
    }
  }
};

Client.blockUsedBJAD = function (data) {
  const state = store.getState()
  if (state.game.joined) {
    Client.socket.emit('blockUsed', data)
  }
}

Client.playerPicksUpBlockBJAD = function (player, block) {
  const state = store.getState()
  if (state.game.joined) {
    const playerId = player.id
    const blockId = block.id
    Client.socket.emit('block-picked-up', {playerId, blockId})
  }
}

Client.playerSmashCrate = function (player, block) {
  const state = store.getState()
  if (state.game.joined) {
    if (player.blockLimit > 0) {
      if (block.id >= 0){
        Client.socket.emit('destroy-crate', block.id)
        game.state.states.MainGame.changeAmmo(10)
        game.state.states.MainGame.changeHealth(10, player.id)
      } else if (block.id < 0){
        Client.socket.emit('destroy-crate', block.id)
        game.state.states.MainGame.upgradeAmmo(20)
        game.state.states.MainGame.upgradeHealth(50)
      }
      player.blockLimit--;
    }
  }
}

Client.playerChangeHealth = function (playerHealth) {
  const state = store.getState()
  if (state.game.joined) {
    Client.socket.emit('change-health', playerHealth)
  }
}
Client.playerHealthUpgrade = function(newMaxHealth){
  const state = store.getState()
  if (state.game.joined) {
    Client.socket.emit('upgrade-health', newMaxHealth)
  }
}

Client.playerChangeLevel = function (id, level) {
  const upgradeObj = {id, level}
  const state = store.getState()
  if (state.game.joined) {
    if (id < 0) {
      Client.socket.emit('corpseLevel', upgradeObj)
    } else {
      Client.socket.emit('upgrade-level')
    }
  }
}

Client.playerDropsBlockBJAD = function (playerId) {
  const state = store.getState()
  if (state.game.joined) {
    Client.socket.emit('block-dropped', playerId)
  }
}

Client.playerPicksUpWeaponBJAD = function (player, weapon) {
  const state = store.getState()
  if (state.game.joined) {
    let playerId = player.id
    let weaponId = weapon.id
    Client.socket.emit('weaponPickedUp', {playerId, weaponId})
  }
}

////////////////////////////////////////////////////////////////////////////////

Client.socket.on('life-lost', function (playerData) {
  const state = store.getState()
  if (state.game.joined) {
    game.state.states.MainGame.movePlayer(playerData.id, playerData.x, playerData.y, playerData.serverSideTime, playerData.direction)
    game.state.states.MainGame.stopAnimation(playerData.id)
    if (playerData.id === state.player.sprite){
      game.state.states.MainGame.changeLives()
      game.state.states.MainGame.changeHealth(playerData.maxHealth, playerData.id)
      game.state.states.MainGame.changeAmmo(0)
      game.state.states.MainGame.changeLevel(playerData.level)
      Client.socket.emit('notInvincible')
    }
  }
})

Client.socket.on('level-change', function (level) {
  const state = store.getState()
  if (state.game.joined) {
    game.state.states.MainGame.changeLevel(level)
  }
})

Client.socket.on('player-dropped-block', function (playerId) {
  const state = store.getState()
  if (state.game.joined) {
    game.state.states.MainGame.dropBlockBJAD(playerId)
  }
})

Client.socket.on('crate-destroyed', function (crateID) {
  const state = store.getState()
  if (state.game.joined) {
    game.state.states.MainGame.smashBlock(crateID)
  }
})

Client.socket.on('newGame', function () {
  const state = store.getState()
  if (state.game.joined) {
    game = new Game()
    game.startGame();
    store.dispatch(gameInProgressAction())
  }
})

Client.socket.on('addBlock', function (data) {
  const state = store.getState()
  if (state.game.joined) {
    game.state.states.MainGame.addBlockBJAD(data.id, data.x, data.y)
  }
})

Client.socket.on('player-picked-up-block', function (data) {
  const state = store.getState()
  if (state.game.joined) {
    game.state.states.MainGame.collectBlockBJAD(data.playerId, data.blockId)
  }
})

Client.socket.on('allBlocks', function (data) {
  const state = store.getState()
  if (state.game.joined) {
    data.forEach(block => {
      game.state.states.MainGame.addBlockBJAD(block.id, block.x, block.y, block.level)
    })
  }
})

Client.socket.on('replaceBlock', function (data) {
  const state = store.getState()
  if (state.game.joined) {
    game.state.states.MainGame.removeBlockBJAD(data.playerId);
  }
})

Client.socket.on('playerPickedUpWeapon', function (data) {
  const state = store.getState()
  if (state.game.joined) {
    let playerId = data.playerId
    let weaponId = data.weaponId
    game.state.states.MainGame.collectWeaponBJAD(playerId, weaponId)
  }
})

Client.socket.on('stop-animation', function (data) {
  const state = store.getState()
  if (state.game.joined) {
    game.state.states.MainGame.stopAnimation(data);
  }
})

Client.socket.on('yourID', function (data) {
  const state = store.getState()
  if (state.game.joined) {
    game.state.states.MainGame.setCurrentPlayer(data);
  }
});

Client.socket.on('newplayer', function (data) {
  const state = store.getState()
  if (state.game.joined) {
    game.state.states.MainGame.addNewPlayer(data.id, data.x, data.y, data.serverSideTime);
  }
});

Client.socket.on('allplayers', function (data) {
  const state = store.getState()
  if (state.game.joined) {
    const locations = [{id: 1, x: 550, y: 550}, {id: 2, x: 1650, y: 550}, {id: 3, x: 1650, y: 1650}, {id: 4, x: 550, y: 1650}]
    for (var i = 0; i < data.length; i++){
      const base = locations.find(location => location.id === data[i].id)
      game.state.states.MainGame.addNewBase(base, state.player.sprite)
      game.state.states.MainGame.addNewPlayer(data[i].id, data[i].x, data[i].y, data[i].serverSideTime)
    }
  }
});

Client.socket.on('remove', function (id) {
  const state = store.getState()
  if (state.game.joined) {
    game.state.states.MainGame.removePlayer(id);
  }
});

Client.socket.on('player-hit', function (data) {
  const state = store.getState()
  if (state.game.joined) {
    game.state.states.MainGame.changeBulletHealth(data.id);
  }
});

Client.socket.on('player-killed', function (id) {
  const state = store.getState()
  if (state.game.joined) {
    game.state.states.MainGame.killPlayer(id);
  }
});

Client.socket.on('bullets-update', function (RCVbulletArray) {
  const state = store.getState()
  if (state.game.joined) {
    for (var i = 0; i < RCVbulletArray.length; i++) {
      if (bulletArray[i] === undefined) {
        let bullet = game.add.sprite(RCVbulletArray[i].x, RCVbulletArray[i].y, 'bullet');
        bullet.scale.setTo(0.5);
        bullet.anchor.setTo(0.5, 0.5);
        bulletArray[i] = bullet;
      } else {
        //Otherwise, just update it!
        bulletArray[i].x = RCVbulletArray[i].x;
        bulletArray[i].y = RCVbulletArray[i].y;
      }
    }
    // Otherwise if there's too many, delete the extra
    for (var i = RCVbulletArray.length; i < bulletArray.length; i++) {
      bulletArray[i].destroy();
      bulletArray.splice(i, 1);
      i--;
    }
  }
  // If there's not enough bullets on the client, create them
});

Client.socket.on('move', function (data) {
  const state = store.getState()
  if (state.game.joined) {
    game.state.states.MainGame.movePlayer(data.id, data.x, data.y, data.serverSideTime, data.direction);
  }
});

export default Client
