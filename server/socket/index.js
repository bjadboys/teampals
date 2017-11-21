module.exports = (io, server) => {
  server.lastPlayderID = 0; // Keep track of the last id assigned to a new player
  let bullet_array = [];
  
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
      
      socket.on('click', function (data) {
        socket.player.x = data.x;
        socket.player.y = data.y;
        socket.broadcast.emit('move', socket.player);
      });
      
      socket.on('fire', function (data) {
        let new_bullet = {};
        new_bullet.x = data.x;
        new_bullet.y = data.y;
        new_bullet.xv = 0;
        new_bullet.yv = -3;
        new_bullet.id = socket.id;
        bullet_array.push(new_bullet);
      });
      
      socket.on('disconnect', function () {
        io.emit('remove', socket.player.id);
      });
    });

    function ServerGameLoop(){
      for(let i=0;i<bullet_array.length;i++){
        // Update position of bullets
        bullet_array[i].x += bullet_array[i].xv;
        bullet_array[i].y += bullet_array[i].yv;
        // Remove bullet if it's off screen
        if(bullet_array[i].y < 0){
          bullet_array.splice(i,1);
          i--;
        } 
      }
      // Send updated bullets
      io.emit("bullets-update", bullet_array)
    }
    
    setInterval(ServerGameLoop, 16); 

  });
  
  function getAllPlayers() {
    var players = [];
    Object.keys(io.sockets.connected).forEach(function (socketID) {
      var player = io.sockets.connected[socketID].player;
      if (player) players.push(player);
    });
    return players;
  }
  
  function randomInt(low, high) {
    return Math.floor(Math.random() * (high - low) + low);
  }
}
