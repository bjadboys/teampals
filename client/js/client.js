
import Game from '../game/'
import socket from './socket'
// import {movePlayer, setCurrentPlayer, removePlayer, addNewPlayer, hitEnemy} from '../states/MainGame'
let bulletArray = [];
const Client = {};
let offsetX = 0;
let offsetY = 0;
let sendStopCalls = false;
Client.socket = socket

// Client.askNewPlayer = function(){
//   Client.socket.emit('newplayer');
// };
let game;

Client.SEND_fire = function (position, direction, selectedWeapon, targetLocked, target) {

  //Calculate directional velocity for targeted player
  let xv, xy = null;
  if (targetLocked) {
    const dx = target.position.x - position.x;
    const dy = target.position.y - position.y;
    const distBtwn = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
    xv = dx / distBtwn;
    xy = dy / distBtwn;
  }

  Client.socket.emit('fire', { x: position.x + offsetX, y: position.y + offsetY, direction, selectedWeapon, xv, xy })
};

Client.updatePosition = function (previous, current, direction) {
  if (previous.x !== current.x || previous.y !== current.y) {
    Client.socket.emit('update-position', { x: current.x, y: current.y, playerSideTime: Date.now(), direction })
    sendStopCalls = false;
  }
  else if (!sendStopCalls) {
    Client.socket.emit('stopped-moving')
    sendStopCalls = true;
  }
};

Client.blockUsedBJAD = function(data) {
  Client.socket.emit('blockUsed', data)
}

Client.playerPicksUpBlockBJAD = function(player, block) {
  const playerId = player.id
  const blockId = block.id
  Client.socket.emit('block-picked-up', {playerId, blockId})
}

Client.playerDropsBlockBJAD = function(playerId) {
  Client.socket.emit('block-dropped', playerId)
}

Client.socket.on('player-dropped-block', function (playerId) {
  game.state.states.MainGame.dropBlockBJAD(playerId)
})

//Client add on block at a time to the map.
//TODO : duplicate blocks.
Client.socket.on('newGame', function(){
    game = new Game()
    game.startGame();
    console.log(game)
    let timeoutId = setTimeout(function(){
        Client.socket.emit('setUpGame')
    }, 1000)

})


Client.socket.on('addBlock', function(data){
  game.state.states.MainGame.addBlockBJAD(data.id, data.x, data.y)
})

Client.socket.on('player-picked-up-block', function(data){
  game.state.states.MainGame.collectBlockBJAD(data.playerId, data.blockId)
})

Client.socket.on('allBlocks', function(data){
  data.forEach(block => {
    game.state.states.MainGame.addBlockBJAD(block.id, block.x, block.y)
  })
})

Client.socket.on('replaceBlock', function(data){
  game.state.states.MainGame.removeBlockBJAD(data.playerId);
})

//weapon item events

Client.playerPicksUpWeaponBJAD = function (player, weapon){
  let playerId = player.id
  let weaponId = weapon.id
  Client.socket.emit('weaponPickedUp', {playerId, weaponId})
}

Client.socket.on('playerPickedUpWeapon', function(data){
    let playerId = data.playerId
    let weaponId = data.weaponId
    console.log('in server', weaponId)
    game.state.states.MainGame.collectWeaponBJAD(playerId, weaponId)
})

Client.socket.on('stop-animation', function(data) {
  game.state.states.MainGame.stopAnimation(data);
})

Client.socket.on('yourID', function(data){
  game.state.states.MainGame.setCurrentPlayer(data);
});

Client.socket.on('newplayer', function(data){
  game.state.states.MainGame.addNewPlayer(data.id, data.x, data.y, data.serverSideTime);
});

Client.socket.on('allplayers', function(data){
  const locations = [{id: 1, x: 135, y: 120}, {id: 2, x: 1340, y: 120}, {id: 3, x: 1340, y: 1340}, {id: 4, x: 120, y: 1340}]
  for (var i = 0; i < data.length; i++){
    const base = locations.find(location => location.id === data[i].id)
    game.state.states.MainGame.addNewBase(base)
    game.state.states.MainGame.addNewPlayer(data[i].id, data[i].x, data[i].y, data[i].serverSideTime)
  }
});

Client.socket.on('remove', function(id){
  game.state.states.MainGame.removePlayer(id);
});

Client.socket.on('player-hit', function(id){
  game.state.states.MainGame.killPlayer(id);
});

Client.socket.on('bullets-update', function (RCVbulletArray) {
  // If there's not enough bullets on the client, create them
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
});

Client.socket.on('move', function(data){
  game.state.states.MainGame.movePlayer(data.id, data.x, data.y, data.serverSideTime, data.direction);
});

export default Client
