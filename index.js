//===================================
// Server Requirements
//
var express = require('express');
var app = express();
var http = require('http').Server(app);
var path = require('path');
var utils = require('./utils');
var sanitizer = require('sanitizer');
var PORT = 3000;

//===================================
// Communication Requirements
//
var io = require('socket.io')(http);

//===================================
// Game Variables
//
var players = [];

var settings = {
	acceleration: 0.5
};
//===================================
// Engine Requirements & Variables
//
var Physics = require('physicsjs');
var world = Physics({
    // set the timestep
    timestep: 1000.0 / 160,
    // maximum number of iterations per step
    maxIPF: 16,
    // set the integrator (may also be set with world.add())
    integrator: 'verlet'
});

var gravity = Physics.behavior('constant-acceleration', {
    acc: { x : 0, y: 0.0004 } // this is the default
});
//===================================
// Asset Routes
//
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

//===================================
// Routes
//
app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
	// Confirms that the player will join the game.
	socket.on('confirmJoin', function(player){
		var isPlayerJoined = players.filter(function(item){return item.globalID === player.globalID})[0];
		// If player is not already in game then push them to the players array.
		if(typeof isPlayerJoined === "undefined"){
			// Setup object to push to the players array.
			var gamePlayer = player;
			gamePlayer.core = Physics.body('circle', {
				x: 200, // x-coordinate
				y: 200, // y-coordinate
				radius: 48
			});
			gamePlayer.id = players.length;
			players.push(gamePlayer);
			world.add(gamePlayer.core);
			var joinedPlayer = players.filter(function(item){return item.globalID === player.globalID})[0];
			console.log(`CONFIRMED JOIN GAME FOR: ${joinedPlayer.name}`);
			socket.emit('clientData', utils.playerToClient(gamePlayer), utils.playersToPositions(players));
			io.emit('newPlayer', utils.playersToPositions(players));
			console.log("Sent 'clientData' package");
		}
	});
	// When the server recieves a key press, the players get updated.
	socket.on('keyPress', function(playerData, key){
		console.log(`KEYPRESS FROM: ${players[playerData.id].name} | KEY: ${key} | CURRENT: ${JSON.stringify(players[playerData.id].core.state.pos)}`);
		//console.log(JSON.stringify(players[playerData.id].core.position));
		if(key === "left"){
			players[playerData.id].core.accelerate(Physics.vector(-1,0));
		} else if(key === "right"){
			players[playerData.id].core.accelerate(Physics.vector(1,0));
		} else if(key === "up"){
			players[playerData.id].core.accelerate(Physics.vector(0,-1));
		} else if(key === "down"){
			players[playerData.id].core.accelerate(Physics.vector(0,1));
		}
	});
	socket.on('chatMessage', function(player, msg){
		console.log(player.name + ': ' + msg);
		io.emit('chatMessage', sanitizer.escape(player.name), sanitizer.escape(msg));
	});
	socket.on('addconnecter', function(player){
		io.emit('addconnecter', player.name);
		io.emit('serverMessage', 'Server: ' + sanitizer.escape(player.name) + ' Connected');
	});
	socket.on('disconnection', function(){
		io.emit('serverMessage', 'Server: Someone Disconnected');
	});
	console.log("USER CONNECTION");
});

http.listen(PORT, function(){
	console.log('listening on *:' + PORT);
	//world.add(gravity);
	Physics.util.ticker.on(function(time){
		world.step(time);
	});
	Physics.util.ticker.start();
	setInterval(function(){
		io.emit('update', utils.playersToPositions(players));
	}, 10);
});