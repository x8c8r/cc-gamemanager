// Config
// i swear this thing is so unreasonably complex for a cookie game mod
let GMConfig = {};

GMConfig.entries=[];
GMConfig.entry = function(name, desc, defValue) {
    this.name = name;
    this.desc = desc;
    this.defValue = defValue;
    this.value = this.defValue;

    GMConfig.entries[this.name] = this;
}
GMConfig.entry.prototype.getEntry = function() {
    return {
        name: this.name,
        value: this.value
    }
}
GMConfig.setValue = function(entry, value) {
    GMConfig.entries[entry].value = value;
}

GMConfig.getValue = function(entryName) {
    if (entryName in GMConfig.entries)
        return GMConfig.entries[entryName].value;
}

GMConfig.getConfig = function() {
    let config = {};
    for (let i in GMConfig.entries) {
        let value = Object.values(GMConfig.entries[i].getEntry());
        config[value[0]] = value[1];
    }
    return config;
}
GMConfig.loadConfig = function(c) {
    let values = Object.values(c);
    let keys = Object.keys(c)
    for (let i in keys) {
        if (keys[i] in GMConfig.entries) {
            if (typeof (values[i]) === 'undefined') values[i] = GMConfig.entries[keys[i]].defValue;
            GMConfig.setValue(keys[i], values[i]);
        }
    }
}
GMConfig.reset = () => {
    for (let i in GMConfig.entries) {
        let entry = GMConfig.entries[i];
        if(entry in GMConfig.entries)
            GMConfig.setValue(GMConfig.entries[i].name, GMConfig.entries[i].defValue);
    }
}

new GMConfig.entry("Additional Stats", "Whether additional statistics should be on", true);
new GMConfig.entry("Show Notis", "Whether the mod should display it's notifications", false);
new GMConfig.entry("Webify", "Whether web things should be on", false);

GMConfig.update = function() {
    GM.features.webify(GMConfig.getValue("Webify"));
}

let GM = {
    name: 'Game Manager',
    id: 'x8c8r.gameManager',
    version: 2.110,
    gameVersion: Game.gameVersion,
    steam: typeof (Steam) !== 'undefined',
}

GM.wrappers = {
    notify: (title, desc, icon, quick) => {
        if (!GMConfig.getValue("Show Notis")) return;
        Game.Notify(title, desc, icon, quick);
    }
}

/*
    I am going to admit I used a lot of CCSE code as reference here, but only for the singular purpose of not having to rely on CCSE for code injection and menus
    which are the only things I really need. I just hope no one will be angry with me for this...
    So huge thank you to Klattmose, original code - https://github.com/klattmose/klattmose.github.io/blob/master/CookieClicker/CCSE.js 
*/
// Menu Helpers
GM.menu = {
    toggleMenu: [], // Toggleable menus

    toggleCollapseMenu: function (title, prefix) {
        if (GM.menu.toggleMenu[prefix+title] === 0)
        GM.menu.toggleMenu[prefix+title] = 1;

        if (GM.menu.toggleMenu[prefix+title] === 1 || 
            (GM.menu.toggleMenu[prefix+title] !== 1 || GM.menu.toggleMenu[prefix+title] !== 0 || GM.menu.toggleMenu[prefix+title] === undefined))
        GM.menu.toggleMenu[prefix+title] = 0;
    },

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

        container.appendChild(titleDiv);
        container.appendChild(bodyDiv);

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
GM.menuElements = {
    Button: (func, text, addStyle = "") =>
        '<a class="smallFancyButton option '+addStyle+'"' + `${Game.clickStr}="${func} PlaySound('snd/tick.mp3');">${text}</a>`,
}

// Code Injection
GM.code = {
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
        GM.code.injectCode(functionName, alteration, code);
    },

    // Completely swaps all the code in a function
    replaceFunction: function (functionName, code, args) {
        if (args === undefined) args = "";
        let alteration = (func) => {
            return `function(${args.toString()}) { ${code} }`;
        }
        GM.code.injectCode(functionName, alteration, code);
    },

    // Convert function to a string, to be used in injections/prompts
    functionToString: function (functionName, args) {
        if (args === undefined) args = "";

        return`(${String(functionName)})(${args.toString()});`;
    },
}

// Menus
GM.menus = {
    optionsMenu: () => {
        let str =
        '<div class="listing">'+

        '<div class="subsection">Conveniences</div>'+
        GM.menuElements.Button("GM.features.restart();", "Reload")+'<label>Reloads the game</label>'+'<br>'+
        (GM.steam ? (GM.menuElements.Button("GM.features.unlockSteamAchievs();", "Unlock Steam Achievements")+'<label>Allows Steam achievements to be unlocked</label>'+'<br>'):'')+
        GM.menuElements.Button("GM.features.openSesame();", "Open Sesame")+'<label>Opens Sesame</label>'+'<br>'+
        GM.menuElements.Button("GM.features.sleep();", "Sleep")+'<label>Puts your game in sleep mode</label>'+'<br>'+
        GM.menuElements.Button("GM.features.updateMenu();", "Update Menus")+'<label>Forces the game to update menus</label>'+'<br>'+

        '<br>'+'<div class="line"></div>'+

        '<div class="subsection">Hacks</div>'+
        GM.menuElements.Button("GM.features.cheatedCookiesUnlock();", "Cheat (0) cookies")+'<label>Unlocks "Cheated cookies taste awful" achievement</label>'+'<br>'+
        GM.menuElements.Button("GM.features.thirdParty();", "Join Third-Party")+'<label>Unlocks "Third-party" achievement</label>'+'<br>'+
        GM.menuElements.Button("GM.features.toggleAchiev(true);", "Unlock Achievement")+'<label>UNLOCK any achievement (as long as you type it right)</label>'+'<br>'+
        GM.menuElements.Button("GM.features.toggleAchiev(false);", "Lock Achievement")+'<label>LOCK ANY achievement (as long as you type it right)</label>'+'<br>'+
        
        '<br>'+'<div class="line"></div>'+

        '<div class="subsection">Game Progress</div>'+
        (GM.steam ? (GM.menuElements.Button("GM.features.syncAchievs();", "Sync Achievements")+'<label>Makes Steam regrant you achievements</label>'+'<br>'):'')+
        GM.menuElements.Button("GM.features.finishResearch();", "Finish Research")+'<label>Finishes research if there is an ongoing one</label>'+'<br>'+
        GM.menuElements.Button("GM.features.changeSeed();", "Change Seed")+'<label>Changes your seed (more info in the prompt)</label>'+'<br>'+

        '<br>'+'<div class="line"></div>'+
        
        '<div class="subsection">Fun/Cosmetic</div>'+
        GM.menuElements.Button("GM.features.webify(false);", "Webification: "+(GMConfig.getValue("Webify")?"On":"Off"))+'<label>Toggle the web version stuff</label>'+'<br>'+
        GM.menuElements.Button("GM.features.toggleAdditionalStats(false);", "Additional statistics: "+(GMConfig.getValue("Additional Stats")?"On":"Off"))+'<label>Toggles additional statistics in the info menu</label>'+'<br>'+
                
        '<br>'+'<div class="line"></div>'+
        
        '<div class="subsection">Mod Options</div>'+
        GM.menuElements.Button("GM.features.toggleNotis();", "Show Notifications: "+(GMConfig.getValue("Show Notis")?"On":"Off"))+'<label>Toggle notifications in bottom of the screen on using a mod feature</label>'+'<br>'+
        GM.menuElements.Button("GM.features.editConf();", "Edit Config", "neato")+'<label>Directly edit your Game Manager config</label>'+'<br>'+
                
        '<br>'+'<div class="line"></div>'+
        
        '<label>Made by x8c8r with love <3</label>'+
        '</div>'
        return str;
    },

    additionalStats: () => {
        let str = GMConfig.getValue("Additional Stats")?
            '<div class="subsection">'+
            '<div class="title">Additional</div>'+
            '<div class="listing"><b>Amount of Clicks (this session): </b>'+ Beautify(Game.clicksThisSession) +'</div>'+
            '<div class="listing"><b>Missed Golden Cookies: </b>'+ Beautify(Game.missedGoldenClicks) +'</div>'+
            '<div class="listing"><b>Seed: </b>' + Game.seed +'</div>'+
            '</div>'
            :'';
        return str;
    },

    buildInfo: () => {
        GM.changelog = document.createElement('div');

        let infoContainer = document.createElement("div");
        infoContainer.classList.add("subsection");

        let modInfo = document.createElement('div');
        modInfo.classList.add("subsection");
        modInfo.innerHTML = '<div class="listing">Game Manager is a mod to control the game you are playing. Think of it as a kind of a swiss knife for both modmakers and players. <br><br>' +
        'In development since December 2021. <br><br>' +
        'Made by x8c8r <br>'+
        '<a href="https://steamcommunity.com/id/x8c8r" target="_blank">Steam</a>, <a href="https://github.com/x8c8r" target="_blank">GitHub</a> <br><br>'+
        'Report any bugs and make suggestions either on the workshop page or on the <a href="https://github.com/x8c8r/cc-GM/issues">GitHub Repo</a>. </div> <br>'
        
        infoContainer.appendChild(modInfo);

        let changelog = document.createElement('div');
        changelog.classList.add("subsection");

        let updateLog = 
        '<div class="subsection"><div class="title">Game Manager Version history</div>'+

        '<div class="subsection update">'+
        '<div class="title">10/02/2023 - patch 6</div>'+
        '<div class="listing">&bull; Revamped the config system. It now takes much less space in the save file!</div>'+
        '<div class="listing">&bull; Added 2 new "Game Progress" features. These are supposed to help you control the game\'s progress while not being directly cheats.</div>'+
        '</div>'+

        '<div class="subsection update small">'+
        '<div class="title">18/01/2023 - patch 5</div>'+
        '<div class="listing">&bull; Added a feature to lock any achievement</div>'+
        (!GM.steam?'<div class="listing">&bull; The menu now correctly deals with Steam-only features on web.</div>':'')+
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
        GM.changelog.appendChild(infoContainer);
        
    },

    infoMenu: () => {
        return GM.changelog;
    }

}

// Features
GM.features = {
    // Conveniences
    restart: function () {
        GM.wrappers.notify(`Restarting the game!`, ``, [0, 0, GM.icon], true, false); //For people interested: Game.Notify(title,desc,pic,quick,noLog) quick = Notification disappears automatically after around a second. noLog = Doesn't display in console
        Game.toSave = true;
        Game.toReload = true; //Turns out CC actually saves the game before reloading, it was an oopsie on my side. But now it's fixed
    },

    sleep: function () {
        GM.wrappers.notify(`Timing out the game!`, '', [0, 0, GM.icon], true);
        Game.toSave = true;
        Game.Timeout();
    },

    unlockSteamAchievs: function () {
        if (!Steam.allowSteamAchievs) {
            GM.wrappers.notify(`Enabling Steam achievements!`, '', [0, 0, GM.icon], true);
            Steam.allowSteamAchievs = true;
        }
        else {
            GM.wrappers.notify(`Steam achievements were already enabled!`, '', [0, 0, GM.icon], true);
        }
    },

    updateMenu: function (loop = false) {
        GM.wrappers.notify(`Forcing the game to update menus!`, '', [0, 0, GM.icon], true);
        Game.UpdateMenu();
    },

    openSesame: function () {
        GM.wrappers.notify(`Opening the sesame!`, 'Open Sesame!', [0, 0, GM.icon], true);
        Game.OpenSesame();
    },

    // Hacks
    cheatedCookiesUnlock: function () {
        if (!Game.Achievements['Cheated cookies taste awful'].won) {
            GM.wrappers.notify(`Unlocking "Cheated cookies taste awful"!`, '', [0, 0, GM.icon], true);
            Game.Win('Cheated cookies taste awful');
        }
        else {
            GM.wrappers.notify(`"Cheated cookies taste awful" is already unlocked!`, '', [0, 0, GM.icon], true);
        }
    },

    thirdParty: function () {
        if (!Game.Achievements['Third-party'].won) {
            GM.wrappers.notify(`Unlocking "Third-party"!`, '', [0, 0, GM.icon], true);
            Game.Win('Third-party')
        }
        else {
            GM.wrappers.notify(`"Third-party" is already unlocked!`, '', [0, 0, GM.icon], true);
        }
    },

    toggleAchiev: function (mode) {
        const uA = function (mode) {
            let ac = l('achName').value;

            if (!ac.length > 0) return;

            if (!Game.Achievements[ac]) {
                GM.wrappers.notify('Achievement "'+ac+'" does not exist!', '', [0, 0, GM.icon], true);
                return;
            }

            if (mode) {
                if (Game.Achievements[ac].won) {
                    GM.wrappers.notify('Achievement "'+ac+'" was already unlocked!', '', [0, 0, GM.icon], true);
                    return;
                }

                GM.wrappers.notify('Unlocking achievement "'+ac+'"!', '', [0, 0, GM.icon], true);
                Game.Win(ac);
            }
            else {
                if (!Game.Achievements[ac].won) {
                    GM.wrappers.notify('Achievement "'+ac+'" was already locked!', '', [0, 0, GM.icon], true);                    
                }
                GM.wrappers.notify('Locking achievement "'+ac+'"!', '', [0, 0, GM.icon], true);
                Game.Achievements[ac].won = 0;
            }
        }
        Game.Prompt('<h3>'+(mode?'Unlock':'Lock')+' Achievement</h3>'+
        '<div class="block">Enter name of the achievement (Case Sensitive):<br><br>'+
		'<input type="text" class="option" id="achName"></input></div>',
        [[mode?'Unlock':'Lock', GM.code.functionToString(uA, [mode])], 'Cancel']);
        l('achName').focus();
    },

    changeSeed: function () {
        const cS = () => {
            let seed = l('seedInput').value;

            if (!seed.length > 0) return;

            GM.wrappers.notify('Changing seed to: ' + seed, '', [0, 0, GM.icon], true);
            Game.seed = seed;
        };

        Game.Prompt('<h3>Change seed</h3><div class="block">A "seed" is a unique combination of letters that determines random events during your playthrough, it doesn\'t get reset on ascensions</div>'+
        '<div class="block">Enter new seed:<br><br>'+
        '<input type="text" class="option" id="seedInput"></input>'+
        '</div>', [["Change", GM.code.functionToString(cS)], "Cancel"]);
    },

    // Fun/Cosmetic
    webify: function (update = false) {
        if (!update) {
            GM.wrappers.notify(`Toggling the Web features!`, '', [0, 0, GM.icon], true);
            GMConfig.setValue("Webify" ,!GMConfig.getValue("Webify"));
        }
        if (GMConfig.getValue("Webify")) {
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
        GMConfig.setValue("Additional Stats", !GMConfig.getValue("Additional Stats"));
        GM.wrappers.notify(`Toggling additional stats!`, '', [0, 0, GM.icon], true);
        Game.UpdateMenu();
    },

    // Game Progress
    syncAchievs: function() {
        GM.wrappers.notify(`Syncing achievements!`, '', [0, 0, GM.icon], true);
        for (let a in Game.Achievements) {
            if (Game.Achievements[a].won) {
                let ach = Game.Achievements[a];
                if (ach.vanilla) App.gotAchiev(ach.id);
            }
        }
    },

    finishResearch: function() {
        if (Game.researchT >= 0) {
            GM.wrappers.notify('Finishing the research!', '', [0,0, GM.icon], true);
            Game.researchT = 0;
        }
        else {
            GM.wrappers.notify('No research is being conducted!', '', [0,0, GM.icon], true);
        }
    },

    // Mod Options
    toggleNotis: function () {
        GMConfig.setValue("Show Notis", !GMConfig.getValue("Show Notis"));
        Game.Notify('Notifications: '+(GMConfig.getValue("Show Notis")?"On":"Off"), '', [0, 0, GM.icon], true); // I need to directly notify
        Game.UpdateMenu();
    },

    editConf: function () {
        const confSave = () => {
            let conf = JSON.parse(confEdit.value);
            GMConfig.loadConfig(conf);
            confEdit.value = JSON.stringify(GMConfig.getConfig())
        }

        let str = "";
        for (let i in GMConfig.entries) {
            let entry = GMConfig.entries[i];
            str += entry.name + ' - ' + entry.desc + '<br><br>';
        }

        const confInfo = '<h2>Config values:</h2><div class="block" style="overflow-y:scroll;width:90%;height:70px">'+
        str +
        '</div>';

        let confReset = () => GMConfig.reset();
        Game.Prompt(`<h3>Config Editor</h3>)<input type="text" class="option" id="confEdit" style="height:50px;width:90%;" spellcheck="false"></input> <br><br> ${confInfo}<br> </div>`, [['Save', GM.code.functionToString(confSave)], ['Reset to default', GM.code.functionToString(confReset)], 'Cancel']);
        confEdit.value = JSON.stringify(GMConfig.getConfig());
        confEdit.focus();
    }

}

// ACTUAL MOD
GM.init = function () {
    let mod = Game.mods[GM.id];
    GM.icon = GM.steam ? mod.dir + '/icon.png' : 'https://x8c8r.github.io/cc-gamemanager/icon.png';

    GM.menus.buildInfo();

    // Inject menus in
    let menuInject = () => {
        if (Game.onMenu == 'prefs') {
            GM.menu.appendOptionsMenu(GM.name, GM.menus.optionsMenu(), true);
        }
        if (Game.onMenu == 'stats') {
            GM.menu.appendGenStats(GM.menus.additionalStats());
        }
        if (Game.onMenu == 'log') {
            GM.menu.prependInfoMenu(GM.name, GM.menus.infoMenu().innerHTML); // Cheap fix, still have yet to understand why no work
        }
    };

    GM.code.injectFunctionCode("Game.UpdateMenu", "l('menu').innerHTML=str;", GM.code.functionToString(menuInject), 1);

    Game.Notify(`Loaded Game Manager!`, `Version ${GM.version}`, [0, 0, GM.icon], true);
}

GM.save = function () {
    let save = JSON.stringify(GMConfig.getConfig());
    return save;
}

GM.load = function (str) {
    if (!str) return;
    let config = JSON.parse(str);
    GMConfig.loadConfig(config);
    GMConfig.update();
}

Game.registerMod('x8c8r.gameManager', GM);