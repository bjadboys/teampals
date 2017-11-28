const bulletCollisionLayer = require('./collisionLayerData')
module.exports = (io, server) => {
  server.lastPlayderID = 0; // Keep track of the last id assigned to a new player
  server.lastBlockIdBJAD = 0; //Keep track of last id assigned to block
  let bulletArray = [];
  let players = []
  let defaultPlayers = [
    {
      id: 1,
      x: 20,
      y: 20
    }, {
      id: 2,
      x: 1516,
      y: 20
    }, {
      id: 3,
      x: 1516,
      y: 1516
    }, {
      id: 4,
      x: 20,
      y: 1516
      }
  ]
  const directionValues = {
    up: {x: 0, y: -1.0},
    down: {x: 0, y: 1.0},
    left: {x: -1.0, y: 0},
    right: {x: 1.0, y: 0},
    upLeft: {x: -0.707, y: -.707},
    downLeft: {x: -.707, y: 0.707},
    upRight: {x: 0.707, y: -0.707},
    downRight: {x: 0.707, y: 0.707},
  }
  let mapBlocks = makeBlocks(10)
  io.on('connection', function (socket) {

    //brian's lobby code
    // socket.on('joinLobby', function() {
    //     server.lastPlayderID++
    //     socket.player = players.find(player=> player.id === server.lastPlayderID)

    //   }
    //   io.emit('addPlayerLobby')
    // })
    //above is brian's lobby code.
    socket.on('newplayer', function () {
      if (server.lastPlayderID === 4) throw new Error('too many players')
      server.lastPlayderID++
      socket.player = defaultPlayers.find(player => player.id === server.lastPlayderID)
      io.emit()
      socket.player.playerSideTime = null
      socket.player.serverSideTime = Date.now()
      socket.player.direction = 'down'

      socket.emit('allplayers', getAllPlayers());
      socket.emit('yourID', socket.player.id)
      socket.broadcast.emit('newplayer', socket.player);
      socket.emit('allBlocks', mapBlocks)

      socket.on('update-position', function (data) {
        if (socket.player.playerSideTime <= data.playerSideTime){
          socket.player.playerSideTime = data.playerSideTime;
          socket.player.serverSideTime = Date.now();
          socket.player.x = data.x;
          socket.player.y = data.y;
          socket.player.direction = data.direction
        }
        socket.broadcast.emit('move', socket.player);
      });

      socket.on('block-picked-up', function(data){
        io.emit('player-picked-up-block', data)
      })

      socket.on('blockUsed', function(data){
        const newBlock = makeBlocks(1)
        updateMapBlocks(data.blockId, newBlock[0])
        io.emit('allBlocks', newBlock)
        io.emit('replaceBlock', data)
      })

      socket.on('block-dropped', function(playerId){
        io.emit('player-dropped-block', playerId)
      })

      socket.on('stopped-moving', function() {
        socket.broadcast.emit('stop-animation', socket.player.id)
      })

      socket.on('fire', function (data) {
        let newBullet = {};
        let axisVelocities = directionValues[data.direction];
        newBullet.x = data.x;
        newBullet.y = data.y;
        newBullet.xv = axisVelocities.x * 5.0;
        newBullet.yv = axisVelocities.y * 5.0;
        newBullet.id = socket.player.id;
        bulletArray.push(newBullet);
      });

      socket.on('disconnect', function () {
        io.emit('remove', socket.player.id);
      });
    });





  });

  function ServerGameLoop() {
    for (let i = 0; i < bulletArray.length; i++) {
      // Update position of bullets
      bulletArray[i].x += bulletArray[i].xv;
      bulletArray[i].y += bulletArray[i].yv;
      let xPixels = bulletArray[i].x
      let yPixels = bulletArray[i].y
      let xTile = Math.floor(xPixels / 32)
      let yTile = Math.floor(yPixels / 32) * 48
      let tile = bulletCollisionLayer[ xTile + yTile]

      // Remove bullet if it's off screen
      if (bulletArray[i].y < 0 || bulletArray[i].x < 0 || (tile > 0)) {
        bulletArray.splice(i, 1);
        i--;
      }
      let playerArr = players;
      if (bulletArray[i]) {
        for (let j = 0; j < playerArr.length; j++) {
          if (bulletArray[i].id !== playerArr[j].id) {
            if (playerArr[j].x - 12 < bulletArray[i].x && playerArr[j].x + 12 > bulletArray[i].x){
              if (playerArr[j].y - 7 < bulletArray[i].y && playerArr[j].y + 16 > bulletArray[i].y){
                io.emit('player-hit', playerArr[j].id);
              }
            }
          }
        }
      }
    }
    // Send updated bullets
    io.emit('bullets-update', bulletArray)
  }

  setInterval(ServerGameLoop, 16);


  function makeBlocks(num) {
    const madeBlocks = []
    for (let i = 0; i < num; i++){
      const initializedBlock = {
        id: server.lastBlockIdBJAD++,
        x: randomInt(500, 800),
        y: randomInt(500, 800)
      }
      madeBlocks.push(initializedBlock)
    }
    return madeBlocks
  }

  function getAllPlayers() {
    players = [];
    Object.keys(io.sockets.connected).forEach(function (socketID) {
      var player = io.sockets.connected[socketID].player;
      if (player) players.push(player);
    });
    return players;
  }

  function randomInt(low, high) {
    return Math.floor(Math.random() * (high - low) + low);
  }

  function updateMapBlocks(blockId, newBlock) {
    mapBlocks = mapBlocks.map(block => {
      if (block.id === blockId) {
        return newBlock
      } else {
        return block
      }
    })
  }
}
