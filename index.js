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
	acceleration: 500,
	friction: 0.98,
	speed: 100,
	mass: 5,
	size: 32,
	timeStep: 1 / 60
};
//===================================
// Engine Requirements & Variables
//
var p2 = require('p2');
var world = new p2.World({
	gravity:[0, 0]
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
			// Make body and store it inside the object
			gamePlayer.core = new p2.Body({
				mass: settings.mass,
				position: [200, 200]
			});
			gamePlayer.game = {
				type: "ball"
			}
			// Add the shape
			var circleShape = new p2.Circle({ radius: settings.size / 2 });
			gamePlayer.core.addShape(circleShape);
			gamePlayer.id = players.length;
			players.push(gamePlayer);
			// Add the body to the world
			world.addBody(gamePlayer.core);
			// Get the joined players name
			var joinedPlayer = players.filter(function(item){return item.globalID === player.globalID})[0];
			console.log(`CONFIRMED JOIN GAME FOR: ${joinedPlayer.name}`);
			// Send Data package back to client
			socket.emit('clientData', utils.playerToClient(gamePlayer), utils.playersToPositions(players));
			// Let everyone know there's a new player
			io.emit('newPlayer', utils.playersToPositions(players));
			console.log("Sent 'clientData' package");
		}
	});
	// When the server recieves a key press, the players get updated.
	socket.on('keyPress', function(playerData, key){
		console.log(`KEYPRESS FROM: ${players[playerData.id].name} | KEY: ${key} | VELO: ${JSON.stringify(players[playerData.id].core.velocity)}`);
		//console.log(JSON.stringify(players[playerData.id].core.position));
		var velocity = players[playerData.id].core.velocity;
		// If the velocity is under the speed limit then register the keys.
		if((velocity[0] < settings.speed && velocity[1] < settings.speed) && (velocity[0] > -settings.speed && velocity[1] > -settings.speed)){
			if(key === "left"){
				players[playerData.id].core.applyForce([-settings.acceleration,velocity[1]]);
			} else if(key === "right"){
				players[playerData.id].core.applyForce([settings.acceleration,velocity[1]]);
			} else if(key === "up"){
				players[playerData.id].core.applyForce([velocity[0],-settings.acceleration]);
			} else if(key === "down"){
				players[playerData.id].core.applyForce([velocity[0],settings.acceleration]);
			}
		} else {
			// If not then limit the velocity
			if(velocity[0] > settings.speed){
				velocity[0] = settings.speed;
			}
			if(velocity[0] < -settings.speed){
				velocity[0] = -settings.speed;
			}
			if(velocity[1] < -settings.speed){
				velocity[1] = -settings.speed;
			}
			if(velocity[1] < -settings.speed){
				velocity[1] = -settings.speed;
			}
		}
	});
	// Chat Stuffs
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
	setInterval(function(){
		world.step(settings.timeStep);
		if(world.bodies.length > 1){
			world.bodies.forEach(function(item, idx){
				item.velocity[0] *= settings.friction;
				item.velocity[1] *= settings.friction;
			});
		}
	}, 1000 * settings.timeStep);
	setInterval(function(){
		io.emit('update', utils.playersToPositions(players));
	}, 15);
});