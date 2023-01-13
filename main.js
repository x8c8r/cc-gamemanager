if (GameManager === undefined) var GameManager = {
    name: 'Game Manager',
    id: 'x8c8r.gameManager',
    version: 2.003,
    gameVersion: Game.gameVersion,
    steam: typeof (Steam) !== 'undefined',
    config: {},
}
if (GMConfig === undefined) var GMConfig = {
    values: {},
    update: () => {
        GameManager.webify(true);
    }
}
GMConfig.defValues = {
    webify: false,
    showNotis: false,
}
GMConfig.values = GMConfig.defValues;
GMConfig.reset = () => GMConfig.values = GMConfig.defValues;

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
        var titleDiv = document.createElement('div');
        titleDiv.className = title;
        titleDiv.textContent = title;
        titleDiv.classList = ["title"];

        // This is needed so everything is styled properly
        var container = document.createElement('div');
        container.classList = ["subsection"];

        var bodyDiv;
        if (typeof (body == 'string')) {
            bodyDiv = document.createElement('div');
            bodyDiv.innerHTML = body;
        }
        else {
            bodyDiv = body;
        }

        var toShow = true;

        container.appendChild(titleDiv);
        if (toShow) container.appendChild(bodyDiv);

        var div = document.createElement('div');
        div.appendChild(container);
        div.classList = ["block"];
        div.style = "padding:0px;margin:8px 4px;";

        var menu = l("menu");
        if (!menu) return;
        var padding = menu.childNodes;
        padding = padding[padding.length - 1];

        if (padding) {
            menu.insertBefore(div, padding);
        }
        else {
            menu.appendChild(div);
        }
    },

    appendGenStats: function (body) {
        var div;
        if (typeof (body) == 'string') {
            div = document.createElement('div');
            div.innerHTML = body;
        }
        else {
            div = body;
        }

        var genStats = l('statsGeneral');
        if (genStats) genStats.appendChild(div);
    },

    prependInfoMenu: function (title, body) {
        var titleDiv = document.createElement('div');
        titleDiv.className = title;
        titleDiv.textContent = title;
        titleDiv.classList = ["title"];

        // This is needed so the title is styled properly
        var titleContainer = document.createElement('div');
        titleContainer.classList = ["subsection"];
        titleContainer.appendChild(titleDiv);

        var bodyDiv;
        if (typeof (body == 'string')) {
            bodyDiv = document.createElement('div');
            bodyDiv.innerHTML = body;
        }
        else {
            bodyDiv = body;
        }

        var div = document.createElement('div');
        div.appendChild(titleContainer);
        div.appendChild(bodyDiv);

        var menu = l('menu');
        if (!menu) return;
        var about = menu.getElementsByClassName('subsection')[0];
        if (!about) return;
        about.parentNode.insertBefore(div, about);
    },

    appendInfoMenu: function (title, body) {
        var titleDiv = document.createElement('div');
        titleDiv.className = title;
        titleDiv.textContent = title;
        titleDiv.classList = ["title"];

        // This is needed so the title is styled properly
        var titleContainer = document.createElement('div');
        titleContainer.classList = ["subsection"];
        titleContainer.appendChild(titleDiv);

        var bodyDiv;
        if (typeof (body == 'string')) {
            bodyDiv = document.createElement('div');
            bodyDiv.innerHTML = body;
        }
        else {
            bodyDiv = body;
        }

        var div = document.createElement('div');
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
        var og = eval(functionName);
        if (og === null) {
            console.error(`"${functionName}" is not found`);
        }
        if (typeof(og) !== "function") {
            console.error(`"${functionName}" is not a function`)
        }
        eval(functionName + "=" + alteration(og.toString()));
    },

    injectFunctionCode: function (functionName, targetString, code, mode) {
        var alteration = (func) => {
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
        var alteration = (func) => {
            return `function(${args.toString()}) { ${code} }`;
        }
        GameManager.code.injectCode(functionName, alteration, code);
    },

    // Convert function to a string, to be used in injections/prompts
    functionToString: (functionName) => `(${String(functionName)})(); `,
}

// Menus
GameManager.menus = {
    optionsMenu: () => {
        var str = '<div class="listing">' +
            GameManager.menuElements.Button("GameManager.features.restart();", "Reload") + `<label>Reloads the game</label><br>` +
            (GameManager.steam ? GameManager.menuElements.Button("GameManager.features.unlockSteamAchievs();", "Unlock Steam Achievements") + `<label>Allows Steam achievements to be unlocked</label><br>` : "") +
            GameManager.menuElements.Button("GameManager.features.webify();", `Webify : ${GMConfig.values.webify ? "On" : "Off"}`) + `<label>Toggles web stuff (e.g. top bar)</label><br>` +
            GameManager.menuElements.Button("GameManager.features.openSesame();", "Open Sesame") + `<label>Opens Sesame</label><br>` +
            GameManager.menuElements.Button("GameManager.features.cheatedCookiesUnlock();", "Cheated cookies taste awful") + `<label>Unlocks "Cheated cookies taste awful" achievement</label><br>` +
            GameManager.menuElements.Button("GameManager.features.sleep();", "Sleep") + `<label>Puts your game on the pause screen, as if "Sleep mode timeout" option was on</label><br>` + `<br><br>` +
            GameManager.menuElements.Button("GameManager.features.updateMenu();", "Update Menus") + `<label>Forcefully updates the menus</label><br>` +
            GameManager.menuElements.Button("GameManager.features.unlockAchiev();", "Unlock Achievement") + `<label>Unlock any achievement</label><br>` +
            GameManager.menuElements.Button("GameManager.features.editConf();", "Edit Config") + `<label>Edit your config</label><br>` +
            `<br><label>Made by x8c8r with love <3</label>` +
            `</div>`; return str;
    },

    additionalStats: function () {
        var str =
            `<div class="listing"><b>Missed golden cookies: </b>` + Beautify(Game.missedGoldenClicks) + `</div>` +
            `<div class="listing"><b>Seed: </b>` + Game.seed + `</div>`;
        return str;
    },

    changelog: function () {
        var str = `<div class="subsection"><div class="listing">Game Manager is a mod to control the game you are playing. Think of it as a kind of a swiss knife for both modmakers and players.</div>` +
            `<div class="subsection"><div class="listing">In development since December 2021.</div>` +
            `<div class="subsection"><div class="listing">Made by x8c8r(<a href="https://steamcommunity.com/id/x8c8r" target="_blank">Steam</a>, <a href="https://github.com/x8c8r target="_blank">GitHub</a>)</div>` +
            `<div class="subsection"><div class="listing">Report any bugs and make suggestions either on the workshop page or on the <a href="https://github.com/x8c8r/cc-gamemanager/issues">GitHub Repo</a>.</div>` +

            `<div class="subsection"><div class="title">Game Manager ChangeLog</div>` +

            `</div><div class="subsection update small"><div class="title">11/01/2023 - Patch 13</div>` +
            `</div><div class="listing">&bull; Achievement-related features now tell more things in various cases (e.g. achievement being unlocked).</div>` +
            `</div><div class="listing">&bull; Added ability to unlock any achievement by it's name (again). The implementation is a bit clunky but it just works!</div>` +

            `</div><div class="subsection update small"><div class="title">08/01/2023 - Colder fix</div>` +
            `</div><div class="listing">Hehe, guess what? I broke openning sesame! It's fixed now tho...</div>` +

            `</div><div class="subsection update small"><div class="title">03/01/2023 - Cold fix</div>` +
            `</div><div class="listing">So... I kind of forgot to make v2 compatible with web. For some stupid reason, the web version doesn't
            like when the functions are used before they get created later, so I had to change that.</div>` +

            `</div><div class="subsection update"><div class="title">03/01/2023 - Evolution Update (Version 2.0)</div>` +
            `</div><div class="listing">First update of 2023 and you bet it's a big one...</div>` +
            `</div><div class="listing" style="font-weight:bold;color:green;">&bull; Complete rewrite, and no more CCSE dependency... at all.` +
            `</div><div class="listing" >To be fair, I didn't rewrite it completely from scratch, I rewrote a lot of CCSE code to make this even possible
            but overall, I didn't need a lot of stuff CCSE provided. The mod is still pretty much the same size, but now it can also load before other CCSE mods!</div>` +
            `</div><div class="listing warning" style="font-weight:bold;">&bull; Removal of experimental stuff` +
            `</div><div class="listing">I had to remove stuff like Seed Changer and Achievement Unlocker due to the menus updating
            every 5 seconds no matter what you do, and resetting input boxes. Webify is still left though.</div>` +
            `</div><div class="listing" style="font-weight:bold;">&bull; Configuration!` +
            `</div><div class="listing">I always wanted to make it so you can toggle something, and the mod will remember it. Well...
            now it can be done! And it is being used by webify!</div>` +

            `</div><div class="subsection update small"><div class="title">21/10/2022</div>` +
            `</div><div class="listing">&bull; Updated the links and names because nickname change.</div>` +

            `</div><div class="subsection update small"><div class="title">16/04/2022</div>` +
            `</div><div class="listing">&bull; Added an ability to open sesame.</div>` +
            `</div><div class="listing">&bull; Made it so you can only activate additional statistics once.</div>` +

            `</div><div class="subsection update small"><div class="title">06/03/2022</div>` +
            `</div><div class="listing">&bull; Additional statistics now have to be turned on first before being shown.</div>` +


            `</div><div class="subsection update small"><div class="title">11/01/2022</div>` +
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
            `</div><div class="listing"> Somehow broke my game so it doesn't reload anymore</div>` +

            `</div><div class="subsection update"><div class="title">08/01/2022</div>` +
            `</div><div class="listing">This update got pretty big, compared to other small ones. I surpassed my own expectations, and I think, I can do even better at some point.</div>` +
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
            `</div><div class="listing">&bull; Added and ability to change the version number in left bottom corner to look vanilla, because I was tired of CCSE changing it.</div>`;
        return str;
    },
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

    unlockAchiev: function () {
        const uA = function () {
            var ac = l('achName').value;

            if (!ac.length > 0) return;

            if (!Game.Achievements[ac]) {
                GameManager.wrappers.notify('Achievement does not exist!', '', [0, 0, GameManager.icon], true);
                return;
            }

            if (Game.Achievements[ac].won) {
                GameManager.wrappers.notify('Achievement was already unlocked!', '', [0, 0, GameManager.icon], true);
                return;
            }

            GameManager.wrappers.notify('Unlocking achievement!}"', '', [0, 0, GameManager.icon], true);
            Game.Win(ac);
        }
        Game.Prompt(`<h3>Unlock Achievement</h3><div class="block">Enter name of the achievement (Case Sensitive):<br><br>
		<input type='text' class='option' id='achName'></input></div>`, [['Unlock', GameManager.code.functionToString(uA)], 'Cancel']);
        l('achName').focus();
    },
    //this might be the worst code i ever wrote
    editConf: function () {
        const confSave = () => GMConfig.values = JSON.parse(conf);
        const confInfo = `<div class="block" style="overflow-y:scroll;width:100%;>
            webify - Whether "Webify" is turned on or off <br>
            showNotis - Whether to show notifications on actions <br> <br>
            yo <br>
        </div>`;

        var confReset = () => GMConfig.reset();
        Game.Prompt(`<h3>Config</h3>)<input type="text" class="option" id="confEdit" value=${JSON.stringify(GMConfig.values)}></input> <br> ${confInfo}</div>`, [['Save', GameManager.code.functionToString(confSave)], ['Reset to default', GameManager.code.functionToString(confReset)], 'Cancel']);
        confEdit.focus();
    }

}

// ACTUAL MOD
GameManager.init = function () {
    let mod = Game.mods[GameManager.id];
    GameManager.icon = GameManager.steam ? mod.dir + '/icon.png' : 'https://x8c8r.github.io/cc-gamemanager/icon.png';
    Game.Notify(`Loaded Game Manager!`, `Version ${GameManager.version}`, [0, 0, GameManager.icon], true);

    // Inject menus in
    var menuInject = () => {
        if (Game.onMenu == 'prefs') {
            GameManager.menu.appendOptionsMenu(GameManager.name, GameManager.menus.optionsMenu());
        }
        if (Game.onMenu == 'stats') {
            GameManager.menu.appendGenStats(GameManager.menus.additionalStats());
        }
        if (Game.onMenu == 'log') {
            GameManager.menu.prependInfoMenu(GameManager.name, GameManager.menus.changelog());
        }
    };

    GameManager.code.injectFunctionCode("Game.UpdateMenu", "l('menu').innerHTML=str;", GameManager.code.functionToString(menuInject), 1);
}

GameManager.save = function () {
    var save = JSON.stringify(GMConfig.values);
    return save;
}

GameManager.load = function (str) {
    if (!str) return;
    GMConfig.values = JSON.parse(str);
    GMConfig.update();
}

Game.registerMod('x8c8r.gameManager', GameManager);