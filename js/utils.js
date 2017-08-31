function attachUsername(sprite, name){
	var nameText = new PIXI.Text(name, new PIXI.TextStyle({
		fontFamily: 'Verdana',
		fontSize: 10
	}));
	sprite.addChild(nameText);
	nameText.y = -20;
	nameText.anchor.set(0.5);
	nameText.resolution = 100;
}

function escapeHTML(str){
	return str.replace("<", "	&#60;").replace(">", "	&#62;");
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