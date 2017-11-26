import io from 'socket.io-client'
import {game} from '../game/index'
// import {movePlayer, setCurrentPlayer, removePlayer, addNewPlayer, hitEnemy} from '../states/MainGame'
let bullet_array = [];
const Client = {};
let offsetX = 0;
let offsetY = 0;
let sendStopCalls = false;
Client.socket = io.connect();

Client.askNewPlayer = function(){
  Client.socket.emit('newplayer');
};

Client.SEND_fire = function (position) {
  Client.socket.emit('fire', { x: position.x+offsetX, y: position.y+offsetY })
};

Client.updatePosition = function (previous, current) {
    if (previous.x !== current.x || previous.y !== current.y) {
        Client.socket.emit('update-position', { x: current.x, y: current.y })
        sendStopCalls = false;
    }
    else if (!sendStopCalls) {
        Client.socket.emit('stopped-moving')
        sendStopCalls = true;
    }
};

Client.blockUsedBJAD = function(usedBlockId) {
    Client.socket.emit('blockUsed', usedBlockId)
}

Client.playerPicksUpBlockBJAD = function(player, block) {
    console.log(block, 'block in client')
    const playerId = player.id
    const blockId = block.id
    Client.socket.emit('block-picked-up', {playerId, blockId})
}

Client.playerDropsBlockBJAD = function(playerId) {
    Client.socket.emit('block-dropped', playerId)
}

Client.socket.on('player-dropped-block', function (playerId) {
    game.state.states.MainGame.dropBlockBJAD(playerId)
}) 

//Client add on block at a time to the map.
Client.socket.on('addBlock', function(data){
    game.state.states.MainGame.addBlockBJAD(data.id, data.x, data.y)
})

Client.socket.on('player-picked-up-block', function(data){
    console.log(data)
    game.state.states.MainGame.collectBlockBJAD(data.playerId, data.blockId)
})

Client.socket.on('allBlocks', function(data){
    data.forEach(block => {
        game.state.states.MainGame.addBlockBJAD(block.id, block.x, block.y)
    })
})


Client.socket.on('replaceBlock', function(data){
    console.log(data)
    game.state.states.MainGame.removeBlockBJAD(data.usedBlockId);
    game.state.states.MainGame.addBlockBJAD(data.newBlock.id, data.newBlock.x, data.newBlock.y)
})
Client.socket.on('stop-animation', function(data) {
  game.state.states.MainGame.stopAnimation(data);
})

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

Client.socket.on('player-hit',function(id){
    game.state.states.MainGame.killPlayer(id);
});


Client.socket.on("bullets-update", function (RCV_bullet_array) {
    // If there's not enough bullets on the client, create them
    for (var i = 0; i < RCV_bullet_array.length; i++) {
        if (bullet_array[i] === undefined) {
            let bullet = game.add.sprite(RCV_bullet_array[i].x, RCV_bullet_array[i].y, 'bullet');
            bullet.scale.setTo(0.5);
            bullet.anchor.setTo(0.5,0.5);
            bullet_array[i] = bullet;
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

Client.socket.on('move', function(data){
    game.state.states.MainGame.movePlayer(data.id, data.x, data.y);
});



export default Client
