//===================================
// Server Requirements
//
var express = require('express');
var app = express();
var http = require('http').Server(app);
var path = require('path');
var utils = require('./utils');
var sanitizer = require('sanitizer');
var fs = require('fs');
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
	friction: 0.99,
	speed: 150,
	mass: 5,
	ballSize: 64,
	tileSize: 64,
	viewWidth: 500,
	viewHeight: 500,
	timeStep: 1 / 60,
	spawnTimer: 3000,
	boostPower: 1,
	boostRespawn: 2000,
	scoreRed: 0,
	scoreBlue: 0,
	tagMode: true
};

var entities = {
	boosts: []
}

var events = {

};

var map = JSON.parse(fs.readFileSync("./map.json"));

utils.init({
	settings: settings,
	map: map
});

//===================================
// Engine Requirements & Variables
//
var p2 = require('p2');
var world = new p2.World({
	gravity:[0, 0]
});
var tagRestrainer = true;
utils.createMap(world, map, entities);
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
	var socketPlayer;
	socket.on('confirmJoin', function(player){
		var isPlayerJoined = players.filter(function(item){return item.globalID === player.globalID})[0];
		// If player is not already in game then push them to the players array.
		if(typeof isPlayerJoined === "undefined"){
			// Setup object to push to the players array.
			var gamePlayer = player;
			// Make body and store it inside the object
			var team = (players.length + 1) % 2 === 1 ? 1 : 2;
			var spawn = utils.pickFromArray(team === 1 ? map.spawns.red : map.spawns.blue);
			gamePlayer.core = new p2.Body({
				mass: settings.mass,
				position: [spawn.x, spawn.y]
			});
			console.log((players.length + 1) % 2 === 1 ? "red" : "blue");
			gamePlayer.game = {
				type: "ball",
				tagged: settings.tagMode ? (players.length === 0 ? true : false) : false,
				team: team,
				flag: {type: 0, id: 0},
				dead: false
			}
			// Add the shape
			var circleShape = new p2.Circle({ radius: settings.ballSize / 2 });
			gamePlayer.core.addShape(circleShape);
			gamePlayer.id = players.length;
			gamePlayer.core.playerid = players.length;
			players.push(gamePlayer);
			socketPlayer = gamePlayer;
			// Add the body to the world
			world.addBody(gamePlayer.core);
			// Get the joined players name
			var joinedPlayer = players.filter(function(item){return item.globalID === player.globalID})[0];
			console.log(`CONFIRMED JOIN GAME FOR: ${joinedPlayer.name}`);
			// Send Data package back to client
			socket.emit('clientData', utils.playerToClient(gamePlayer), utils.playersToPositions(players, "firstRun"), map, settings);
			// Let everyone know there's a new player
			io.emit('newPlayer', utils.playersToPositions(players, "firstRun"));
			console.log("Sent 'clientData' package");
		}
	});
	// When the server recieves a key press, the players get updated.
	socket.on('keyPress', function(playerData, key){
		if(typeof players[playerData.id] !== "undefined" && !players[playerData.id].dead){
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
				// if(velocity[0] > settings.speed){
				// 	velocity[0] = settings.speed;
				// }
				// if(velocity[0] < -settings.speed){
				// 	velocity[0] = -settings.speed;
				// }
				// if(velocity[1] < -settings.speed){
				// 	velocity[1] = -settings.speed;
				// }
				// if(velocity[1] < -settings.speed){
				// 	velocity[1] = -settings.speed;
				// }
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
	//===================================
	// Update Interval
	//
	setInterval(function(){
		if(typeof socketPlayer !== "undefined"){
			socket.emit('update', {
				players: utils.playersToPositions(players, socketPlayer),
				events: events,
				entities: {
					boosts: utils.boostsToData(entities.boosts)
				}
			});
		}
	}, 15);
});



http.listen(PORT, function(){
	console.log('listening on *:' + PORT);
	setInterval(function(){
		world.step(settings.timeStep);
		// Extra Friction For Balls
		world.bodies.forEach(function(item, idx){
			if(typeof item.playerid !== "undefined"){
				item.velocity[0] = item.velocity[0] * settings.friction;
				item.velocity[1] = item.velocity[1] * settings.friction;
			}
		});
	}, 1000 * settings.timeStep);
});


//===================================
// Contacts with objects
//
world.on("beginContact", function(objects){
	//world.emit({type: "endContact"});
	// Checks if the two objects are balls
	var bodyA = objects.bodyA;
	var bodyB = objects.bodyB;
	if(bodyA.gametype === "spike" || bodyB.gametype === "spike"){
		// If an object touches a spike
		var body;
		if(typeof bodyA.playerid !== "undefined"){
			body = bodyA;
		} else if(typeof bodyB.playerid !== "undefined"){
			// If the other object is a player
			body = bodyB;
		}
		// KILL BALL
		utils.killBall(body, players);
	} else if(bodyA.gametype === "boost" || bodyB.gametype === "boost"){
		// If an object touches a boost
		var body;
		var otherBody;
		if(typeof bodyA.playerid !== "undefined"){
			body = bodyA;
			otherBody = bodyB;
		} else if(typeof bodyB.playerid !== "undefined"){
			body = bodyB;
			otherBody = bodyA;
		}
		if(typeof body !== "undefined"){
			if(otherBody.respawn <= 0){
				var veloX = (body.velocity[0]) * (settings.boostPower);
				var veloY = (body.velocity[1]) * (settings.boostPower);
				console.log(veloX);
				console.log(veloY);
				//body.applyForce([veloX, veloY]);
				body.velocity[0] = veloX;
				body.velocity[1] = veloY;

				otherBody.respawn = settings.boostRespawn;
				var respawner = setInterval(function(){
					if(otherBody.respawn > 0){
						otherBody.respawn -= 1;
					} else {
						clearInterval(respawner);
					}
				}, 1);
			}
		}
	} else if(bodyA.gametype === "redflag" || bodyB.gametype === "redflag"){
		// If an object touches a redflag
		var body;
		var otherBody;
		if(typeof bodyA.playerid !== "undefined"){
			// If the other object is a player
			body = bodyA;
			otherBody = bodyB;
		} else if(typeof bodyB.playerid !== "undefined"){
			// If the other object is a player
			body = bodyB;
			otherBody = bodyA;
		}
		// Checks if flag is taken
		if(!otherBody.taken){
			var playerIsRed = players[body.playerid].game.team === 1;
			var playerIsHoldingBlueFlag = players[body.playerid].game.flag.type === 2;

			var playerIsBlue = players[body.playerid].game.team === 2;
			var playerIsNotHoldingFlag = players[body.playerid].game.flag.type === 0;

			if(playerIsRed && playerIsHoldingBlueFlag){
				players[body.playerid].game.flag.type = 0;
				settings.scoreRed++;
			} else if(players[body.playerid].game.team === 2 && playerIsNotHoldingFlag){
				players[body.playerid].game.flag.type = 1;
				players[body.playerid].game.flag.id = otherBody.gameid;
				otherBody.taken = true;
			}
		}
		console.log(JSON.stringify(players[body.playerid].game));
	} else if(bodyA.gametype === "blueflag" || bodyB.gametype === "blueflag"){
		// If an object touches a blueflag
		var body;
		var otherBody;
		if(typeof bodyA.playerid !== "undefined"){
			// If the other object is a player
			body = bodyA;
			otherBody = bodyB;
		} else if(typeof bodyB.playerid !== "undefined"){
			// If the other object is a player
			body = bodyB;
			otherBody = bodyA;
		}
		if(!otherBody.taken){
			var playerIsBlue = players[body.playerid].game.team === 2;
			var playerIsHoldingRedFlag = players[body.playerid].game.flag.type === 1;

			var playerIsRed = players[body.playerid].game.team === 1;
			var playerIsNotHoldingFlag = players[body.playerid].game.flag.type === 0;

			if(playerIsBlue && playerIsHoldingRedFlag){
				// Score Flag
				players[body.playerid].game.flag.type = 0;
				settings.scoreBlue++;
			} else if(playerIsRed && playerIsNotHoldingFlag){
				// Take Flag
				players[body.playerid].game.flag.type = 2;
				players[body.playerid].game.flag.id = otherBody.gameid;
			}
		}
		console.log(JSON.stringify(players[body.playerid].game));
	} else if(typeof bodyA.playerid !== "undefined" && typeof bodyB.playerid !== "undefined"){
		var body;
		var otherBody;
		if(settings.tagMode){
			if(players[bodyA.playerid].game.tagged){
				players[bodyA.playerid].game.tagged = false;
				players[bodyB.playerid].game.tagged = true;
				console.log(`${players[bodyA.playerid].name} tagged ${players[bodyB.playerid].name}.`);
			} else if(players[bodyB.playerid].game.tagged){
				players[bodyB.playerid].game.tagged = false;
				players[bodyA.playerid].game.tagged = true;
				console.log(`${players[bodyB.playerid].name} tagged ${players[bodyA.playerid].name}.`);
			}
		}
		// Check if player is not holding flag
		if(players[bodyA.playerid].game.flag.type > 0 && players[bodyA.playerid].game.flag.type > 0){

		} else if(players[bodyA.playerid].game.flag.type > 0){
			// If the other object is a player
			body = bodyA;
			otherBody = bodyB;
		} else if(players[bodyB.playerid].game.flag.type > 0){
			// If the other object is a player
			body = bodyB;
			otherBody = bodyA;
		}
		// KILL BALL
		utils.killBall(body, players);
	}
	console.log("CONTACT");
});
