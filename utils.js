exports.playersToPositions = function(players){
	return players.map(function(item, idx){
		var client = {x: item.core.state.pos._[0], y: item.core.state.pos._[1]};
		client.name = item.name;
		return client;
	});
}

exports.playerToClient = function(player){
	var client = player.core.state.pos;
	client.id = player.id;
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