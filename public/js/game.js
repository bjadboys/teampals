var Game = {};

Game.init = function () {
    game.stage.disableVisibilityChange = true;
};

Game.preload = function () {
    game.load.tilemap('map', 'assets/map/example_map.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.spritesheet('tileset', 'assets/map/tilesheet.png', 32, 32);
    game.load.image('sprite', 'assets/sprites/sprite.png');
};

var cursors;
var currentPlayer;
var previousPosition;


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
};

Game.update = function () {
    if (currentPlayer) {
        currentPlayer.body.velocity.x = 0;
        currentPlayer.body.velocity.y = 0;
        Client.updatePosition(previousPosition, currentPlayer.position);
        previousPosition = Object.assign({},currentPlayer.position);
    }
    if (cursors.left.isDown) {
        console.log(currentPlayer.position);
        currentPlayer.body.velocity.x = -150;
    }
    if (cursors.right.isDown) {
        currentPlayer.body.velocity.x = 150;
    }
    if (cursors.up.isDown) {
        currentPlayer.body.velocity.y = -150;
    }
    if (cursors.down.isDown) {
        currentPlayer.body.velocity.y = 150;
    }
}


Game.addNewPlayer = function (id, x, y) {
    Game.playerMap[id] = game.add.sprite(x, y, 'sprite');
};

Game.setCurrentPlayer = function(id){
    currentPlayer = Game.playerMap[id];
    game.physics.arcade.enable(currentPlayer);
    previousPosition = Object.assign({},currentPlayer.position);
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
    var distance = Phaser.Math.distance(player.x, player.y, x, y);
    var duration = distance * 5;
    var tween = game.add.tween(player);
    tween.to({ x: x, y: y }, duration);
    tween.start();
};

var game = new Phaser.Game(24 * 32, 17 * 32, Phaser.AUTO, document.getElementById('game'));
game.state.add('Game', Game);
game.state.start('Game');