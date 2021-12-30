// https://github.com/Fl1pNatic/cc-gamemanager

//Create the GameManager object so I can put stuff in it
if(GameManager === undefined) var GameManager = {
	name: 'Game Manager',
	version: 1.001,
	gameVersion: Game.version
};
if(typeof CCSE == 'undefined') Game.LoadMod('https://klattmose.github.io/CookieClicker/CCSE.js');



/*-------------------------------------
INITIALIZATION
---------------------------------------*/

// Append stuff to menus
GameManager.launch = function(){
	Game.Notify(`Game Manager loaded!`,'',[32,0], true);
	isLoaded = 1;
	Game.customOptionsMenu.push(function(){
		CCSE.AppendCollapsibleOptionsMenu(GameManager.name, GameManager.optionsMenu());
	});
	Game.customStatsMenu.push(function(){
		CCSE.AppendStatsVersionNumber(GameManager.name, GameManager.version);
	});
}

// This waits before CCSE is initialized to then load the mod
if(!GameManager.isLoaded){
	if(CCSE && CCSE.isLoaded){
		GameManager.launch();
	}
	else{
		if(!CCSE) var CCSE = {};
		if(!CCSE.postLoadHooks) CCSE.postLoadHooks = [];
		CCSE.postLoadHooks.push(GameManager.launch);
	}
}

//This is basically the menu that shows up in options menu
GameManager.optionsMenu = function(){
	var str = '<div class="listing">' + 
		CCSE.MenuHelper.ActionButton("GameManager.restart();", 'Restart') + 
		CCSE.MenuHelper.ActionButton("GameManager.defVer();", 'Default version number') + 
		CCSE.MenuHelper.ActionButton("GameManager.unlockSteamAchievs();", '[Steam] Unlock Achievements') + 
		'<br><label>Made by flip#2454 with love <3</label></div>';
	return str;
}

/*-------------------------------------
FEATURES
---------------------------------------*/

GameManager.restart = function(){
	Game.Notify(`Restarting the game!`,'',[32,0], true);
	Game.toReload = true;
}

GameManager.defVer = function(){
	Game.Notify(`Restoring version number to default!`,'',[32,0], true);
	var verN = l('versionNumber');
	verN.innerHTML = 'v.' + Game.version;
}

GameManager.unlockSteamAchievs = function(){
	Game.Notify(`Unlocking Steam achievements!`,'',[32,0], true);
	Steam.allowSteamAchievs = true;
}