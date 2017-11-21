import 'pixi'
import 'p2'
import Phaser from 'phaser'
import io from 'socket.io-client'

var Game = {};

Game.init = function () {
    game.stage.disableVisibilityChange = true;
};

Game.preload = function () {
    game.load.tilemap('map', '../../assets/map/example_map.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.spritesheet('tileset', '../../assets/map/tilesheet.png', 32, 32);
    game.load.image('sprite', '../../assets/sprites/sprite.png');
    game.load.spritesheet('characters', '../../assets/sprites/characters.png', 32, 32)
};

var cursors;
var currentPlayer;
var previousPosition;
var weapon;
var fireButton;

Game.create = function () {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    Game.playerMap = {};
    // var testKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
    // testKey.onDown.add(Client.sendTest, this);
    var map = game.add.tilemap('map');
    map.addTilesetImage('tilesheet', 'tileset'); // tilesheet is the key of the tileset in map's JSON file
    var layer;
    for (var i = 0; i < map.layers.length; i++) {
        layer = map.createLayer(i);
    }
    layer.inputEnabled = true; // Allows clicking on the map ; it's enough to do it on the last layer
    console.log(layer.events)
    layer.events.onInputUp.add(Game.getCoordinates, this);
    Client.askNewPlayer();

    cursors = game.input.keyboard.createCursorKeys();

    weapon = game.add.weapon(1, 'sprite');
    weapon.enableBody = true;
    game.physics.arcade.enable(weapon);
    weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
    weapon.bulletAngleOffset = 90;
    weapon.bulletSpeed = 75;
    fireButton = game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR)
};

Game.update = function () {
    if (currentPlayer) {
        currentPlayer.body.velocity.x = 0;
        currentPlayer.body.velocity.y = 0;
        // currentPlayer.anchor.setTo(.5, .5)
        Client.updatePosition(previousPosition, currentPlayer.position);
        previousPosition = Object.assign({},currentPlayer.position);
        if (cursors.left.isDown) {
            currentPlayer.body.velocity.x = -150;
            currentPlayer.scale.setTo(-4, 4)
            currentPlayer.animations.play('right')
        }
        else if (cursors.right.isDown) {
            currentPlayer.body.velocity.x = 150;
            currentPlayer.animations.play('right')
        }
        else if (cursors.up.isDown) {
            currentPlayer.body.velocity.y = -150;
            currentPlayer.animations.play('up')
        }
        else if (cursors.down.isDown) {
            currentPlayer.body.velocity.y = 150;
        // } else {
        //     currentPlayer.animations.stop()
        // }
    } else {
            currentPlayer.scale.setTo(4, 4)
            currentPlayer.animations.stop()
        }
        if (fireButton.isDown) {
            console.log('check')
            console.log(weapon)
            weapon.fire();
        }
    }
    game.physics.arcade.overlap(weapon.bullets, currentPlayer, Game.hitEnemy);
}



Game.addNewPlayer = function (id, x, y) {
    const newPlayer = game.add.sprite(x, y, 'characters')
    newPlayer.scale.setTo(4, 4)

    console.log(newPlayer)
    newPlayer.frame = 0
    newPlayer.animations.add('right', [0, 1, 2, 3, 4, 5, 6, 7], 10, true)
    newPlayer.animations.add('up', [18, 19, 20, 21, 22], 10, true)

    Game.playerMap[id] = newPlayer

};

Game.setCurrentPlayer = function(id){
    currentPlayer = Game.playerMap[id];
    currentPlayer.enableBody = true;
    game.physics.arcade.enable(currentPlayer);
    previousPosition = Object.assign({},currentPlayer.position);
    weapon.trackSprite(currentPlayer, 12, -50);
}

Game.removePlayer = function (id) {
    Game.playerMap[id].destroy();
    delete Game.playerMap[id];
};

Game.getCoordinates = function (layer, pointer) {
    Client.sendClick(pointer.worldX, pointer.worldY);
};

Game.movePlayer = function (id, x, y) {
    var player = Game.playerMap[id];

    player.animations.add('breathe', [3, 5], 2, true)
    player.animations.play('breathe')
    var distance = Phaser.Math.distance(player.x, player.y, x, y);
    var duration = distance * 1;
    var tween = game.add.tween(player);
    tween.to({ x: x, y: y }, duration);
    tween.start();
};

Game.hitEnemy = function () {
  weapon.bullets.kill();
  // currentPlayer.kill();
}

var game = new Phaser.Game(24 * 32, 17 * 32, Phaser.AUTO, document.getElementById('game'));
game.state.add('Game', Game);
game.state.start('Game');

var Client = {};
Client.socket = io.connect();

Client.askNewPlayer = function () {
    Client.socket.emit('newplayer');
};

Client.socket.on('yourID', function (data) {
    Game.setCurrentPlayer(data);
});

Client.socket.on('newplayer', function (data) {
    Game.addNewPlayer(data.id, data.x, data.y);
});

Client.socket.on('allplayers', function (data) {
    for (var i = 0; i < data.length; i++) {
        Game.addNewPlayer(data[i].id, data[i].x, data[i].y);
    }
});

Client.socket.on('remove', function (id) {
    Game.removePlayer(id);
});

Client.socket.on('move', function (data) {
    Game.movePlayer(data.id, data.x, data.y);
});

Client.sendClick = function (x, y) {
    Client.socket.emit('click', { x: x, y: y });
};

Client.updatePosition = function (previous, current) {
    if (previous.x !== current.x || previous.y !== current.y) {
        Client.socket.emit('click', { x: current.x, y: current.y })
    }
}
