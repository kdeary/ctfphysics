var p2 = require('p2');

exports.playersToPositions = function(players){
	return players.map(function(item, idx){
		var client = {
			x: item.core.position[0],
			y: item.core.position[1],
			name: item.name,
			tagged: item.game.tagged
		};
		return client;
	});
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
				tileBody.addShape(boxShape);
				world.addBody(tileBody);
			}
		}
	}
}

exports.playerToClient = function(player){
	var client = {x: player.core.position[0], y: player.core.position[1]};
	client.id = player.id;
	client.size = player.core.shapes[0].radius * 2;
	client.tagged = player.game.tagged;
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