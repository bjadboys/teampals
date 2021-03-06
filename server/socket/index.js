const R = require('ramda')
const bulletCollisionLayer = require('./collisionLayerData')

module.exports = (io, server) => {
  //Map Variables
  const tilePx = 32
  const mapHeight = 70
  const mapWidth = 70
  let gameTimer = null
  const idleGameTime = 1000000
  //Gameplay Variables
  let bulletSpeed = 3.5
  let bulletSpeedUpgradePercentage = 1.2
  const playerHealth = 100
  const playerLives = 3
  //Keep track of last id assigned to block
  server.lastBlockIdBJAD = 5;
  //Gamestate variables
  let bulletArray = []
  let players = []
  server.gameInProgress = false
  server.joined = false
  const defaultPlayers = [{
    id: 1,
    x: 700,
    y: 700
    }, {
      id: 2,
      x: 1550,
      y: 700
    }, {
      id: 3,
      x: 1550,
      y: 1550
    }, {
      id: 4,
      x: 700,
      y: 1550
    }]

  const directionValues = {
    up: { x: 0, y: -1.0 },
    down: { x: 0, y: 1.0 },
    left: { x: -1.0, y: 0 },
    right: { x: 1.0, y: 0 },
    upLeft: { x: -0.707, y: -0.707 },
    downLeft: { x: -0.707, y: 0.707 },
    upRight: { x: 0.707, y: -0.707 },
    downRight: { x: 0.707, y: 0.707 },
  }
  let mapBlocks = makeBlocks(20)

  io.on('connection', function (socket) {
    socket.on('gameOverReset', function(){
      resetGameFunc(socket)
    })

    if (server.gameInProgress) {
      socket.emit('gameInProgress')
    } else {
      socket.emit('addPlayersToLobby', getAllPlayers())
    }

    socket.on('newplayer', function (potentialPlayer) {
      const available = findAvailablePlayerIds(players)
      if (available[potentialPlayer.spriteID]) {
        socket.player = R.clone(defaultPlayers[potentialPlayer.spriteID - 1])
        socket.player.name = potentialPlayer.name
        socket.player.direction = 'down'
        socket.player.health = playerHealth
        socket.player.lives = playerLives
        socket.player.level = 0
        socket.player.maxHealth = playerHealth
        socket.player.blockCounter = 0
        socket.player.playerSideTime = null
        socket.player.serverSideTime = Date.now()
        socket.player.notInvincible = true;
        io.emit('addPlayersToLobby', getAllPlayers())
        socket.emit('joinedGame')
      } else {
        socket.emit('failedJoin')
      }
    })

    socket.on('startGame', function () {
      if (socket.player && !server.gameInProgress) {
        io.emit('newGame')
        io.emit('gameHasStarted')
        server.gameInProgress = true
        io.emit('gameInProgress')
        if (!gameTimer) {
          gameTimer = setTimeout(function() {
            getAllPlayers().forEach(player => {
              io.emit('player-killed', player.id)
            })
            resetGameFunc(socket)
          }, idleGameTime)
        }
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

    socket.on('change-health', function (health) {
      if (socket.player) {
        socket.player.health = health
        if (socket.player.health <= 0) {
          socket.player.lives--
          superBlockOnDeath(io, socket.player)
          if (socket.player.lives <= 0) {
            io.emit('player-killed', socket.player.id)
          } else {
            damagePlayer(io, socket.player, defaultPlayers)
          }
        }
      }
    })

    socket.on('notInvincible', function () {
      if (socket.player) {
        socket.player.notInvincible = true
      }
    })

    socket.on('upgrade-health', function (newMaxHealth) {
      if (socket.player) {
        socket.player.maxHealth = newMaxHealth
        socket.player.health = newMaxHealth
      }
    })

    socket.on('upgrade-level', function () {
      if (socket.player) {
        socket.player.blockCounter++
        if (socket.player.blockCounter > socket.player.level) {
          socket.player.blockCounter = 0
          socket.player.level++
          socket.emit('level-change', socket.player.level)
        }
      }
    })

    socket.on('corpseLevel', function(data){
      if (socket.player) {
        if (data.level < 3) socket.player.level += 3
        else socket.player.level += data.level
        socket.emit('level-change', socket.player.level)
      }
    })

    socket.on('blockUsed', function (data) {
      if (socket.player) {
        const newBlock = makeBlocks(1)
        updateMapBlocks(data.blockId, newBlock[0])
        io.emit('allBlocks', newBlock)
        io.emit('replaceBlock', data)
      }
    })

    socket.on('destroy-crate', function (crateID) {
      if (socket.player) {
        io.emit('crate-destroyed', crateID)
        const newBlock = makeBlocks(1)
        io.emit('allBlocks', newBlock)
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
        let newBullet = {};
        let axisVelocities = directionValues[data.direction];
        let currentBulletSpeed = bulletSpeed + (bulletSpeedUpgradePercentage * socket.player.level);
        newBullet.x = data.x;
        newBullet.y = data.y;
        newBullet.xv = data.xv ? data.xv * currentBulletSpeed : axisVelocities.x * currentBulletSpeed;
        newBullet.yv = data.yv ? data.yv * currentBulletSpeed : axisVelocities.y * currentBulletSpeed;
        newBullet.id = socket.player.id;
        bulletArray.push(newBullet);
      }
    });

    socket.on('disconnect', function () {
      if (socket.player) {
        io.emit('player-killed', socket.player.id)
        io.emit('remove', socket.player.id);
        players = removePlayer(socket.player.id)
        socket.player = null
        if (players.length === 0) {
          resetGameFunc(socket)
        }
      }
      io.emit('addPlayersToLobby', getAllPlayers())
    });

    socket.on('playerLeavesLobby', function () {
      if (socket.player){
        io.emit('removePlayerFromLobby', socket.player.id)
        players = removePlayer(socket.player.id)
        socket.player = null;
      }
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
            if (playerArr[j].notInvincible && playerArr[j].y - 7 < bulletArray[i].y && playerArr[j].y + 16 > bulletArray[i].y) {
              playerArr[j].health += -10
              io.emit('player-hit', { id: playerArr[j].id });
              if (playerArr[j].health <= 0) {
                superBlockOnDeath(io, playerArr[j])
                playerArr[j].lives--;
                if (playerArr[j].lives <= 0) {
                  io.emit('player-killed', playerArr[j].id)
                } else {
                  damagePlayer(io, playerArr[j], defaultPlayers, bulletArray[i].id)
                }
              }
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
      const superBlockRNG = Math.ceil(Math.random() * 50) % 31 === 0
      const initializedBlock = {
        id: server.lastBlockIdBJAD++,
        x: randomInt(840, 1400),
        y: randomInt(840, 1400)
      }
      if (superBlockRNG) initializedBlock.id *= -1;
      madeBlocks.push(initializedBlock)
    }
    return madeBlocks
  }

  function removePlayer(id) {
    return players.filter(player => player.id !== id)
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

  function findAvailablePlayerIds(playersArray){
    const playersObj = {
      1: true,
      2: true,
      3: true,
      4: true
    }
    playersArray.forEach(player => {playersObj[player.id] = false})
    return playersObj
  }

  function resetGameFunc(socket){
    server.gameInProgress = false;
    players = []
    io.emit('gameHasEnded')
    if (socket.player) {
      io.emit('removePlayerFromLobby', socket.player.id)
      socket.player = null
    }
    mapBlocks = makeBlocks(20)
    if (gameTimer) {
      clearTimeout(gameTimer)
      gameTimer = null;
    }
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

function damagePlayer(io, player, defaultPlayers, killerID = false){
  player.health = player.maxHealth
  if (typeof (killerID) === 'number'){
    player.x = defaultPlayers[killerID - 1].x
    player.y = defaultPlayers[killerID - 1].y
  } else {
    player.x = defaultPlayers[player.id - 1].x
    player.y = defaultPlayers[player.id - 1].y
  }
  player.blockCounter = 0;
  player.level++
  player.notInvincible = false;
  setTimeout(() => {
    player.notInvincible = true;
  }, 5000);
  io.emit('life-lost', player)
}

function superBlockOnDeath(io, player){
  const corpseBlock = {
    id: player.id * -1 - (player.lives * 100),
    level: player.level,
    x: player.x,
    y: player.y
  }
  io.emit('allBlocks', [corpseBlock])
}
