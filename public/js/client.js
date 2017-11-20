var Client = {};
Client.socket = io.connect();

Client.askNewPlayer = function(){
    Client.socket.emit('newplayer');
};

Client.socket.on('yourID',function(data){
    Game.setCurrentPlayer(data);
});

Client.socket.on('newplayer',function(data){
    Game.addNewPlayer(data.id,data.x,data.y);
});

Client.socket.on('allplayers',function(data){
    for(var i = 0; i < data.length; i++){
        Game.addNewPlayer(data[i].id,data[i].x,data[i].y);
    }
});

Client.socket.on('remove',function(id){
    Game.removePlayer(id);
});

Client.socket.on('move',function(data){
    Game.movePlayer(data.id,data.x,data.y);
});

Client.sendClick = function(x,y){
    Client.socket.emit('click',{x:x,y:y});
};

Client.updatePosition = function(previous, current){
    if(previous.x !== current.x || previous.y !== current.y){
        Client.socket.emit('click', {x:current.x, y:current.y})
    }
};

// Client.sendPlayerLocation = function(currentPlayer){
//     Client.socket.emit('click',{x:x,y:y});
// }