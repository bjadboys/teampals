import Game from '../game/'
import socket from './socket'
import store, {gameInProgressAction} from '../store/'
// import {movePlayer, setCurrentPlayer, removePlayer, addNewPlayer, hitEnemy} from '../states/MainGame'
let bulletArray = [];
const Client = {};
let offsetX = 0;
let offsetY = 0;
let sendStopCalls = false;
Client.socket = socket

let game;

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
  //Calculate directional velocity for targeted player
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

Client.blockUsedBJAD = function(data) {
  const state = store.getState()
  if (state.game.joined) {
    Client.socket.emit('blockUsed', data)
  }
}

Client.playerPicksUpBlockBJAD = function(player, block) {

  const state = store.getState()
  if (state.game.joined) {
    const playerId = player.id
    const blockId = block.id
    Client.socket.emit('block-picked-up', {playerId, blockId})
  }
}

Client.playerSmashCrate = function(player, block){
    const state = store.getState()
    if (state.game.joined) {
        Client.socket.emit('destroy-crate', block.id)
        game.state.states.MainGame.changeAmmo(10)
        game.state.states.MainGame.changeHealth(10, player.id)
    }
}

Client.playerChangeHealth = function(playerHealth){
    const state = store.getState()
    if (state.game.joined) {
      Client.socket.emit('change-health', playerHealth)
    }
}

Client.playerChangeLevel = function(){
  const state = store.getState()
  if (state.game.joined) {
    Client.socket.emit('upgrade-level')
  }
}

Client.socket.on('level-change', function(level){
  const state = store.getState()
  if (state.game.joined) {
    game.state.states.MainGame.changeLevel(level)
  }
})

Client.playerDropsBlockBJAD = function(playerId) {
  const state = store.getState()
  if (state.game.joined) {
    Client.socket.emit('block-dropped', playerId)
  }
}

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

//Client add on block at a time to the map.
//TODO : duplicate blocks.
Client.socket.on('newGame', function(){
  const state = store.getState()
  if (state.game.joined) {
    game = new Game()
    game.startGame();
    let timeoutId = setTimeout(function(){
        Client.socket.emit('setUpGame')
    }, 2000)
    store.dispatch(gameInProgressAction())
  }
})


Client.socket.on('addBlock', function(data){
  const state = store.getState()
  if (state.game.joined) {
    game.state.states.MainGame.addBlockBJAD(data.id, data.x, data.y)
  }
})

Client.socket.on('player-picked-up-block', function(data){
  const state = store.getState()
  if (state.game.joined) {
    game.state.states.MainGame.collectBlockBJAD(data.playerId, data.blockId)
  }
})

Client.socket.on('allBlocks', function(data){
  const state = store.getState()
  if (state.game.joined) {
    data.forEach(block => {
      game.state.states.MainGame.addBlockBJAD(block.id, block.x, block.y)
    })
  }
})

Client.socket.on('replaceBlock', function(data){
  const state = store.getState()
  if (state.game.joined) {
    game.state.states.MainGame.removeBlockBJAD(data.playerId);
  }
})

//weapon item events

Client.playerPicksUpWeaponBJAD = function (player, weapon){
  const state = store.getState()
  if (state.game.joined) {
    let playerId = player.id
    let weaponId = weapon.id
    Client.socket.emit('weaponPickedUp', {playerId, weaponId})

  }
}

Client.socket.on('playerPickedUpWeapon', function(data){
  const state = store.getState()
  if (state.game.joined) {
    let playerId = data.playerId
    let weaponId = data.weaponId
    game.state.states.MainGame.collectWeaponBJAD(playerId, weaponId)
  }
})

Client.socket.on('stop-animation', function(data) {
  const state = store.getState()
  if (state.game.joined) {
    game.state.states.MainGame.stopAnimation(data);
  }
})

Client.socket.on('yourID', function(data){
  const state = store.getState()
  if (state.game.joined) {
    game.state.states.MainGame.setCurrentPlayer(data);
  }
});

Client.socket.on('newplayer', function(data){
  const state = store.getState()
  if (state.game.joined) {
    game.state.states.MainGame.addNewPlayer(data.id, data.x, data.y, data.serverSideTime);
  }
});

Client.socket.on('allplayers', function(data){
  const state = store.getState()
  if (state.game.joined) {
    const locations = [{id: 1, x: 550, y: 550}, {id: 2, x: 1650, y: 550}, {id: 3, x: 1650, y: 1650}, {id: 4, x: 1650, y: 550}]
    for (var i = 0; i < data.length; i++){
      const base = locations.find(location => location.id === data[i].id)
      game.state.states.MainGame.addNewBase(base)
      game.state.states.MainGame.addNewPlayer(data[i].id, data[i].x, data[i].y, data[i].serverSideTime)
    }
  }
});

Client.socket.on('remove', function(id){
  const state = store.getState()
  if (state.game.joined) {

    game.state.states.MainGame.removePlayer(id);

  }
});

Client.socket.on('player-hit', function(data){
  const state = store.getState()
  if (state.game.joined) {
    game.state.states.MainGame.changeHealth(data.healthNum, data.id);
  }
});

Client.socket.on('player-killed', function(id){
  const state = store.getState()
  if (state.game.joined) {
    game.state.states.MainGame.killPlayer(id);
  }
});

Client.socket.on('bullets-update', function (RCVbulletArray) {
//   console.log("bullet listener")
  const state = store.getState()
  if (state.game.joined) {
    // console.log("the actual loop")
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

Client.socket.on('move', function(data){
  const state = store.getState()
  if (state.game.joined) {

    game.state.states.MainGame.movePlayer(data.id, data.x, data.y, data.serverSideTime, data.direction);

  }
});

export default Client
