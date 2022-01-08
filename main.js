// https://github.com/Fl1pNatic/cc-gamemanager
// Feel free to suggest/improve/report bugs it will not be left uncredited(Unless I forget, then you can bug me about it for the rest of my life)

//Create the GameManager object so I can put stuff in it
if(GameManager === undefined) var GameManager = {}
	GameManager.name = 'Game Manager';
	GameManager.version = 1.011;
	GameManager.gameVersion = Game.version;
	GameManager.Steam = (typeof Steam !== 'undefined'); //klattmose made this
if(typeof CCSE == 'undefined') Game.LoadMod('https://klattmose.github.io/CookieClicker/CCSE.js'); //Loads CCSE, won't work on Steam, but will perfectly fit the web needs



/*-------------------------------------
INITIALIZATION
---------------------------------------*/

// Append stuff to menus
GameManager.launch = function(){
	
	if(GameManager.Steam) GameManager.Icon = CCSE.GetModPath('fl1pnatic gamemanager') + '/icon.png';
	else GameManager.Icon = 'https://fl1pnatic.github.io/cc-gamemanager/icon.png';
	Game.Notify("Game Manager is loaded!",'',[0,0, GameManager.Icon], true);
	
	isLoaded = 1;
	Game.customOptionsMenu.push(function(){
		CCSE.AppendCollapsibleOptionsMenu(GameManager.name, GameManager.optionsMenu());
		CCSE.AppendCollapsibleOptionsMenu("Game Manager - Experimental", GameManager.exOptionsMenu());
	});
	Game.customStatsMenu.push(function(){
		CCSE.AppendStatsVersionNumber(GameManager.name, GameManager.version);
	});
	Game.customInfoMenu.push(function(){
		CCSE.PrependCollapsibleInfoMenu(GameManager.name, GameManager.changelog);
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
		CCSE.MenuHelper.ActionButton("GameManager.defVer();", 'Default version') + `<label>(Restores version number in bottom left to it's 'pre-CCSE' state)</label><br>` +
		CCSE.MenuHelper.ActionButton("GameManager.cheatedCookiesUnlock();", '"Cheated cookies taste awful"') + `<label>(Unlocks "Cheated cookies taste awful" achievement without making you dirty)</label><br>` +
		
		'<br><label>Steam only features</label><br>' + 
		
		CCSE.MenuHelper.ActionButton("GameManager.restart();", 'Restart') + `<label>(Restarts the game, saving your progress before doing so)</label><br>` +
		CCSE.MenuHelper.ActionButton("GameManager.unlockSteamAchievs();", 'Unlock Achievements') + `<label>(Unlocks ability to get Steam Achievements)</label>` +
		'<br><label>Made by flip#2454 with love <3</label></div>';
	return str;
}


/*-------------------------------------
FEATURES
---------------------------------------*/

GameManager.restart = function(){
	Game.Notify(`Restarting the game!`,'',[0,0, GameManager.Icon], true); //For people interested: Game.Notify(title,desc,pic,quick,noLog) quick = Notification disappears automatically after around a second. noLog = Doesn't display in console
	Game.toSave = true;
	Game.toReload = true; //Turns out CC actually saves the game before reloading, it was an oopsie on my side. But now it's fixed
}

GameManager.defVer = function(){
	Game.Notify(`Restoring version number to default!`,'',[0,0, GameManager.Icon], true);
	var verN = l('versionNumber');
	verN.innerHTML = 'v.' + Game.version;
}

GameManager.unlockSteamAchievs = function(){
	Game.Notify(`Unlocking Steam achievements!`,'',[0,0, GameManager.Icon], true);
	Steam.allowSteamAchievs = true;
}

GameManager.cheatedCookiesUnlock = function(){
	Game.Notify(`Unlocking "Cheated cookies taste awful"!`,'',[0,0, GameManager.Icon], true);
	Game.Win('Cheated cookies taste awful');
}

/*-------------------------------------
EXPERIMENTAL FEATURES
---------------------------------------*/

GameManager.exOptionsMenu = function(){ //I just create the second options menu that I load like I did with the main one
	var str = '<div class="listing">' + 
		CCSE.MenuHelper.InputBox("achievName", 250, "", ) + 
		//Sincerely sorry for this awkward InputBox, that resets every 5 seconds. 
		//I think it's CCSE to blame, because it might load the GameManager.launch function every 5 second, which causes the menus to reload
		CCSE.MenuHelper.ActionButton("GameManager.unlockAchiev();", 'Unlock Achievement') + `<label>(Unlocks any achievement, name of which you enter. Textbox is getting reset every 5 second is cause of a bug. WARNING: NAMES ARE CASE-SENSITIVE)</label></div>`;
	return str;
}

//What this does is basically grab the value of InputBox with an ID of "achievName" (see ln 94). And puts it in the Game.Win function. 
//Unlike manually setting the value of an achievement array, if this achievement doesn't exist/was typed incorrectly - It won't get unlocked

//Fun fact: This feature almost made me lose my entire save file, but super luckily, I backed it up just one reload before
GameManager.unlockAchiev = function(){
	Game.Notify(`Unlocking "${achievName.value}" achievement!`,'',[0,0, GameManager.Icon], true);
	Game.Win(achievName.value);
}

/*-------------------------------------
ChangeLog
---------------------------------------*/
//Fun fact: I actually don't know the chronology of the mod, let's suppose it is how it is here
GameManager.changelog = '<div class="subsection"><div class="listing">Game Manager is a mod to control the game you are playing.</div>' + 
	'<div class="subsection"><div class="listing">In development since December 2021.</div>' +
	'<div class="subsection"><div class="listing">Made by Fl1pNatic(<a href="https://steamcommunity.com/id/fl1pnatic" target="_blank">Steam</a>, <a href="https://github.com/fl1pnatic target="_blank">GitHub</a>)</div>' +
	'<div class="subsection"><div class="listing">Report any bugs and make suggestions either on the workshop page or on the <a href="https://github.com/fl1pnatic/cc-gamemanager/issues">GitHub Repo</a>.</div>' +
	
	'<div class="subsection"><div class="title">Game Manager ChangeLog</div>' +
	
	'</div><div class="subsection update"><div class="title">08/01/2022</div>' + 
	'<div class="subsection"><div class="listing">This update got pretty big, compared to other small ones. I surpassed my own expectations, and I think, I can do even better at some point.</div>' +
	'</div><div class="listing">&bull; Added ability to unlock the "Cheated cookies taste awful" achievement</div>' +
	'</div><div class="listing">&bull; Added changelog in the "Info" tab</div>' +
	'</div><div class="listing">&bull; Game is now saved before getting reloaded. So, that after reload you are immediately at where you left it before.</div>' +
	'</div><div class="listing">&bull; Added an explanation label to every feature.</div>' +
	`</div><div class="listing">&bull; Changed feature buttons' names to be more interesting, because now there are explanation labels.</div>` +
	`</div><div class="listing warning" style="font-weight:bold">&bull; Added experimental features tab. Features in there are unstable.</div>` +
	`</div><div class="listing">&bull; EXPERIMENTAL: Added an ability to unlock any achievement in the game by typing in it's name.</div>` +
	
	'</div><div class="subsection update small"><div class="title">30/12/2021</div>' + 
	'</div><div class="listing">&bull; Sorted features to "Steam only" and "Not Steam only".</div>' +
	'</div><div class="listing">&bull; Released Game Manager for use on the web version of Cookie Clicker. <a href="http://fl1pnatic.github.com/cc-gamemanager" target="_blank">Link</a></div>' +
	
	'</div><div class="subsection update"><div class="title">29/12/2021 - initial release</div>' +
	'</div><div class="listing">&bull; Added an ability to restart the game, because I was tired of constantly having to turn one mod on and off just to restart."</div>' +
	'</div><div class="listing">&bull; Added and ability to change the version number in left bottom corner to look vanilla, because I was tired of CCSE changing it.</div>'
	;
	
	
	
	