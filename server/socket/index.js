

const bulletCollisionLayer = require('./collisionLayerData')
module.exports = (io, server) => {
  //Map Variables
  const tilePx = 32
  const mapHeight = 48
  const mapWidth = 48

  //Gameplay Variables
  const bulletSpeed = 3.0
  const playerHealth = 100000
  // Keep track of the last id assigned to a new player
  server.lastBlockIdBJAD = 0; //Keep track of last id assigned to block
  let bulletArray = [];
  let players = []
  server.gameInProgress = false
  server.joined = false
  let defaultPlayers = [
    {
      id: 1,
      x: 135,
      y: 120
    }, {
      id: 2,
      x: 1340,
      y: 120
    }, {
      id: 3,
      x: 1340,
      y: 1340
    }, {
      id: 4,
      x: 120,
      y: 1340
    }
  ]
  const directionValues = {
    up: { x: 0, y: -1.0 },
    down: { x: 0, y: 1.0 },
    left: { x: -1.0, y: 0 },
    right: { x: 1.0, y: 0 },
    upLeft: { x: -0.707, y: -.707 },
    downLeft: { x: -.707, y: 0.707 },
    upRight: { x: 0.707, y: -0.707 },
    downRight: { x: 0.707, y: 0.707 },
  }
  let mapBlocks = makeBlocks(10)
  io.on('connection', function (socket) {

    if (server.gameInProgress) {
      socket.emit('gameInProgress')
    }

    socket.on('newplayer', function (name) {
      if (defaultPlayers.length) {
        io.emit()
        socket.player = defaultPlayers.shift()
        socket.player.name = name
        socket.player.direction = 'down'
        socket.player.health = playerHealth
        socket.player.playerSideTime = null
        socket.player.serverSideTime = Date.now()
        io.emit('addPlayersToLobby', getAllPlayers())
      }
    });
    socket.on('startGame', function () {
      if (socket.player) {
        io.emit('newGame')
        io.emit('gameHasStarted')
        server.gameInProgress = true
      }
    })

    socket.on('setUpGame', function () {
      if (socket.player) {
        io.emit('allBlocks', mapBlocks)
        socket.emit('allplayers', getAllPlayers());
        socket.emit('yourID', socket.player.id)
      }
    })

    socket.on('update-position', function (data) {
      if (socket.player && socket.player.playerSideTime <= data.playerSideTime) {
        socket.player.playerSideTime = data.playerSideTime;
        socket.player.serverSideTime = Date.now();
        socket.player.x = data.x;
        socket.player.y = data.y;
        socket.player.direction = data.direction
      }
      if (socket.player) socket.broadcast.emit('move', socket.player)
    });

    socket.on('block-picked-up', function (data) {
      if (socket.player) io.emit('player-picked-up-block', data)
    })

    socket.on('blockUsed', function (data) {
      if (socket.player) {
        const newBlock = makeBlocks(1)
        updateMapBlocks(data.blockId, newBlock[0])
        io.emit('allBlocks', newBlock)
        io.emit('replaceBlock', data)
      }
    })

    socket.on('block-dropped', function (playerId) {
      if (socket.player) io.emit('player-dropped-block', playerId)
    })

    socket.on('stopped-moving', function () {
      if (socket.player) socket.broadcast.emit('stop-animation', socket.player.id)
    })

    socket.on('weaponPickedUp', function (data) {
      if (socket.player) io.emit('playerPickedUpWeapon', data)
    })

    socket.on('fire', function (data) {
      if (socket.player) {
        console.log("added bullet")
        let newBullet = {};
        let axisVelocities = directionValues[data.direction];
        //const bulletSpeed = 3.0;
        newBullet.x = data.x;
        newBullet.y = data.y;
        newBullet.xv = data.xv ? data.xv * bulletSpeed : axisVelocities.x * bulletSpeed;
        newBullet.yv = data.xy ? data.xy * bulletSpeed : axisVelocities.y * bulletSpeed;
        newBullet.id = socket.player.id;
        bulletArray.push(newBullet);
      }
    });

    socket.on('disconnect', function () {
      if (socket.player) {

        io.emit('remove', socket.player.id);
      }
    });

    socket.on('playerLeavesLobby', function () {
      defaultPlayers.push(socket.player)
      io.emit('removePlayerFromLobby', socket.player.id)
      removePlayer(socket.player.id)
      socket.player = null;
    })

  });


  function ServerGameLoop() {
    for (let i = 0; i < bulletArray.length; i++) {
      // Update position of bullets
      bulletArray[i].x += bulletArray[i].xv;
      bulletArray[i].y += bulletArray[i].yv;
      let xPixels = bulletArray[i].x
      let yPixels = bulletArray[i].y
      let xTile = Math.floor(xPixels / tilePx)
      let yTile = Math.floor(yPixels / tilePx) * mapHeight
      let collisionTile = bulletCollisionLayer[xTile + yTile]
      // Remove bullet if it's off screen
      if (bulletArray[i].y < 0 || bulletArray[i].x < 0 || bulletArray[i].y > mapHeight * tilePx || bulletArray[i].x > mapWidth * tilePx || collisionTile) {
        bulletArray.splice(i, 1);
        i--;
      }
      let playerArr = players;
      for (let j = 0; j < playerArr.length; j++) {
        if (playerArr[j].health > 0 && bulletArray[i] && bulletArray[i].id !== playerArr[j].id) {
          if (playerArr[j].x - 12 < bulletArray[i].x && playerArr[j].x + 12 > bulletArray[i].x) {
            if (playerArr[j].y - 7 < bulletArray[i].y && playerArr[j].y + 16 > bulletArray[i].y) {
              playerArr[j].health += -10
              if (playerArr[j].health <= 0) {
                io.emit('player-killed', playerArr[j].id)
              }
              io.emit('player-hit', { id: playerArr[j].id, healthNum: -10 });
              bulletArray.splice(i, 1);
              i--;
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
    for (let i = 0; i < num; i++) {
      const initializedBlock = {
        id: server.lastBlockIdBJAD++,
        x: randomInt(500, 800),
        y: randomInt(500, 800)
      }
      madeBlocks.push(initializedBlock)
    }
    return madeBlocks
  }

  function removePlayer(id) {
    return players.filter(player => player.id === id)
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
