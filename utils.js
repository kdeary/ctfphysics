var p2 = require('p2');
var settings;
var map;

exports.init = function(data){
	settings = data.settings;
	map = data.map;
}

exports.playersToPositions = function(players, clientPlayer){
	return players.map(function(item, idx){
		var client = {
			render: true,
			x: item.core.position[0],
			y: item.core.position[1],
			angle: item.core.angle,
			name: item.name,
			tagged: item.game.tagged,
			team: item.game.team,
			flag: item.game.flag,
			dead: item.game.dead
		};
		if(clientPlayer === "firstRun") return client; // If it's the first run then RENDER ALL THE BALLS
		if(
			(item.core.position[0] >= clientPlayer.core.position[0] - settings.viewWidth) && // X Left Side
			(item.core.position[0] <= clientPlayer.core.position[0] + settings.viewWidth) && // X Right Side
			(item.core.position[1] <= clientPlayer.core.position[1] + settings.viewHeight) && // Y Top Side
			(item.core.position[1] >= clientPlayer.core.position[1] - settings.viewHeight) // Y Bottom Side
		){
			return client;
		} else {
			return null;
		}
	});
}

exports.boostsToData = function(boosts){
	return boosts.map(function(item, idx){
		var boost = {
			id: item.gameid,
			respawn: item.respawn
		};
		return boost;
	});
}

exports.pickFromArray = function(array){
	return array[exports.getRandomInt(0, array.length)];
}

exports.equalPositive = function(num1, num2){
	return (num1 * num2 / Math.abs(num2));
}

exports.killBall = function(body, players){
	if(typeof body !== "undefined"){
		players[body.playerid].game.dead = true;
		var stopX = body.position[0];
		var stopY = body.position[1];
		// Stops collision
		body.shapes[0].sensor = true;
		setTimeout(function(){
			var spawn = exports.pickFromArray(players[body.playerid].game.team === 1 ? map.spawns.red : map.spawns.blue);
			body.position[0] = spawn.x;
			body.position[1] = spawn.y;
			players[body.playerid].game.flag.type = 0;
			body.shapes[0].sensor = false;
			players[body.playerid].game.dead = false;
			body.velocity[0] = 0;
			body.velocity[1] = 0;
			console.log(players[body.playerid].game);
		}, settings.spawnTimer);
	}
}

exports.createMap = function(world, map, entities){
	for (var i = 0; i < map.tiles.length; i++) {
		for (var j = 0; j < map.tiles[i].length; j++) {
			if(map.tiles[i][j] === 0){
				// Blank Tile
			} else if(map.tiles[i][j] === 1){
				// Wall
				var tileBody = new p2.Body({
					mass: 0,
					position: [j*settings.tileSize,i*settings.tileSize]
				});
				var boxShape = new p2.Box({
					width: settings.tileSize,
					height: settings.tileSize
				});
				tileBody.gametype = "wall";
				tileBody.addShape(boxShape);
				world.addBody(tileBody);
			} else if(map.tiles[i][j] === 2){
				// Spike
				var spikeBody = new p2.Body({
					mass: 0,
					position: [j*settings.tileSize,i*settings.tileSize]
				});
				var circleShape = new p2.Circle({
					radius: 14
				});
				spikeBody.gameid = j + i;
				spikeBody.gametype = "spike";
				spikeBody.addShape(circleShape);
				world.addBody(spikeBody);
			} else if(map.tiles[i][j] === 3){
				// Boost
				var boostBody = new p2.Body({
					mass: 0,
					position: [j*settings.tileSize,i*settings.tileSize]
				});
				var circleShape = new p2.Circle({
					radius: 14
				});
				boostBody.gameid = j + i;
				boostBody.gametype = "boost";
				boostBody.respawn = 0;
				boostBody.addShape(circleShape);
				boostBody.shapes[0].sensor = true;
				world.addBody(boostBody);
				entities.boosts.push(boostBody);
			} else if(map.tiles[i][j] === 4){
				// Red Flag
				var flagBody = new p2.Body({
					mass: 0,
					position: [j*settings.tileSize,i*settings.tileSize]
				});
				var boxShape = new p2.Box({
					width: settings.tileSize,
					height: settings.tileSize
				});
				flagBody.gameid = j + i;
				flagBody.gametype = "redflag";
				flagBody.taken = false;
				flagBody.addShape(boxShape);
				flagBody.shapes[0].sensor = true;
				world.addBody(flagBody);
			} else if(map.tiles[i][j] === 5){
				// Blue Flag
				var flagBody = new p2.Body({
					mass: 0,
					position: [j*settings.tileSize,i*settings.tileSize]
				});
				var boxShape = new p2.Box({
					width: settings.tileSize,
					height: settings.tileSize
				});
				flagBody.gameid = j + i;
				flagBody.gametype = "blueflag";
				flagBody.taken = false;
				flagBody.addShape(boxShape);
				flagBody.shapes[0].sensor = true;
				world.addBody(flagBody);
			}
		}
	}
}

exports.playerToClient = function(player){
	var client = {x: player.core.position[0], y: player.core.position[1]};
	client.id = player.id;
	client.size = player.core.shapes[0].radius * 2;
	client.tagged = player.game.tagged;
	client.dead = player.game.dead;
	client.team = player.game.team;
	return client;
}

exports.getRandomInt = function(min, max){
	return Math.floor(Math.random() * (max - min)) + min;
}

exports.escapeHTML = function(str){
	return str.replace("<", "&#60;").replace(">", "&#62;");
}

exports.replaceEmojis = function(str){
	var html = str;
	var ranges = [
		'\ud83c[\udf00-\udfff]', // U+1F300 to U+1F3FF
		'\ud83d[\udc00-\ude4f]', // U+1F400 to U+1F64F
		'\ud83d[\ude80-\udeff]'  // U+1F680 to U+1F6FF
	];
	html = html.replace(new RegExp(ranges.join('|'), 'g'),'<span class="emoji">$&</span>');
	console.log(html);
	return html;
}
