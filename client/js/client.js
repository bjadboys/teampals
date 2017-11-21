import io from 'socket.io-client'
import {game} from '../game/index'
// import {movePlayer, setCurrentPlayer, removePlayer, addNewPlayer, hitEnemy} from '../states/MainGame'
let bullet_array = [];
console.log('yes, this is running')
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

Client.SEND_fire = function (position) {
    Client.socket.emit('fire', { x: position.x, y: position.y })
};

Client.socket.on("bullets-update", function (RCV_bullet_array) {
    // If there's not enough bullets on the client, create them
    for (var i = 0; i < RCV_bullet_array.length; i++) {
        if (bullet_array[i] == undefined) {
            bullet_array[i] = game.add.sprite(RCV_bullet_array[i].x, RCV_bullet_array[i].y, 'sprite');
        } else {
            //Otherwise, just update it! 
            bullet_array[i].x = RCV_bullet_array[i].x;
            bullet_array[i].y = RCV_bullet_array[i].y;
        }
    }
    // Otherwise if there's too many, delete the extra 
    for (var i = RCV_bullet_array.length; i < bullet_array.length; i++) {
        bullet_array[i].destroy();
        bullet_array.splice(i, 1);
        i--;
    }
});

Client.socket.on('move',function(data){
    game.state.states.MainGame.movePlayer(data.id,data.x,data.y);
});

Client.updatePosition = function (previous, current) {
    if (previous.x !== current.x || previous.y !== current.y) {
        Client.socket.emit('click', { x: current.x, y: current.y })
    }
};


Client.sendClick = function(x,y){
    Client.socket.emit('click',{x:x,y:y});
};


export default Client
