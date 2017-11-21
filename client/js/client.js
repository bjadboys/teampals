import io from 'socket.io-client'
import {game} from '../game/index'
// import {movePlayer, setCurrentPlayer, removePlayer, addNewPlayer, hitEnemy} from '../states/MainGame'

const Client = {};
if(game) {
    const { MainGame } = game.state.states.MainGame 
}
Client.socket = io.connect();

Client.askNewPlayer = function(){
    console.log("NEWPLAYER", game)
    Client.socket.emit('newplayer');
};

Client.socket.on('yourID',function(data){
    game.state.states.MainGame.setCurrentPlayer(data);
});

Client.socket.on('newplayer',function(data){
    game.state.states.MainGame.addNewPlayer(data.id,data.x,data.y);
});

Client.socket.on('allplayers',function(data){
    for (var i = 0; i < data.length; i++){
        game.state.states.MainGame.addNewPlayer(data[i].id,data[i].x,data[i].y);
    }
});

Client.socket.on('remove',function(id){
    game.state.states.MainGame.removePlayer(id);
});

Client.socket.on('move',function(data){
    game.state.states.MainGame.movePlayer(data.id,data.x,data.y);
});

Client.updatePosition = function(previous, current){
    if (previous.x !== current.x || previous.y !== current.y){
        Client.socket.emit('click', {x:current.x, y:current.y})
    }
};

export default Client
