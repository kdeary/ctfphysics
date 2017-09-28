var mapSprite;

function attachUsername(sprite, name){
	var nameText = new PIXI.Text(name, new PIXI.TextStyle({
		fontFamily: 'Arial',
		fontSize: 14,
		fontWeight: 'bold',
		fill: '#ffffff',
		stroke: '#000',
		strokeThickness: 4,
	}));
	sprite.addChild(nameText);
	nameText.y = -10;
	nameText.anchor.set(0.5);
	nameText.resolution = 100;
}

function attachFlair(sprite, flairName){
	var newFlair = new Sprite(getFlairTexture(flairName));
	sprite.addChild(newFlair);
	newFlair.x = sprite.width / 4;
	newFlair.y = sprite.height / 4;
	newFlair.width = sprite.width / 2;
	newFlair.height = sprite.height / 2;
}

function attachFlag(sprite){
	var newFlag = new Sprite();
	sprite.addChild(newFlag);
	newFlag.x = sprite.width / 4;
	newFlag.y = -32;
	newFlag.width = settings.tileSize;
	newFlag.height = settings.tileSize;
}


function createMap(world, map){
	console.log(map);
	mapSprite = new Container();
	stage.addChild(mapSprite);
	for (var i = 0; i < map.tiles.length; i++) {
		for (var j = 0; j < map.tiles[i].length; j++) {
			if(map.tiles[i][j] === 0){
				// Blank Tile
			} else if(map.tiles[i][j] === 1){
				// Wall
				var boxTile = new Sprite.fromImage("assets/wall.png");
				mapSprite.addChild(boxTile);
				boxTile.x = j * settings.tileSize;
				boxTile.y = i * settings.tileSize;
				boxTile.width = settings.tileSize;
				boxTile.height = settings.tileSize;
				console.log(j * settings.tileSize, i * settings.tileSize);
			} else if(map.tiles[i][j] === 2){
				// Spike
				var boxTile = new Sprite.fromImage("assets/spike.png");
				mapSprite.addChild(boxTile);
				boxTile.x = j * settings.tileSize;
				boxTile.y = i * settings.tileSize;
				boxTile.width = settings.tileSize;
				boxTile.height = settings.tileSize;
				boxTile.gameid = i + j;
				console.log(j * settings.tileSize, i * settings.tileSize);
			} else if(map.tiles[i][j] === 3){
				// Boost
				var boxTile = new Sprite.fromImage("assets/boost.png");
				mapSprite.addChild(boxTile);
				boxTile.x = j * settings.tileSize;
				boxTile.y = i * settings.tileSize;
				boxTile.width = settings.tileSize;
				boxTile.height = settings.tileSize;
				boxTile.gameid = i + j;
				console.log(j * settings.tileSize, i * settings.tileSize);
				entities.boosts.push(boxTile);
			} else if(map.tiles[i][j] === 4){
				// Red Flag
				var boxTile = new Sprite.fromImage("assets/redflag.png");
				mapSprite.addChild(boxTile);
				boxTile.x = j * settings.tileSize;
				boxTile.y = i * settings.tileSize;
				boxTile.width = settings.tileSize;
				boxTile.height = settings.tileSize;
				boxTile.gameid = i + j;
				console.log(j * settings.tileSize, i * settings.tileSize);
				entities.flags.push(boxTile);
			} else if(map.tiles[i][j] === 5){
				// Blue Flag
				var boxTile = new Sprite.fromImage("assets/blueflag.png");
				mapSprite.addChild(boxTile);
				boxTile.x = j * settings.tileSize;
				boxTile.y = i * settings.tileSize;
				boxTile.width = settings.tileSize;
				boxTile.height = settings.tileSize;
				boxTile.gameid = i + j;
				console.log(j * settings.tileSize, i * settings.tileSize);
				entities.flags.push(boxTile);
			}
		}
	}
	gameLoop();
}

function getFlairTexture(flairName){
	var basetx = new PIXI.BaseTexture($("#flairs")[0]);
	var flairObject = customflairs.filter(function(item){return item.name === flairName})[0];
	return new PIXI.Texture(basetx, new PIXI.Rectangle(flairObject.crop[0],flairObject.crop[1],flairObject.crop[2],flairObject.crop[3]));
}

function escapeHTML(str){
	return str.replace("<", "&#60;").replace(">", "&#62;");
}

function replaceEmojis(str){
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

function loadProgressHandler(loader, resource) {
	console.log("loading: " + resource.url);
	console.log("progress: " + loader.progress + "%");
}

function allValuesSame(arr) {
	for(var i = 1; i < arr.length; i++){
		if(arr[i] !== true) return false;
	}
	return true;
}
