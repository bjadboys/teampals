module.exports = (io, server) => {
  server.lastPlayderID = 0; // Keep track of the last id assigned to a new player
  server.lastBlockIdBJAD = 0; //Keep track of last id assigned to block
  let bullet_array = [];
  let players = []
  let mapBlocks = makeBlocks(10)

  io.on('connection', function (socket) {
    socket.on('newplayer', function () {
      socket.player = {
        id: server.lastPlayderID++,
        x: randomInt(100, 400),
        y: randomInt(100, 400)
      };
      socket.emit('allplayers', getAllPlayers());
      socket.emit('yourID', socket.player.id)
      socket.broadcast.emit('newplayer', socket.player);
      socket.emit('allBlocks', mapBlocks)

      socket.on('update-position', function (data) {
        socket.player.x = data.x;
        socket.player.y = data.y;
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
        let new_bullet = {};
        new_bullet.x = data.x;
        new_bullet.y = data.y;
        new_bullet.xv = -3;
        new_bullet.yv = -3;
        new_bullet.id = socket.player.id;
        bullet_array.push(new_bullet);
      });

      socket.on('disconnect', function () {
        io.emit('remove', socket.player.id);
      });
    });

    function ServerGameLoop() {
      for (let i = 0; i < bullet_array.length; i++) {
        // Update position of bullets
        bullet_array[i].x += bullet_array[i].xv;
        bullet_array[i].y += bullet_array[i].yv;
        // Remove bullet if it's off screen
        if (bullet_array[i].y < 0) {
          bullet_array.splice(i, 1);
          i--;
        }
        let playerArr = players;
        if (bullet_array[i]) {
          for (let j = 0; j < playerArr.length; j++) {
            if (bullet_array[i].id !== playerArr[j].id) {
              if(playerArr[j].x-12<bullet_array[i].x && playerArr[j].x+12>bullet_array[i].x){
                if(playerArr[j].y-7<bullet_array[i].y && playerArr[j].y+16>bullet_array[i].y){
                  io.emit('player-hit',playerArr[j].id);
                }
              }
            }
          }
        }
      }
      // Send updated bullets
      io.emit("bullets-update", bullet_array)
    }

    setInterval(ServerGameLoop, 16);

  });

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
