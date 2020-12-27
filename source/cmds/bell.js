const { MessageEmbed } = require("discord.js");
const fs = require("fs");
const Time = require("../classes/time.js");
const Utilz = require("../classes/utilz.js");

const prefsDirPath = "prefs";
const prefsFilePath = `${prefsDirPath}/bell.json`;

let bell = {};
let checkInterval;

let checkBell = function(timetable){}; // C-style prototyping the function :P

function cmdBell(client, timetable, students) {
    loadPrefs();

    // Admin permission required
    cmdSetBellCh(client);
    // Admin permission required
    cmdRemoveBellCh(client);
    
    checkInterval = setInterval(checkBell, 900 * 60, client, timetable);
}

function cmdSetBellCh(client) {
    client.on("message", (msg) => {
        if (msg.author.bot) return;
        const cont = msg.content;
        if (
            cont.startsWith("!csengetés be") ||
            cont.startsWith("!csengetes be")
        ) {
            const guildId = msg.guild.id;
            const member = msg.guild.member(msg.author); // same as `msg.member`
            if (!member.hasPermission("ADMINISTRATOR")) {
                msg.channel.send("Nincs jogod ehhez. (Adminisztrátor rang szükséges)");
                console.log(`${msg.member.user.username}#${msg.member.user.discriminator} tried turning off the bell in ${msg.guild.name}, but they don't have administrator permission`);
                return
            }

            if (bell[guildId] === undefined) {
                bell[guildId] = {"readableName" : msg.guild.name};
            } else {
                clearInterval(bell[guildId]["interval"]);
            }
            bell[guildId]["readableName"] = msg.guild.name;
            bell[guildId]["channelID"] = msg.channel.id;
            savePrefs();
            msg.channel.send(`${msg.channel} kiválaszva, mint csengetési csatorna.`);
            // console.log(bell);
            console.log(`${msg.channel.name} was set as bell channel`);
        }
    });
}

function cmdRemoveBellCh(client) {
    client.on("message", (msg) => {
        if (msg.author.bot) return;
        const cont = msg.content;
        if (
            cont.startsWith("!csengetés ki") ||
            cont.startsWith("!csengetes ki")
        ) {
            const guildID = msg.guild.id;
            const member = msg.guild.member(msg.author); // same as `msg.member`
            if (!member.hasPermission("ADMINISTRATOR")) {
                msg.channel.send("Nincs jogod ehhez. (Adminisztrátor rang szükséges)");
                console.log(`${msg.member.user.username}#${msg.member.user.discriminator} tried turning off the bell in ${msg.guild.name}, but they don't have administrator permission`);
                return
            }

            if (bell[guildID] === undefined || bell[guildID]["channelID"] == undefined) {
                msg.channel.send("Nincs bekapcsolva csengetés.");
                return;
            }
            const channelID = bell[guildID]["channelID"];
            bell[guildID]["channelID"] = undefined;
            savePrefs();
            client.channels.fetch(channelID)
                           .then(channel => {
                                msg.channel.send(`Csengetés leállítva a(z) ${channel} csatornában.`);
                                console.log(`${channel.name} is bell channel no more`);
                           })
                           .catch(err => console.log(err));
            // console.log(bell);
        }
    });
}

checkBell = (function() {
    let lastRingIn = 0;
    
    return function(client, timetable) {
        lastRingIn = Math.max(lastRingIn - 1, 0);
        if (lastRingIn > 0) return;
        
        const today = timetable[Utilz.getDayString()];
        const now = new Time(new Date().getHours(), new Date().getMinutes());
        let lessonsStart = [];
        for (var lesson of today) {
            if (lesson.data.start.compare(now.add(new Time(1))) == 0) {
                lessonsStart.push(lesson.subj);
            }
        }
        if (lessonsStart.length == 0) return;

        lastRingIn = 2;
        const reply =
            "**" + lessonsStart.map(Utilz.capitalize)
                               .reduce((a, b) => a + "**,\n**" + b)
            + `**\n${lessonsStart.length > 1 ? "órák kezdődnek" : "óra kezdődik"}.`;
        const embed = new MessageEmbed()
            .setColor(0x00bb00)
            .setTitle("**Csöngő van!**")
            .setDescription(reply);
        for (var guildId in bell) {
            const channelID = bell[guildId]["channelID"];
            client.channels.fetch(channelID)
                           .then(channel => {
                               channel.send(embed);
                               channel.send("@everyone");
                                console.log(`rang the bell in ${channel.name} for classes ${lessonsStart}`);
                           })
                           .catch(err => console.log(err));
        }
    };
}());

function savePrefs() { // save
    const saveData = bell;
    // console.log(saveData);
    if (!fs.existsSync(prefsDirPath)) {
        console.log(`created dir '${prefsDirPath}' because it did not exist`);
        fs.mkdirSync(prefsDirPath);
    }
    fs.writeFile(prefsFilePath, JSON.stringify(saveData, undefined, 4), err => {if (err) console.log(err)});
    console.log(`saved prefs for '${prefsFilePath}'`);
}

function loadPrefs() { // load
    if (!fs.existsSync(prefsFilePath)) return;
    let loadDataRaw = fs.readFileSync(prefsFilePath, err => {if (err) console.log(err)});
    
    let loadData = JSON.parse(loadDataRaw);
    bell = loadData;
    console.log(`loaded prefs for '${prefsFilePath}'`);
    console.log(loadData);
}

module.exports = cmdBell;
