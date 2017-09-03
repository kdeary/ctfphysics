function attachUsername(sprite, name){
	var nameText = new PIXI.Text(name, new PIXI.TextStyle({
		fontFamily: 'Verdana',
		fontSize: 200
	}));
	sprite.addChild(nameText);
	nameText.y = -80;
	nameText.anchor.set(0.5);
	nameText.resolution = 100;
}

function attachFlair(sprite, flairName){
	var newFlair = new Sprite.fromImage("assets/hamburger.png");
	sprite.addChild(newFlair);
	var basetx = new PIXI.BaseTexture($("#flairs")[0]);
	var flairObject = customflairs.filter(function(item){return item.name === flairName})[0];
	var flairTexture = new PIXI.Texture(basetx, new PIXI.Rectangle(flairObject.crop[0],flairObject.crop[1],flairObject.crop[2],flairObject.crop[3]));
	newFlair.setTexture(flairTexture);
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