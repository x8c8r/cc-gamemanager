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

GMConfig.update = function() {
    GM.features.webify(true);
}

let GM = {
    name: 'Game Manager',
    id: 'x8c8r.gameManager',
    version: 2.121,
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
    // canClick - Should the button be clickable if it's disabled
    ConditionalButton: (func, text, condition, canClick = true, addStyle = "") =>
        `<a class="smallFancyButton option ${addStyle} ${condition?"":" off "}" ${Game.clickStr}="${canClick || condition ? func : ""} PlaySound('snd/tick.mp3');">${text}</a>`,
    OptionsButton: function (func, text, condition)
    {
        let optionifiedText = text + ": " + (condition ? loc("ON") : loc("OFF"))
        return GM.menuElements.ConditionalButton(func, optionifiedText, condition, true, "prefButton")
    }

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

        '<div class="subsection">'+loc('Conveniences')+'</div>'+
        GM.menuElements.Button("GM.features.restart();", loc('Reload'))+'<label>'+loc('Reload_tip')+'</label>'+'<br>'+
        (GM.steam ? (GM.menuElements.Button("GM.features.unlockSteamAchievs();", loc('Unlock Steam Achievements'))+'<label>'+loc('Unlock Steam Achievements_tip')+'</label>'+'<br>'):'')+
        GM.menuElements.ConditionalButton("GM.features.openSesame();", loc('Open Sesame'), !Game.sesame, false)+'<label>'+loc('Open Sesame_tip')+'</label>'+'<br>'+
        GM.menuElements.Button("GM.features.sleep();", loc('Sleep'))+'<label>'+loc('Sleep_tip')+'</label>'+'<br>'+
        GM.menuElements.Button("GM.features.updateMenu();", loc('Update Menus'))+'<label>'+loc('Update Menus_tip')+'</label>'+'<br>'+
        GM.menuElements.ConditionalButton("GM.features.ungiftOut();", loc('Ungift out'), Game.hasBuff('Gifted out'), false)+'<label>'+loc('Ungift out_tip')+'</label>'+'<br>'

        str+='<br>'+'<div class="line"></div>'+

        '<div class="subsection">'+loc('Hacks')+'</div>'+
        GM.menuElements.ConditionalButton("GM.features.cheatedCookiesUnlock();", loc("Cheat (zero) cookies"), !Game.HasAchiev('Cheated cookies taste awful'), false)+'<label>'+loc("Cheat (zero) cookies_tip")+'</label>'+'<br>'+
        GM.menuElements.ConditionalButton("GM.features.thirdParty();", loc("Join Third-Party"), !Game.HasAchiev('Third-party'), false)+'<label>'+loc("Join Third-Party_tip")+'</label>'+'<br>'+
        GM.menuElements.Button("GM.features.toggleAchiev(true);", loc("Unlock Achievement"))+'<label>'+loc("Unlock Achievement_tip")+'</label>'+'<br>'+
            GM.menuElements.Button("GM.features.toggleAchiev(false);", loc("Lock Achievement"))+'<label>'+loc("Lock Achievement_tip")+'</label>'+'<br>'+
        
        '<br>'+'<div class="line"></div>'+

        '<div class="subsection">'+loc('Game Progress')+'</div>'+
        (GM.steam ? (GM.menuElements.Button("GM.features.syncAchievs();", loc("Sync Achievements"))+'<label>'+loc("Sync Achievements")+'</label>'+'<br>'):'')+
        GM.menuElements.Button("GM.features.finishResearch();", loc("Finish Research"))+'<label>'+loc("Finish Research_tip")+'</label>'+'<br>'+
        GM.menuElements.Button("GM.features.changeSeed();", loc("Change Seed"))+'<label>'+loc("Change Seed_tip")+'</label>'+'<br>'+
		GM.menuElements.Button("GM.features.simulate();", loc("Simulate Cookies"))+'<label>'+loc("Simulate Cookies_tip")+'</label>'+'<br>'+

        '<br>'+'<div class="line"></div>'+
        
        '<div class="subsection">'+loc('Fun/Cosmetic')+'</div>'+
        GM.menuElements.OptionsButton("GM.features.webify(false);", loc("Webification"), GMConfig.getValue("Webify"))+'<label>'+loc("Webification_tip")+'</label>'+'<br>'+
        GM.menuElements.OptionsButton("GM.features.toggleAdditionalStats(false);", loc("Additional Statistics"), GMConfig.getValue("Additional Stats"))+'<label>'+loc("Additional Statistics_tip")+'</label>'+'<br>'+
                
        '<br>'+'<div class="line"></div>'+
        
        '<div class="subsection">'+loc('Mod Options')+'</div>'+
        GM.menuElements.OptionsButton("GM.features.toggleNotis();", loc("Show Notifications"), GMConfig.getValue("Show Notis"))+'<label>'+loc("Show Notifications_tip")+'</label>'+'<br>'+
        GM.menuElements.Button("GM.features.editConf();", loc("Edit Config"), "neato")+'<label>'+loc("Edit Config_tip")+'</label>'+'<br>'+
                
        '<br>'+'<div class="line"></div>'+
        
        '<label>'+loc('Made by x8c8r with love <3')+'</label>'+
        '</div>'
        return str;
    },

    additionalStats: () => {
        let str = GMConfig.getValue("Additional Stats")?
            `<div class="subsection">
                <div class="title">${loc("Additional_section")}</div>
                <div class="listing"><b>${loc("Session Clicks")}: </b> ${Beautify(Game.clicksThisSession)}</div>
                <div class="listing"><b>${loc("Missed Golden Cookies")}: </b> ${Beautify(Game.missedGoldenClicks)}</div>
                <div class="listing"><b>${loc("Seed")}: </b> ${Game.seed}</div>
            </div>`:'';
        /*let str = GMConfig.getValue("Additional Stats")?
            '<div class="subsection">'+
            '<div class="title">'+loc("Additional_section")+'</div>'+
            '<div class="listing"><b>'+loc("Session Clicks")+': +'</b>'+ Beautify(Game.clicksThisSession) +'</div>'+
            '<div class="listing"><b>'+loc("Missed Golden Cookies")+': </b>'+ Beautify(Game.missedGoldenClicks) +'</div>'+
            '<div class="listing"><b>'+loc("Seed")+': </b>' + Game.seed +'</div>'+
            '</div>'
            :'';*/
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
        `<div class="subsection"><div class="title">Game Manager Version history</div>
            
        <div class="subsection update">
        <div class="title">21/09/2023 - Language Update</div>
        <div class="listing"><i style="font-style:italic;">Do you remember... The 21st night of September?</i></div> 
        <div class="listing">Full localization support! No clue why, but it's here!. I am taking suggestions for languages, if you translate the mod in any language then message me on Discord (I am also usually active in Dashnet Forums server in modding channel).</div>
        <div class="listing">&bull; Russian translation.</div>
        <div class="listing">&bull; Slightly text changes.</div>
        <div class="listing">&bull; Backend changes.</div>
        </div>
		
		<div class="subsection update">
		<div class="title">02/04/2023 - patch 7</div>
		<div class="listing">&bull; Added a "Simulate" button. It will simulate however many hours of cookie production you will specify!</div>
		<div class="listing">&bull; Added a "Ungift out" button. Only shows up on beta. Will remove the "Gifted out" debuff after sending/receiving a gift.</div>
		<div class="listing">&bull; Changed info in the change seed feature.</div>
	    </div>

        <div class="subsection update">
        <div class="title">10/02/2023 - patch 6</div>
        <div class="listing">&bull; Revamped the config system. It now takes much less space in the save file!</div>
        <div class="listing">&bull; Added 2 new "Game Progress" features. These are supposed to help you control the game\'s progress while not being directly cheats.</div>
        </div>

        <div class="subsection update small">
        <div class="title">18/01/2023 - patch 5</div>
        <div class="listing">&bull; Added a feature to lock any achievement</div>
        ${(!GM.steam?'<div class="listing">&bull; The menu now correctly deals with Steam-only features on web.</div>':'')}
        </div>

        <div class="subsection update">
        <div class="title">17/01/2023 - the exhausted update (v2.01)</div>
        <div class="listing">Sorry, this update took way too much time than it should have. I am really tired as of writing this changelog. I have tried doing a lot of things for this update and only some worked out.</div>
        <div class="listing">&bull; Slightly changed the way changelog works. (I cut out all previous patches, sorry)</div>
        <div class="listing">&bull; Added changing the seed</div>
        <div class="listing">&bull; Sorted features by categories, and improved some of the names and labels</div>
        <div class="listing">&bull; Made additional stats toggleable</div>
        <div class="listing">&bull; Replaced all let\'s with var\'s in the code</div>
        <div class="listing">&bull; To prevent errors, config now can regenerate lost keys that were either added in a new update/were removed by the user</div>
        <div class="listing">&bull; And to compliment previous change: Config editor! You can find it at the bottom of GM\'s options menu</div>
        </div>
        
        <div class="subsection update small">
        <div class="title">11/01/2023 - patch 3</div>
        <div class="listing">&bull; Achievement-related features now display more info in various cases, to avoid confusion</div>
        <div class="listing">&bull; Added ability to unlock any achievement by it\'s name</div>
        </div>

        <div class="subsection update">
        <div class="title">03/01/2022 - evolution update (v2.0)</div>
        <div class="listing">First update of 2023 and you bet it\'s a big one...</div>
        <div class="listing" style=";color:green;">&bull; Complete rewrite, and no more CCSE dependency... at all.</div>
        <div class="listing">&bull; New config system</div>
        </div>

        <div class="subsection update">
        <div class="title">29/12/2021 - initial release</div>
        <div class="listing">&bull; Added restart button to easily restart the game.</div>
        </div>

        </div>`;

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
        GM.wrappers.notify(loc('Restarting the game!'), ``, [0, 0, GM.icon], true, false); //For people interested: Game.Notify(title,desc,pic,quick,noLog) quick = Notification disappears automatically after around a second. noLog = Doesn't display in console
        Game.toSave = true;
        Game.toReload = true; //Turns out CC actually saves the game before reloading, it was an oopsie on my side. But now it's fixed
    },

    sleep: function () {
        GM.wrappers.notify(loc('Timing out the game!'), '', [0, 0, GM.icon], true);
        Game.toSave = true;
        Game.Timeout();
    },

    unlockSteamAchievs: function () {
        if (!Steam.allowSteamAchievs) {
            GM.wrappers.notify(loc('Enabling Steam achievements!'), '', [0, 0, GM.icon], true);
            Steam.allowSteamAchievs = true;
        }
        else {
            GM.wrappers.notify(loc('Steam achievements were already enabled.'), '', [0, 0, GM.icon], true);
        }
    },

    updateMenu: function (loop = false) {
        GM.wrappers.notify(loc('Forcing the game to update menus!'), '', [0, 0, GM.icon], true);
        Game.UpdateMenu();
    },

    ungiftOut: function() {
        Game.killBuff('Gifted out');
        GM.wrappers.notify(loc('Removing "Gifted out"!'), '', [0, 0, GM.icon], true);
    },

    openSesame: function () {
        GM.wrappers.notify(loc('Opening the sesame!'), loc('Open Sesame!'), [0, 0, GM.icon], true);
        Game.OpenSesame();
    },

    // Hacks
    cheatedCookiesUnlock: function () {
        if (!Game.Achievements['Cheated cookies taste awful'].won) {
            GM.wrappers.notify(loc('Unlocking "Cheated cookies taste awful"!'), '', [0, 0, GM.icon], true);
            Game.Win('Cheated cookies taste awful');
        }
        else {
            GM.wrappers.notify(loc('"Cheated cookies taste awful" is already unlocked.'), '', [0, 0, GM.icon], true);
        }
    },

    thirdParty: function () {
        if (!Game.Achievements['Third-party'].won) {
            GM.wrappers.notify(loc('Unlocking "Third-party"!'), '', [0, 0, GM.icon], true);
            Game.Win('Third-party')
        }
        else {
            GM.wrappers.notify(loc('"Third-party" is already unlocked!'), '', [0, 0, GM.icon], true);
        }
    },

    toggleAchiev: function (mode) {

        const cM = function (mode) {
            mode = !mode;
            Game.UpdateMenu();
            return mode;
        }
        const uA = function (mode) {
            let ac = l('achName').value;

            if (!ac.length > 0) {
                GM.wrappers.notify(loc('Enter an achievement name!'), '', [0, 0, GM.icon], true);
                return;
            }

            if (!Game.Achievements[ac]) {
                GM.wrappers.notify(loc('Achievement %1 does not exist.', [ac]), '', [0, 0, GM.icon], true);
                return;
            }

            if (mode) {
                if (Game.Achievements[ac].won) {
                    GM.wrappers.notify(loc('Achievement %1 was already unlocked.', [ac]), '', [0, 0, GM.icon], true);
                    return;
                }

                GM.wrappers.notify(loc('Unlocking achievement %1!', [ac]), '', [0, 0, GM.icon], true);
                Game.Win(ac);
            }
            else {
                if (!Game.Achievements[ac].won) {
                    GM.wrappers.notify(loc('Achievement %1 was already locked.', [ac]), '', [0, 0, GM.icon], true);
                }
                    GM.wrappers.notify(loc('Locking achievement %1!', [ac]), '', [0, 0, GM.icon], true);
                Game.Achievements[ac].won = 0;
            }
        }
        Game.Prompt(
            `<h3>${mode?loc('Unlock Achievement'):loc('Lock Achievement')}</h3>
                    <div class="block">${loc('Enter name of the achievement (Case Sensitive):')}</div>
                    <input type="text" class="option" id="achName">
                    <br>`,
            [[mode?loc('Unlock'):loc('Lock'), GM.code.functionToString(uA, [mode])], loc('Cancel')]);
                    l('achName').focus();
    },

    changeSeed: function () {
        const cS = () => {
            let seed = l('seedInput').value;

            if (!seed.length > 0) return;

            GM.wrappers.notify(loc('Changing seed to: %1', [seed]), '', [0, 0, GM.icon], true);
            Game.seed = seed;
        };

        Game.Prompt(
		`<h3>${loc('Change seed')}</h3><div class="block">${loc('Seed_Explanation')}</div>
		<div class="block">${loc('Your current seed is: %1', [Game.seed])}</div>
        <div class="block">${loc('Enter new seed:')}<br><br>
        <input type="text" class="option" id="seedInput">
        </div>`, [[loc("Change"), GM.code.functionToString(cS)], loc("Cancel")]);
    },

    // Fun/Cosmetic
    webify: function (update = false) {
        if (!update) {
            GM.wrappers.notify(loc('Toggling the Web features!'), '', [0, 0, GM.icon], true);
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
        GM.wrappers.notify(loc('Toggling additional stats!'), '', [0, 0, GM.icon], true);
        Game.UpdateMenu();
    },

    // Game Progress
    syncAchievs: function() {
        GM.wrappers.notify(loc('Syncing achievements!'), '', [0, 0, GM.icon], true);
        for (let a in Game.Achievements) {
            if (Game.Achievements[a].won) {
                let ach = Game.Achievements[a];
                if (ach.vanilla) App.gotAchiev(ach.id);
            }
        }
    },

    finishResearch: function() {
        if (Game.researchT >= 0) {
            GM.wrappers.notify(loc('Finishing the research!'), '', [0,0, GM.icon], true);
            Game.researchT = 0;
        }
        else {
            GM.wrappers.notify(loc('No research is being conducted.'), '', [0,0, GM.icon], true);
        }
    },
	
	simulate: function() {
		const sim = () => {
			let hours = simInput.value;
			let amount = Game.cookiesPs*60*60*hours;
			Game.Earn(amount);
			GM.wrappers.notify(loc('Simulated %1 hours worth of CpS!', [hours]), '', [0,0, GM.icon], true);
		}
		Game.Prompt(`<h3>${loc('Simulation')}</h3> <input type="text" class="option" id="simInput" spellcheck="false"</input>`, [[loc('Simulate'), GM.code.functionToString(sim)], loc('Cancel')]);
	},

    // Mod Options
    toggleNotis: function () {
        GMConfig.setValue("Show Notis", !GMConfig.getValue("Show Notis"));
        Game.Notify(loc('Notifications: %1!', (GMConfig.getValue("Show Notis")?"On":"Off")), '', [0, 0, GM.icon], true); // I need to directly notify
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

        const confInfo = `<h2>${loc('Config values')}:</h2><div class="block" style="overflow-y:scroll;width:90%;height:70px">${str}</div>`;

        let confReset = () => GMConfig.reset();
        Game.Prompt(`<h3>${loc('Config Editor')}</h3><input type="text" class="option" id="confEdit" style="height:50px;width:90%;" spellcheck="false"></input> <br><br> ${confInfo}<br> </div>`, [[loc('Save'), GM.code.functionToString(confSave)], [loc('Reset to default'), GM.code.functionToString(confReset)], loc('Cancel')]);
        confEdit.value = JSON.stringify(GMConfig.getConfig());
        confEdit.focus();
    }
}

// ACTUAL MOD
GM.init = function () {
    GM.initLoc();

    let mod = Game.mods[GM.id];
    GM.icon = GM.steam ? mod.dir + '/icon.png' : 'https://x8c8r.github.io/cc-gamemanager/icon.png';

    new GMConfig.entry("Additional Stats", loc("Additional Stats_config"), true);
    new GMConfig.entry("Show Notis", loc("Show Notis_config"), false);
    new GMConfig.entry("Webify", loc("Webify_config"), (GM.steam ? false : true));

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

    Game.Notify(loc('Loaded Game Manager!'), loc('Version %1', GM.version), [0, 0, GM.icon], true);
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

// LANGUAGE
GM.initLoc = function() {
    ModLanguage("*",
        {
            // SECTIONS
            'Conveniences': "Conveniences",
            "Hacks": "Hacks",
            "Game Progress": "Game Progress",
            "Fun/Cosmetic": "Fun/Cosmetic",
            "Mod Options": "Mod Options",

            // CONVENIENCES
            'Reload': "Reload",
            'Reload_tip': "Reloads the game",

            'Unlock Steam Achievements': "Unlock Steam Achievements",
            'Unlock Steam Achievements_tip': "Allows Steam achievements to be unlocked",

            'Open Sesame': "Open Sesame",
            'Open Sesame_tip': "Opens Sesame",

            'Sleep': "Sleep",
            'Sleep_tip': "Puts your game to sleep mode",

            'Update Menus': "Update Menus",
            'Update Menus_tip': "Forces the game to update menus",

            'Ungift out': "Ungift out",
            'Ungift out_tip': "Removes the 'Gifted out' debuff",

            // HACKS
            'Cheat (zero) cookies': "Cheat (zero) cookies",
            'Cheat (zero) cookies_tip': "Unlocks 'Cheated cookies taste awful' achievement",

            'Join Third-Party': "Join Third-Party",
            'Join Third-Party_tip': "Unlocks 'Third-party' achievement",

            'Unlock Achievement': "Unlock Achievement",
            'Unlock Achievement_tip': "Unlocks any achievement",

            'Lock Achievement': "Lock Achievement",
            'Lock Achievement_tip': "Locks any achievement",

            // GAME PROGRESS
            'Sync Achievements': "Sync Achievements",
            'Sync Achievements_tip': "Makes Steam regrant your achievments",

            'Finish Research': "Finish Research",
            'Finish Research_tip': "Finish an ongoing research",

            'Change Seed': "Change Seed",
            'Change Seed_tip': "Changes seed of your run (more info in the prompt)",

            'Simulate Cookies': "Simulate Cookies",
            'Simulate Cookies_tip': "Simulates production of cookies (in hours)",

            // FUN/COSMETIC
            'Webification': "Webification",
            'Webification_tip': "Toggle the web version stuff",

            'Additional Statistics': "Additional Statistics",
            'Additional Statistics_tip': "Toggles additional stats in the info menu",

            // MOD OPTIONS
            'Show Notifications': "Show Notifications",
            'Show Notifications_tip': "Toggles notifications on the bottom of your screen when using mod features",

            'Edit Config': "Edit Config",
            'Edit Config_tip': "Directly edit Game Manager's config",

            // ADDITIONAL STATS
            'Additional_section': "Additional",
            'Session Clicks': "Amount of Clicks (this session)",
            'Missed Golden Cookies': "Missed Golden Cookies",
            'Seed': "Seed",

            // CONFIG VALUES
            'Additional Stats_config': "Whether additional statistics should be on",
            'Show Notis_config': "Whether the mod should display notifications",
            'Webify_config': "Whether web things should be on",

            // NOTIFICATIONS
            'Restarting the game!': "Restarting the game!",

            'Timing out the game!': "Timing out the game!",

            'Enabling Steam achievements!': "Enabling Steam achievements!",
            'Steam achievements were already enabled.': "Steam achievements were already enabled.",
            'Forcing the game to update menus!': "Forcing the game to update menus!",

            'Removing "Gifted out"!': "Removing \"Gifted out\"!",

            'Opening the sesame!': "Opening the sesame!",
            'Open Sesame!': "Open Sesame!",

            'Unlocking "Cheated cookies taste awful"!': "Unlocking \"Cheated cookies taste awful\"!",
            '"Cheated cookies taste awful" is already unlocked.': "\"Cheated cookies taste awful\" is already unlocked.",

            'Unlocking "Third-party"!': "Unlocking \"Third-party\"!",
            '"Third-party" is already unlocked.': "\"Third-party\" is already unlocked.",

            'Enter an achievement name!': "Enter an achievement name!",
            'Achievement %1 does not exist.': "Achievement %1 does not exist.",
            'Achievement %1 was already unlocked.': "Achievement %1 was already unlocked.",
            'Unlocking achievement %1!': "Unlocking achievement %1!",
            'Achievement %1 was already locked.': "Achievement %1 was already locked.",
            'Locking achievement %1!': "Locking achievement %1!",

            'Changing seed to: %1': "Changing seed to: %1",

            'Toggling the Web features!': "Toggling the Web features!",

            'Toggling additional stats!': "Toggling additional stats!",

            'Syncing achievements!': "Syncing achievements!",

            'Finishing the research!': "Finishing the research!",
            'No research is being conducted.': "No research is being conducted.",
            'Simulated %1 hours worth of CpS!': "Simulated %1 hours worth of CpS!",

            'Notifications: %1!': "Notifications: %1!",

            'Loaded Game Manager!': "Loaded Game Manager!",
            'Version %1': "Version %1",

            // POPUPS
            'Reset to default': "Reset to default",
            'Change': "Change",

            'Config values': "Config values",
            'Config Editor': "Config Editor",

            'Simulation': "Simulation",
            'Simulate': "Simulate",

            'Change seed': "Change seed",
            'Seed_Explanation': "A \"seed\" is a unique combination of letters that determines random events during your playthrough. It gets reset after every ascension.",
            'Your current seed is: %1': "Your current seed is: %1",
            'Enter new seed:': "Enter new seed:",

            'Lock': "Lock",
            'Unlock': "Unlock",
            'Lock Achievement': "Lock Achievement",
            'Unlock Achievement': "Unlock Achievement",
            'Enter name of the achievement (Case Sensitive):': "Enter name of the achievement (Case Sensitive):",

            // <3
            'Made by x8c8r with love <3': "Made by x8c8r with love <3"
        })

    ModLanguage("RU",
        {
            // SECTIONS
            'Conveniences': "Удобности",
            "Hacks": "Хаки",
            "Game Progress": "Прогресс",
            "Fun/Cosmetic": "Веселье/Косметическое",
            "Mod Options": "Опции Мода",

            // CONVENIENCES
            'Reload': "Перезапуск",
            'Reload_tip': "Перезапускает игру",

            'Unlock Steam Achievements': "Разблокировать Достижения Steam",
            'Unlock Steam Achievements_tip': "Позволяет получать достижения Steam",

            'Open Sesame': "Открыть Сезам",
            'Open Sesame_tip': "Открывает Сезам",

            'Sleep': "Уснуть",
            'Sleep_tip': "Переводит игру в режим сна",

            'Update Menus': "Обновить Меню",
            'Update Menus_tip': "Заставляет игру обновить меню",

            'Ungift out': "Обездарить",
            'Ungift out_tip': "Убирает дебафф 'Подарок дарен'",

            // HACKS
            'Cheat (zero) cookies': "Приготовить читерское печенье",
            'Cheat (zero) cookies_tip': "Разблокирует достижение 'У читерского печенья ужасный вкус'",

            'Join Third-Party': "Присоединиться к третьей стороне",
            'Join Third-Party_tip': "Разблокирует достижение 'Сторонний'",

            'Unlock Achievement': "Разблокировать достижение",
            'Unlock Achievement_tip': "Разблокировает любое достижение",

            'Lock Achievement': "Заблокировать достижение",
            'Lock Achievement_tip': "Заблокировает любое достижение",

            // GAME PROGRESS
            'Sync Achievements': "Синхронизировать Достижения",
            'Sync Achievements_tip': "Заставляет Steam перевыдать ваши достижения",

            'Finish Research': "Завершить исследование",
            'Finish Research_tip': "Завершает текущее исследование",

            'Change Seed': "Поменять сид",
            'Change Seed_tip': "Меняет сид текущего прохождения (больше информации в окне)",

            'Simulate Cookies': "Симуляция Печенья",
            'Simulate Cookies_tip': "Симулирует производство печенья (в часах)",

            // FUN/COSMETIC
            'Webification': "Вебификация",
            'Webification_tip': "Переключает вещи из Веб версии",

            'Additional Statistics': "Дополнительная Статистика",
            'Additional Statistics_tip': "Переключает доп. статистику в меню статистики",

            // MOD OPTIONS
            'Show Notifications': "Показывать Уведомления",
            'Show Notifications_tip': "Переключает уведомления снизу экрана когда вы используете функции мода",

            'Edit Config': "Изменить Конфиг",
            'Edit Config_tip': "Напрямую измените конфиг Game Manager",

            // ADDITIONAL STATS
            'Additional_section': "Дополнительные",
            'Session Clicks': "Количество кликов (данная сессия)",
            'Missed Golden Cookies': "Пропущенные золотые печенья",
            'Seed': "Сид",

            // CONFIG VALUES
            'Additional Stats_config': "Стоит-ли отображать доп. статистику",
            'Show Notis_config': "Стоит-ли отображать уведомления",
            'Webify_config': "Следует-ли включать вещи из веб версии",

            // NOTIFICATIONS
            'Restarting the game!': "Перезапускаю игру!",

            'Timing out the game!': "Засыпаю игру!",

            'Enabling Steam achievements!': "Включаю достижения Steam!",
            'Steam achievements were already enabled.': "Достижения Steam уже были включены.",
            'Forcing the game to update menus!': "Заставляю игру обновить меню!",

            'Removing "Gifted out"!': "Убираю \"Подарок дарен\"!",

            'Opening the sesame!': "Открываю Сезам!",
            'Open Sesame!': "Сезам Откройся!",

            'Unlocking "Cheated cookies taste awful"!': "Разблокироваю 'У читерского печенья ужасный вкус'!",
            '"Cheated cookies taste awful" is already unlocked.': "'У читерского печенья ужасный вкус' уже разблокировано.",

            'Unlocking "Third-party"!': "Разблокироваю 'Сторонний'!",
            '"Third-party" is already unlocked.': "'Сторонний' уже разюлокировано.",

            'Enter an achievement name!': "Введите название достижения!",
            'Achievement %1 does not exist.': "Достижение  %1 не существует.",
            'Achievement %1 was already unlocked.': "Достижение %1 уже было разблокировано.",
            'Unlocking achievement %1!': "Разблокироваю достижение %1!",
            'Achievement %1 was already locked.': "Достижение %1 уже было заблокировано.",
            'Locking achievement %1!': "Блокирую достижение %1!",

            'Changing seed to: %1': "Меняю сид на: %1",

            'Toggling the Web features!': "Переключаю Веб-вещи!",

            'Toggling additional stats!': "Переключаю доп. статистики!",

            'Syncing achievements!': "Синхронизирую достижения!",

            'Finishing the research!': "Завершаю исследование!",
            'No research is being conducted.': "Никакое исследование не проводится.",
            'Simulated %1 hours worth of CpS!': "Симулирую %1 часов печ/с!",

            'Notifications: %1!': "Уведомления: %1!",

            'Loaded Game Manager!': "Game Manager загружен!",
            'Version %1': "Версия %1",

            // POPUPS
            'Change': "Поменять",
            'Reset to default': "Сбросить",

            'Config values': "Значения конфига",
            'Config Editor': "Редактор Конфига",

            'Simulation': "Симуляция",
            'Simulate': "Симулировать",

            'Change seed': "Поменять сид",
            'Seed_Explanation': "\"Сид\" - это уникальная комбинация букв, которая определяет случайные события во время игры. Сид сбрасыватеся каждое восхождение.",
            'Your current seed is: %1': "Ваш текущий сид: %1",
            'Enter new seed:': "Введите новый сид:",

            'Lock': "Заблокировать",
            'Unlock': "Разблокировать",
            'Lock Achievement': "Заблокировать Достижение",
            'Unlock Achievement': "Разблокировать Достижение",
            'Enter name of the achievement (Case Sensitive):': "Введите имя достижения (С учетом регистра):",

            // <3

            'Made by x8c8r with love <3': "Сделано x8c8r с любовью <3"
        })
}

// at long last
Game.registerMod('x8c8r.gameManager', GM);
