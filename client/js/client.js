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

Client.socket.on("bullets-update",function(RCV_bullet_array){
    // If there's not enough bullets on the client, create them
    for(var i=0;i<server_bullet_array.length;i++){
        if(bullet_array[i] == undefined){
            bullet_array[i] = game.add.sprite(server_bullet_array[i].x,server_bullet_array[i].y,'bullet');
        } else {
            //Otherwise, just update it! 
            bullet_array[i].x = server_bullet_array[i].x; 
            bullet_array[i].y = server_bullet_array[i].y;
        }
    }
    // Otherwise if there's too many, delete the extra 
    for(var i=server_bullet_array.length;i<bullet_array.length;i++){
         bullet_array[i].destroy();
         bullet_array.splice(i,1);
         i--;
     }
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