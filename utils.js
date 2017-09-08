var p2 = require('p2');

exports.playersToPositions = function(players){
	return players.map(function(item, idx){
		var client = {
			x: item.core.position[0],
			y: item.core.position[1],
			name: item.name,
			tagged: item.game.tagged,
			team: item.game.team,
			flag: item.game.flag,
			dead: item.game.dead
		};
		return client;
	});
}

exports.pickFromArray = function(array){
	return array[exports.getRandomInt(0, array.length)];
}

exports.createMap = function(world, map){
	for (var i = 0; i < map.tiles.length; i++) {
		for (var j = 0; j < map.tiles[i].length; j++) {
			if(map.tiles[i][j] === 0){
				// Blank Tile
			} else if(map.tiles[i][j] === 1){
				// Wall
				var tileBody = new p2.Body({
					mass: 0,
					position: [j*32,i*32]
				});
				var boxShape = new p2.Box({
					width: 32,
					height: 32
				});
				tileBody.gametype = "wall";
				tileBody.addShape(boxShape);
				world.addBody(tileBody);
			} else if(map.tiles[i][j] === 2){
				// Spike
				var spikeBody = new p2.Body({
					mass: 0,
					position: [j*32,i*32]
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
					position: [j*32,i*32]
				});
				var circleShape = new p2.Circle({
					radius: 14
				});
				boostBody.gameid = j + i;
				boostBody.gametype = "boost";
				boostBody.addShape(circleShape);
				boostBody.shapes[0].sensor = true;
				world.addBody(boostBody);
			} else if(map.tiles[i][j] === 4){
				// Red Flag
				var flagBody = new p2.Body({
					mass: 0,
					position: [j*32,i*32]
				});
				var boxShape = new p2.Box({
					width: 32,
					height: 32
				});
				flagBody.gameid = j + i;
				flagBody.gametype = "redflag";
				flagBody.addShape(boxShape);
				flagBody.shapes[0].sensor = true;
				world.addBody(flagBody);
			} else if(map.tiles[i][j] === 5){
				// Blue Flag
				var flagBody = new p2.Body({
					mass: 0,
					position: [j*32,i*32]
				});
				var boxShape = new p2.Box({
					width: 32,
					height: 32
				});
				flagBody.gameid = j + i;
				flagBody.gametype = "blueflag";
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