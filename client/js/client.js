
import io from 'socket.io-client'
import {movePlayer, setCurrentPlayer, removePlayer, addNewPlayer, hitEnemy} from '../states/MainGame'

const Client = {};
Client.socket = io.connect();

Client.askNewPlayer = function(){
    Client.socket.emit('newplayer');
};

Client.socket.on('yourID',function(data){
    setCurrentPlayer(data);
});

Client.socket.on('newplayer',function(data){
    addNewPlayer(data.id,data.x,data.y);
});

Client.socket.on('allplayers',function(data){
    for (var i = 0; i < data.length; i++){
        addNewPlayer(data[i].id,data[i].x,data[i].y);
    }
});

Client.socket.on('remove',function(id){
    removePlayer(id);
});

Client.socket.on('move',function(data){
    movePlayer(data.id,data.x,data.y);
});

Client.updatePosition = function(previous, current){
    if (previous.x !== current.x || previous.y !== current.y){
        Client.socket.emit('click', {x:current.x, y:current.y})
    }
};

export default Client
