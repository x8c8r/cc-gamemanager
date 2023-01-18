let GameManager = {
    name: 'Game Manager',
    id: 'x8c8r.gameManager',
    version: 2.010,
    gameVersion: Game.gameVersion,
    steam: typeof (Steam) !== 'undefined',
    config: {},
}
let GMConfig = {
    defValues: {
        webify: false,
        showNotis: true,
        additionalStats: true,
    },
    values: {},
}
GMConfig.values = GMConfig.defValues;

GMConfig.reset = () => GMConfig.values = GMConfig.defValues;
GMConfig.update = () => {
    GameManager.features.webify(true);
}
// Fill the config with missing values
GMConfig.fill = () => {
    for (let value in GMConfig.defValues) {
        if (value in GMConfig.values !== true) {
            GMConfig.values[value] = GMConfig.defValues[value];
        }
    }
}

GameManager.wrappers = {
    notify: (title, desc, icon, quick) => {
        if (!GMConfig.values.showNotis) return;
        Game.Notify(title, desc, icon, quick);
    }
}

/*
    I am going to admit I used a lot of CCSE code as reference here, but only for the singular purpose of not having to rely on CCSE for code injection and menus
    which are the only things I really need. I just hope no one will be angry with me for this...
    So huge thank you to Klattmose, original code - https://github.com/klattmose/klattmose.github.io/blob/master/CookieClicker/CCSE.js 
*/
// Menu Helpers
GameManager.menu = {
    appendOptionsMenu: function (title, body) {
        let titleDiv = document.createElement('div');
        titleDiv.className = title;
        titleDiv.textContent = title;
        titleDiv.classList = ["title"];

        // This is needed so everything is styled properly
        let container = document.createElement('div');
        container.classList = ["subsection"];

        let bodyDiv;
        if (typeof (body == 'string')) {
            bodyDiv = document.createElement('div');
            bodyDiv.innerHTML = body;
        }
        else {
            bodyDiv = body;
        }

        let toShow = true;

        container.appendChild(titleDiv);
        if (toShow) container.appendChild(bodyDiv);

        let div = document.createElement('div');
        div.appendChild(container);
        div.classList = ["block"];
        div.style = "padding:0px;margin:8px 4px;";

        let menu = l("menu");
        if (!menu) return;
        let padding = menu.childNodes;
        padding = padding[padding.length - 1];

        if (padding) {
            menu.insertBefore(div, padding);
        }
        else {
            menu.appendChild(div);
        }
    },

    appendGenStats: function (body) {
        let div;
        if (typeof (body) == 'string') {
            div = document.createElement('div');
            div.innerHTML = body;
        }
        else {
            div = body;
        }

        let genStats = l('statsGeneral');
        if (genStats) genStats.appendChild(div);
    },

    prependInfoMenu: function (title, body) {
        let titleDiv = document.createElement('div');
        titleDiv.className = title;
        titleDiv.textContent = title;
        titleDiv.classList = ["title"];

        // This is needed so the title is styled properly
        let titleContainer = document.createElement('div');
        titleContainer.classList = ["subsection"];
        titleContainer.appendChild(titleDiv);

        let bodyDiv = document.createElement('div');
        if (typeof (body === 'string')) {
            bodyDiv.innerHTML = body;
        }
        else {
            bodyDiv.innerHTML = body.innerHTML;
        }

        let div = document.createElement('div');
        div.appendChild(titleContainer);
        div.appendChild(bodyDiv);

        let menu = l('menu');
        if (!menu) return;
        let about = menu.getElementsByClassName('subsection')[0];
        if (!about) return;
        about.parentNode.insertBefore(div, about);
    },

    appendInfoMenu: function (title, body) {
        let titleDiv = document.createElement('div');
        titleDiv.className = title;
        titleDiv.textContent = title;
        titleDiv.classList = ["title"];

        // This is needed so the title is styled properly
        let titleContainer = document.createElement('div');
        titleContainer.classList = ["subsection"];
        titleContainer.appendChild(titleDiv);

        let bodyDiv;
        if (typeof (body === 'string')) {
            bodyDiv = document.createElement('div');
            bodyDiv.innerHTML = body;
        }
        else {
            bodyDiv = body;
        }

        let div = document.createElement('div');
        div.appendChild(titleContainer);
        div.appendChild(bodyDiv);
        menu.appendChild(div);
    },
}

// Designs
GameManager.menuElements = {
    Button: (func, text) =>
        '<a class="smallFancyButton option"' + `${Game.clickStr}="${func} PlaySound('snd/tick.mp3');">${text}</a>`,
}

// Code Injection
GameManager.code = {
    injectCode: function (functionName, alteration) {
        let og = eval(functionName);
        if (og === null) {
            console.error(`"${functionName}" is not found`);
        }
        if (typeof (og) !== "function") {
            console.error(`"${functionName}" is not a function`)
        }
        eval(functionName + "=" + alteration(og.toString()));
    },

    injectFunctionCode: function (functionName, targetString, code, mode) {
        let alteration = (func) => {
            switch (mode) {
                case -1: // Prepend
                    return func.replace(targetString, code + "\n" + targetString);
                case 0: // Replace
                    return func.replace(targetString, code);
                case 1: // Append
                    return func.replace(targetString, targetString + "\n" + code);
                default:
                    console.error("Invalid Mode");
            }
        }
        GameManager.code.injectCode(functionName, alteration, code);
    },

    // Completely swaps all the code in a function
    replaceFunction: function (functionName, code, args) {
        if (args === undefined) args = "";
        let alteration = (func) => {
            return `function(${args.toString()}) { ${code} }`;
        }
        GameManager.code.injectCode(functionName, alteration, code);
    },

    // Convert function to a string, to be used in injections/prompts
    functionToString: function (functionName, args) {
        if (args === undefined) args = "";

        return`(${String(functionName)})(${args.toString()});`;
    },
}

// Menus
GameManager.menus = {
    optionsMenu: () => {
        let str =
        '<div class="listing">'+

        '<div class="subsection">Convenience</div>'+
        GameManager.menuElements.Button("GameManager.features.restart();", "Reload")+'<label>Reloads the game</label>'+'<br>'+
        (GameManager.steam ? (GameManager.menuElements.Button("GameManager.features.unlockSteamAchievs();", "Unlock Steam Achievements")+'<label>Allows Steam achievements to be unlocked</label>'+'<br>'):'')+
        GameManager.menuElements.Button("GameManager.features.openSesame();", "Open Sesame")+'<label>Opens Sesame</label>'+'<br>'+
        GameManager.menuElements.Button("GameManager.features.sleep();", "Sleep")+'<label>Puts your game in sleep mode</label>'+'<br>'+
        GameManager.menuElements.Button("GameManager.features.updateMenu();", "Update Menus")+'<label>Forces the game to update menus</label>'+'<br>'+

        '<br>'+

        '<div class="subsection">Hacks</div>'+
        GameManager.menuElements.Button("GameManager.features.cheatedCookiesUnlock();", "Cheat (0) cookies")+'<label>Unlocks "Cheated cookies taste awful" achievement</label>'+'<br>'+
        GameManager.menuElements.Button("GameManager.features.thirdParty();", "Join Third-Party")+'<label>Unlocks "Third-party" achievement</label>'+'<br>'+
        GameManager.menuElements.Button("GameManager.features.toggleAchiev(true);", "Unlock Achievement")+'<label>UNLOCK any achievement (as long as you type it right)</label>'+'<br>'+
        GameManager.menuElements.Button("GameManager.features.toggleAchiev(false);", "Lock Achievement")+'<label>LOCK ANY achievement (as long as you type it right)</label>'+'<br>'+
        GameManager.menuElements.Button("GameManager.features.changeSeed();", "Change Seed")+'<label>Changes your seed (more info in the prompt)</label>'+'<br>'+
        
        '<br>'+
        
        '<div class="subsection">Fun/Cosmetic</div>'+
        GameManager.menuElements.Button("GameManager.features.webify(false);", "Webification: "+(GMConfig.values.webify?"On":"Off"))+'<label>Toggle the web version stuff</label>'+'<br>'+
        GameManager.menuElements.Button("GameManager.features.toggleAdditionalStats(false);", "Additional statistics: "+(GMConfig.values.additionalStats?"On":"Off"))+'<label>Toggles additional statistics in the info menu</label>'+'<br>'+
                
        '<br>'+
        
        '<div class="subsection">Mod Options</div>'+
        GameManager.menuElements.Button("GameManager.features.toggleNotis();", "Show Notifications: "+(GMConfig.values.showNotis?"On":"Off"))+'<label>Toggle notifications in bottom of the screen on using a mod feature</label>'+'<br>'+
        GameManager.menuElements.Button("GameManager.features.editConf();", "Edit Config")+'<label>Directly edit your Game Manager config</label>'+'<br>'+
                
        '<br>'+
        
        '<label>Made by x8c8r with love <3</label>'+
        '</div>'
        return str;
    },

    additionalStats: () => {
        let str = GMConfig.values.additionalStats?
            '<div class="subsection">'+
            '<div class="title">Additional</div>'+
            '<div class="listing"><b>Missed golden cookies: </b>'+ Beautify(Game.missedGoldenClicks) +'</div>'+
            '<div class="listing"><b>Seed: </b>' + Game.seed +'</div>'+
            '</div>'
            :'';
        return str;
    },

    buildInfo: () => {
        GameManager.changelog = document.createElement('div');

        let infoContainer = document.createElement("div");
        infoContainer.classList.add("subsection");

        let modInfo = document.createElement('div');
        modInfo.classList.add("subsection");
        modInfo.innerHTML = '<div class="listing">Game Manager is a mod to control the game you are playing. Think of it as a kind of a swiss knife for both modmakers and players. <br><br>' +
        'In development since December 2021. <br><br>' +
        'Made by x8c8r <br>'+
        '<a href="https://steamcommunity.com/id/x8c8r" target="_blank">Steam</a>, <a href="https://github.com/x8c8r" target="_blank">GitHub</a> <br><br>'+
        'Report any bugs and make suggestions either on the workshop page or on the <a href="https://github.com/x8c8r/cc-gamemanager/issues">GitHub Repo</a>. </div> <br>'
        
        infoContainer.appendChild(modInfo);

        let changelog = document.createElement('div');
        changelog.classList.add("subsection");

        let updateLog = 
        '<div class="subsection"><div class="title">Game Manager Version history</div>'+

        '<div class="subsection update small">'+
        '<div class="title">18/01/2023 - patch 5</div>'+
        '<div class="listing">&bull; Added a feature to lock any achievement</div>'+
        (!GameManager.steam?'<div class="listing">&bull; The menu now correctly deals with Steam-only features on web.</div>':'')+
        '</div>'+

        '<div class="subsection update">' +
        '<div class="title">17/01/2023 - the exhausted update (v2.01)</div>'+
        '<div class="listing">Sorry, this update took way too much time than it should have. I am really tired as of writing this changelog. I have tried doing a lot of things for this update and only some worked out.</div>'+
        '<div class="listing">&bull; Slightly changed the way changelog works. (I cut out all previous patches, sorry)</div>'+
        '<div class="listing">&bull; Added changing the seed</div>'+
        '<div class="listing">&bull; Sorted features by categories, and improved some of the names and labels</div>'+
        '<div class="listing">&bull; Made additional stats toggleable</div>'+
        '<div class="listing">&bull; Replaced all let\'s with var\'s in the code</div>'+
        '<div class="listing">&bull; To prevent errors, config now can regenerate lost keys that were either added in a new update/were removed by the user</div>'+
        '<div class="listing">&bull; And to compliment previous change: Config editor! You can find it at the bottom of GM\'s options menu</div>'+
        '</div>'+
        
        '<div class="subsection update small">'+
        '<div class="title">11/01/2023 - patch 3</div>'+
        '<div class="listing">&bull; Achievement-related features now display more info in various cases, to avoid confusion</div>'+
        '<div class="listing">&bull; Added ability to unlock any achievement by it\'s name</div>'+
        '</div>'+

        '<div class="subsection update">'+
        '<div class="title">03/01/2022 - evolution update (v2.0)</div>'+
        '<div class="listing">First update of 2023 and you bet it\'s a big one...</div>'+
        '<div class="listing" style=";color:green;">&bull; Complete rewrite, and no more CCSE dependency... at all.</div>'+
        '<div class="listing">&bull; New config system</div>'+
        '</div>'+

        '<div class="subsection update">'+
        '<div class="title">29/12/2021 - initial release</div>'+
        '<div class="listing">&bull; Added restart button to easily restart the game.</div>'+
        '</div>'+

        '</div>';

        changelog.innerHTML = updateLog;

        infoContainer.appendChild(changelog);
        GameManager.changelog.appendChild(infoContainer);
        
    },

    infoMenu: () => {
        return GameManager.changelog;
    }

}

// Features
GameManager.features = {
    webify: function (update = false) {
        if (!update) {
            GameManager.wrappers.notify(`Toggling the Web features!`, '', [0, 0, GameManager.icon], true);
            GMConfig.values.webify = !GMConfig.values.webify;
        }
        if (GMConfig.values.webify) {
            Game.wrapper.classList.remove('offWeb');
            Game.wrapper.classList.add('onWeb');
        }
        else {
            Game.wrapper.classList.add('offWeb');
            Game.wrapper.classList.remove('onWeb');
        }
        Game.UpdateMenu();
    },

    toggleAdditionalStats: function () {
        GMConfig.values.additionalStats = !GMConfig.values.additionalStats;
        GameManager.wrappers.notify(`Toggling additional stats!`, '', [0, 0, GameManager.icon], true);
        Game.UpdateMenu();
    },

    toggleNotis: function () {
        GMConfig.values.showNotis = !GMConfig.values.showNotis;
        Game.Notify('Notifications: '+(GMConfig.values.showNotis?"On":"Off"), '', [0, 0, GameManager.icon], true); // I need to directly notify
        Game.UpdateMenu();
    },

    restart: function () {
        GameManager.wrappers.notify(`Restarting the game!`, ``, [0, 0, GameManager.icon], true, false); //For people interested: Game.Notify(title,desc,pic,quick,noLog) quick = Notification disappears automatically after around a second. noLog = Doesn't display in console
        Game.toSave = true;
        Game.toReload = true; //Turns out CC actually saves the game before reloading, it was an oopsie on my side. But now it's fixed
    },

    sleep: function () {
        GameManager.wrappers.notify(`Timing out the game!`, '', [0, 0, GameManager.icon], true);
        Game.toSave = true;
        Game.Timeout();
    },

    cheatedCookiesUnlock: function () {
        if (!Game.Achievements['Cheated cookies taste awful'].won) {
            GameManager.wrappers.notify(`Unlocking "Cheated cookies taste awful"!`, '', [0, 0, GameManager.icon], true);
            Game.Win('Cheated cookies taste awful');
        }
        else {
            GameManager.wrappers.notify(`"Cheated cookies taste awful" is already unlocked!`, '', [0, 0, GameManager.icon], true);
        }
    },

    thirdParty: function () {
        if (!Game.Achievements['Third-party'].won) {
            GameManager.wrappers.notify(`Unlocking "Third-party"!`, '', [0, 0, GameManager.icon], true);
            Game.Win('Third-party')
        }
        else {
            GameManager.wrappers.notify(`"Third-party" is already unlocked!`, '', [0, 0, GameManager.icon], true);
        }
    },

    unlockSteamAchievs: function () {
        if (!Steam.allowSteamAchievs) {
            GameManager.wrappers.notify(`Enabling Steam achievements!`, '', [0, 0, GameManager.icon], true);
            Steam.allowSteamAchievs = true;
        }
        else {
            GameManager.wrappers.notify(`Steam achievements were already enabled!`, '', [0, 0, GameManager.icon], true);
        }
    },

    openSesame: function () {
        GameManager.wrappers.notify(`Opening the sesame!`, 'Open Sesame!', [0, 0, GameManager.icon], true);
        Game.OpenSesame();
    },

    updateMenu: function (loop = false) {
        GameManager.wrappers.notify(`Forcing the game to update menus!`, '', [0, 0, GameManager.icon], true);
        Game.UpdateMenu();
    },

    toggleAchiev: function (mode) {
        const uA = function (mode) {
            let ac = l('achName').value;

            if (!ac.length > 0) return;

            if (!Game.Achievements[ac]) {
                GameManager.wrappers.notify('Achievement "'+ac+'" does not exist!', '', [0, 0, GameManager.icon], true);
                return;
            }

            if (mode) {
                if (Game.Achievements[ac].won) {
                    GameManager.wrappers.notify('Achievement "'+ac+'" was already unlocked!', '', [0, 0, GameManager.icon], true);
                    return;
                }

                GameManager.wrappers.notify('Unlocking achievement "'+ac+'"!', '', [0, 0, GameManager.icon], true);
                Game.Win(ac);
            }
            else {
                if (!Game.Achievements[ac].won) {
                    GameManager.wrappers.notify('Achievement "'+ac+'" was already locked!', '', [0, 0, GameManager.icon], true);                    
                }
                GameManager.wrappers.notify('Locking achievement "'+ac+'"!', '', [0, 0, GameManager.icon], true);
                Game.Achievements[ac].won = 0;
            }
        }
        Game.Prompt('<h3>'+(mode?'Unlock':'Lock')+' Achievement</h3>'+
        '<div class="block">Enter name of the achievement (Case Sensitive):<br><br>'+
		'<input type="text" class="option" id="achName"></input></div>',
        [[mode?'Unlock':'Lock', GameManager.code.functionToString(uA, [mode])], 'Cancel']);
        l('achName').focus();
    },

    changeSeed: function () {
        const cS = () => {
            let seed = l('seedInput').value;

            if (!seed.length > 0) return;

            GameManager.wrappers.notify('Changing seed to: ' + seed, '', [0, 0, GameManager.icon], true);
            Game.seed = seed;
        };

        Game.Prompt('<h3>Change seed</h3><div class="block">A "seed" is a unique combination of letters that determines random events during your playthrough, it doesn\'t get reset on ascensions</div>'+
        '<div class="block">Enter new seed:<br><br>'+
        '<input type="text" class="option" id="seedInput"></input>'+
        '</div>', [["Change", GameManager.code.functionToString(cS)], "Cancel"]);
    },

    editConf: function () {
        const confSave = () => {
            GMConfig.values = JSON.parse(confEdit.value);
            GMConfig.fill();
            confEdit.value = JSON.stringify(GMConfig.values)
        }

        const confInfo = `<h2>Config values:</h2><div class="block" style="overflowY:scroll;width:90%;height:70px">
            webify - Whether "Webify" is turned on or off <br>
            showNotis - Whether to show notifications on actions <br>
        </div>`;

        let confReset = () => GMConfig.reset();
        Game.Prompt(`<h3>Config</h3>)<input type="text" class="option" id="confEdit" style="height:50px;width:90%;"value=${ JSON.stringify(GMConfig.values)}></input> <br><br> ${confInfo}<br> </div>`, [['Save', GameManager.code.functionToString(confSave)], ['Reset to default', GameManager.code.functionToString(confReset)], 'Cancel']);
        confEdit.focus();
    }

}

// ACTUAL MOD
GameManager.init = function () {
    let mod = Game.mods[GameManager.id];
    GameManager.icon = GameManager.steam ? mod.dir + '/icon.png' : 'https://x8c8r.github.io/cc-gamemanager/icon.png';
    GameManager.menus.buildInfo();
    Game.Notify(`Loaded Game Manager!`, `Version ${GameManager.version}`, [0, 0, GameManager.icon], true);

    // Inject menus in
    let menuInject = () => {
        if (Game.onMenu == 'prefs') {
            GameManager.menu.appendOptionsMenu(GameManager.name, GameManager.menus.optionsMenu());
        }
        if (Game.onMenu == 'stats') {
            GameManager.menu.appendGenStats(GameManager.menus.additionalStats());
        }
        if (Game.onMenu == 'log') {
            GameManager.menu.prependInfoMenu(GameManager.name, GameManager.menus.infoMenu().innerHTML); // Cheap fix, still have yet to understand why no work
        }
    };

    GameManager.code.injectFunctionCode("Game.UpdateMenu", "l('menu').innerHTML=str;", GameManager.code.functionToString(menuInject), 1);
}

GameManager.save = function () {
    let save = JSON.stringify(GMConfig.values);
    return save;
}

GameManager.load = function (str) {
    if (!str) return;
    GMConfig.values = JSON.parse(str);
    GMConfig.fill();
    GMConfig.update();
}

Game.registerMod('x8c8r.gameManager', GameManager);