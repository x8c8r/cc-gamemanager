// https://github.com/Fl1pNatic/cc-gamemanager
// Feel free to suggest/improve/report bugs it will not be left uncredited(Unless I forget, then you can bug me about it for the rest of my life)

//Create the GameManager object so I can put stuff in it
if(GameManager === undefined) var GameManager = {}
	GameManager.name = 'Game Manager';
	GameManager.version = 1.014;
	GameManager.gameVersion = Game.version;
	GameManager.Steam = (typeof Steam !== 'undefined'); //klattmose made this
if(typeof CCSE == 'undefined' && !GameManager.Steam) Game.LoadMod('https://klattmose.github.io/CookieClicker/CCSE.js'); //Loads CCSE, won't work on Steam, but will perfectly fit the web needs

var exU = false; //Checks if experimental menu has already been pushed
/*-------------------------------------
INITIALIZATION
---------------------------------------*/

// Append stuff to menus
GameManager.launch = function(){
	
	if(GameManager.Steam) GameManager.Icon = CCSE.GetModPath('fl1pnatic gamemanager') + '/icon.png';
	else GameManager.Icon = 'https://fl1pnatic.github.io/cc-gamemanager/icon.png';
	Game.Notify("Game Manager is loaded!",'',[0,0, GameManager.Icon], true);
	
	Game.customOptionsMenu.push(function(){
		CCSE.AppendCollapsibleOptionsMenu(GameManager.name, GameManager.optionsMenu());
	});
	Game.customStatsMenu.push(function(){
		CCSE.AppendStatsVersionNumber(GameManager.name, GameManager.version);
		CCSE.AppendStatsGeneral(GameManager.additionalStatsMenu());
	});
	Game.customInfoMenu.push(function(){
		CCSE.PrependCollapsibleInfoMenu(GameManager.name, GameManager.changelog());
	});					
	
	
	isLoaded = 1;
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
/*-------------------------------------
MENUS
---------------------------------------*/
GameManager.optionsMenu = function(){
	var str = '<div class="listing">' + 
		CCSE.MenuHelper.ActionButton("GameManager.defVer();", 'Default version') + `<label>(Restores version number in bottom left to it's 'pre-CCSE' state)</label><br>` +		
		CCSE.MenuHelper.ActionButton("GameManager.timeOut();", 'Sleep') + `<label>(Puts your game on the pause screen, as if "Sleep mode timeout" option was on)</label><br>` +
		CCSE.MenuHelper.ActionButton("GameManager.cheatedCookiesUnlock();", '"Cheated cookies taste awful"') + `<label>(Unlocks "Cheated cookies taste awful" achievement without making you dirty)</label>` +
		
	// Steam only features get checked for Steam
		(GameManager.Steam? CCSE.MenuHelper.ActionButton("GameManager.restart();", 'Restart') + `<label>(Restarts the game, saving your progress before doing so)</label><br>` : '') +
		(GameManager.Steam? CCSE.MenuHelper.ActionButton("GameManager.unlockSteamAchievs();", 'Unlock Achievements') + `<label>(Unlocks ability to get Steam Achievements)</label>` : '') +

		'<br><br><label>Misc</label><br><br>' + 

		CCSE.MenuHelper.ActionButton("GameManager.turnOnEx();", 'Unlock Experimental') + `<label>(Unlocks access to Experimental features of the mod)</label><br>` +

		'<br><label>Made by flip#2454 with love <3</label></div>';
	return str;
}


GameManager.exOptionsMenu = function(){
	var str = '<div class="listing">' + 
		'<div class="listing warning" style="text-align:center;">Features that are present in this category should not be expected to be stable or complete. Proceed with caution, and if you can - Leave feedback.</div>' +
		CCSE.MenuHelper.InputBox("achievName", 250, "", ) + 
		CCSE.MenuHelper.ActionButton("GameManager.unlockAchiev();", 'Unlock Achievement') + `<br><label>(Unlocks any achievement, name of which you enter. Textbox is getting reset every 5 second is cause of a bug. WARNING: NAMES ARE CASE-SENSITIVE)</label><br>` +
		(GameManager.Steam? CCSE.MenuHelper.ActionButton("GameManager.webify();", 'Webify') + '<label>(Brings back Web-Only features like the top bar)</label><br>' : '') +
		CCSE.MenuHelper.InputBox("gameSeed", 250, Game.seed, ) + 
		CCSE.MenuHelper.ActionButton("GameManager.changeSeed();", 'Change Seed') + `<br><label>(Each run has it's unique seed that is 5 characters long and only consists of small English letters. The seed is primarly used in events that require a random element. E.g Determining Sugar Lump type.)` +
		`</div>`;
	return str;
}

GameManager.additionalStatsMenu = function(){
	var str = `<div class="listing>` +
	'<div class="subsection">'+
	'<div class="title">Additional Stats</div>' + 
	`<div class="listing"><b>Missed golden cookies: </b>`+ Beautify(Game.missedGoldenClicks) + `</div>` +
	`<div class="listing"><b>Seed: </b>`+ Game.seed + `</div>` +
	`</div>`;
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

GameManager.timeOut = function(){
	Game.Notify(`Timing out the game!`,'',[0,0, GameManager.Icon], true);
	Game.Timeout();
}

GameManager.turnOnEx = function(){
	Game.Notify(`Unlocking Experimental Features!`,'',[0,0, GameManager.Icon], true);
	if(!exU){
		exU = true;
		Game.customOptionsMenu.push(function(){
			CCSE.AppendCollapsibleOptionsMenu("Game Manager - Experimental", GameManager.exOptionsMenu());
		});
	}
}

/*-------------------------------------
EXPERIMENTAL FEATURES
---------------------------------------*/
//What this does is basically grab the value of InputBox with an ID of "achievName" (see ln 76). And puts it in the Game.Win function. 
//Unlike manually setting the value of an achievement array, if this achievement doesn't exist/was typed incorrectly - It won't get unlocked

//Fun fact: This feature almost made me lose my entire save file, but super luckily, I backed it up just one reload before
		//It's CC's fault, it's calling UpdateMenu() every 5 seconds
GameManager.unlockAchiev = function(){
	Game.Notify(`Unlocking "${achievName.value}" achievement!`,'',[0,0, GameManager.Icon], true);
	Game.Win(achievName.value);
}

GameManager.webify = function(){
	Game.Notify(`Bringing back the Web features!`,'',[0,0, GameManager.Icon], true);
	Game.wrapper.classList.remove('offWeb'); 
	Game.wrapper.classList.add('onWeb');
}

// I DIDN'T EVEN KNOW THIS THING EXISTED
GameManager.changeSeed = function(){
	Game.Notify(`Changing the Game Seed from "${Game.seed}" to "${gameSeed.value}"!`,'',[0,0,GameManager.Icon], true);
	Game.seed = gameSeed.value;
}
/*-------------------------------------
ChangeLog
---------------------------------------*/
//Fun fact: I actually don't know the chronology of the mod, let's suppose it is how it is here
GameManager.changelog = function(){
	var str=`<div class="subsection"><div class="listing">Game Manager is a mod to control the game you are playing.</div>` + 
	`<div class="subsection"><div class="listing">In development since December 2021.</div>` +
	`<div class="subsection"><div class="listing">Made by Fl1pNatic(<a href="https://steamcommunity.com/id/fl1pnatic" target="_blank">Steam</a>, <a href="https://github.com/fl1pnatic target="_blank">GitHub</a>)</div>` +
	`<div class="subsection"><div class="listing">Report any bugs and make suggestions either on the workshop page or on the <a href="https://github.com/fl1pnatic/cc-gamemanager/issues">GitHub Repo</a>.</div>` +
	
	`<div class="subsection"><div class="title">Game Manager ChangeLog</div>` +

	`</div></div class="subsection update small><div class="title>11/01/2022</div>` +
	`</div><div class="listing">&bull; Added some additional statistics in the "Stats" menu.</div>` +
	`</div><div class="listing">&bull; Fixed a bug where if you click "Unlock Experimental" button several times, it will open several tabs.</div>` +

	`</div><div class="subsection update small"><div class="title">10/01/2022</div>` + 
	`</div><div class="listing">&bull; Added a disclaimer to the Experimental tab.</div>` +
	`</div><div class="listing">&bull; Experimental tab now only opens if you wish for it.</div>` +
	`</div><div class="listing">&bull; Sent a PR to klattmose so CCSE buttons will look constistent to vanilla game ones. Idk why I am writing this here, but no one reads this anyways, might as well share some personal experience.</div>` +
	`</div><div class="listing">&bull; EXPERIMENTAL: Added a "Webification" feature, which basically makes Steam version of the game look like it used to on Web. Currently only restores the topbar.</div>` +
	`</div><div class="listing">&bull; EXPERIMENTAL: Added a feature to change your seed. More info is in the explanation label.</div>` +
	
	`</div><div class="subsection update small"><div class="title">09/01/2022</div>` + 
	`</div><div class="listing">&bull; Added an ability to put the game to sleep, as if "Sleep mode timeout" was on.</div>` +
	`</div><div class="listing">&bull; Made a custom icon, in place of just using a JSC one.` + 
	`</div><div class="listing" style="> Somehow broke my game so it doesn't reload anymore</div>` +
	
	`</div><div class="subsection update"><div class="title">08/01/2022</div>` + 
	`<div class="subsection"><div class="listing">This update got pretty big, compared to other small ones. I surpassed my own expectations, and I think, I can do even better at some point.</div>` +
	`</div><div class="listing">&bull; Added an ability to unlock the "Cheated cookies taste awful" achievement</div>` +
	`</div><div class="listing">&bull; Added changelog in the "Info" tab</div>` +
	`</div><div class="listing">&bull; Game is now saved before getting reloaded. So, that after reload you are immediately at where you left it before.</div>` +
	`</div><div class="listing">&bull; Added an explanation label to every feature.</div>` +
	`</div><div class="listing">&bull; Changed feature buttons' names to be more interesting, because now there are explanation labels.</div>` +
	`</div><div class="listing warning" style="font-weight:bold">&bull; Added experimental features tab. Features in there are unstable.</div>` +
	`</div><div class="listing">&bull; EXPERIMENTAL: Added an ability to unlock any achievement in the game by typing in it's name.</div>` +
	
	`</div><div class="subsection update small"><div class="title">30/12/2021</div>` + 
	`</div><div class="listing">&bull; Sorted features to "Steam only" and "Not Steam only".</div>` +
	`</div><div class="listing">&bull; Released Game Manager for use on the web version of Cookie Clicker. <a href="http://fl1pnatic.github.com/cc-gamemanager" target="_blank">Link</a></div>` +
	
	`</div><div class="subsection update"><div class="title">29/12/2021 - initial release</div>` +
	`</div><div class="listing">&bull; Added an ability to restart the game, because I was tired of constantly having to turn one mod on and off just to restart."</div>` +
	`</div><div class="listing">&bull; Added and ability to change the version number in left bottom corner to look vanilla, because I was tired of CCSE changing it.</div>`
	;
	return str;
}
	
	
	