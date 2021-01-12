const fs = require("fs");
const Time = require("../classes/time.js");
const Utilz = require("../classes/utilz.js");
const { MessageEmbed } = require("discord.js");

const prefsDirPath = "prefs";
const prefsFilePath = `${prefsDirPath}/bell.json`;

let bell = {};
let checkInterval;

let checkBell = function(timetable){}; // C-style prototyping the function :P

function cmdBell(client, timetable, students) {
    bell = loadPrefs();

    // Admin permission required
    cmdSetBellCh(client);
    // Admin permission required
    cmdRemoveBellCh(client);
    // Admin permission required
    setBellRole(client);
    
    checkInterval = setInterval(checkBell, 300 * 60, client, timetable);
}

function cmdSetBellCh(client) {
    client.on("message", (msg) => {
        if (msg.author.bot) return;
        const regex = /!(?:cs[eoö]nget[ée]s|cs[eoö]ng[oöő])\s+be\s*/i; // !csengetés be
        const cont = msg.content;
        if (
            regex.test(msg.content)
        ) {
            const guildID = msg.guild.id;
            const member = msg.guild.member(msg.author); // same as `msg.member`
            if (!member.hasPermission("MANAGE_GUILD")) {
                const embed = new MessageEmbed()
                    .setColor(0xbb0000)
                    .setDescription("Nincs jogod ehhez. (\`Manage Server\` hozzáférés szükséges)");
                msg.channel.send(embed);
                console.log(`${msg.member.user.username}#${msg.member.user.discriminator} tried turning off the bell in ${msg.guild.name}, but they don't have MANAGE_GUILD permission`);
                return
            }

            bell = loadPrefs();
            if (bell[guildID] === undefined) {
                bell[guildID] = {"readableName" : msg.guild.name};
            }
            bell[guildID]["readableName"] = msg.guild.name;
            bell[guildID]["channelID"] = msg.channel.id;
            savePrefs(bell);
            msg.channel.send(`${msg.channel} kiválaszva, mint csengetési csatorna.`);
            // console.log(bell);
            console.log(`${msg.channel.name} was set as bell channel`);
        }
    });
}

function cmdRemoveBellCh(client) {
    client.on("message", (msg) => {
        if (msg.author.bot) return;
        const regex = /!(?:cs[eoö]nget[ée]s|cs[eoö]ng[oöő])\s+ki\s*/i;  // !csengetés ki
        if (
            regex.test(msg.content)
        ) {
            const guildID = msg.guild.id;
            const member = msg.guild.member(msg.author); // same as `msg.member`
            if (!member.hasPermission("MANAGE_GUILD")) {
                const embed = new MessageEmbed()
                    .setColor(0xbb0000)
                    .setDescription("Nincs jogod ehhez. (\`Manage Server\` hozzáférés szükséges)");
                msg.channel.send(embed);
                console.log(`${msg.member.user.username}#${msg.member.user.discriminator} tried turning off the bell in ${msg.guild.name}, but they don't have MANAGE_GUILD permission`);
                return
            }

            bell = loadPrefs();
            if (bell[guildID] === undefined || bell[guildID]["channelID"] == undefined) {
                msg.channel.send("Nincs bekapcsolva csengetés.");
                return;
            }
            const channelID = bell[guildID]["channelID"];
            bell[guildID]["channelID"] = undefined;
            // bell[guildID]["readableName"] = undefined;
            bell[guildID]["ringRole"] = undefined;
            savePrefs(bell);
            client.channels.fetch(channelID)
                           .then(channel => {
                                msg.channel.send(`Csengetés leállítva a(z) ${channel} csatornában.`);
                                console.log(`${channel.name} is bell channel no more`);
                           })
                           .catch(err => console.log(`error happened bell.js:85 -\t${err}`));
            // console.log(bell);
        }
    });
}

function setBellRole(client) {
    client.on("message", (msg) => {
        if (msg.author.bot) return;
        const regex = /!(?:cs[eoö]nget[ée]s|cs[eoö]ng[oöő])\s+(?:role|rang)(?:\s+<@&(\d+)>)?\s*/i;  // !csengetés rang @Csengetés
        const match = msg.content.match(regex);
        if (!match) return;
        
        bell = loadPrefs();
        const roleID = match[1];
        const guildID = msg.guild.id;

        if (!roleID) {
            const ringRole = bell[guildID]["ringRole"];
            const embed = new MessageEmbed()
                .setColor(0x00bb00)
                .setDescription(ringRole ? `<@&${ringRole}> van jelenleg kiválasztva.` : "Az alapértelemzett, @everyone van kiválasztva.");
            msg.channel.send(embed);
            return;
        }

        const member = msg.guild.member(msg.author); // same as `msg.member`
        if (!member.hasPermission("MANAGE_GUILD")) {
            const embed = new MessageEmbed()
                .setColor(0xbb0000)
                .setDescription("Nincs jogod ehhez. (\`Manage Server\` hozzáférés szükséges)");
            msg.channel.send(embed);
            console.log(`${msg.member.user.username}#${msg.member.user.discriminator} tried turning off the bell in ${msg.guild.name}, but they don't have MANAGE_GUILD permission`);
            return;
        }

        if (bell[guildID] === undefined) {
            bell[guildID] = {"readableName" : msg.guild.name};
        }
        bell[guildID]["ringRole"] = roleID;
        savePrefs(bell);
        const embed = new MessageEmbed()
            .setColor(0x00bb00)
            .setDescription(`<@&${roleID}> kiválasztva, mint csengetési \`role\`.`);
        msg.channel.send(embed);
        console.log(`${msg.member.user.username}#${msg.member.user.discriminator} set <@&${roleID}> as ring role`);
    });
}

checkBell = (function() {
    let lastRingIn = 0;
    
    return function(client, timetable) {
        lastRingIn = Math.max(lastRingIn - 1, 0);
        if (lastRingIn > 0) return;
        // console.log("ring tick");
        
        const today = timetable[Utilz.getDayString()];
        const now = new Time(new Date().getHours(), new Date().getMinutes());
        // const now = new Time(10, 49);
        if (!today) return;
        let lessonsStart = [];
        for (var lesson of today) {
            if (lesson.data.start.compare(now.add(new Time(1))) == 0) {
                lessonsStart.push(lesson);
            }
        }
        if (lessonsStart.length == 0) return;

        bell = loadPrefs();
        lastRingIn = 4; // After the bell rang, it can NOT ring for this many ticks.
        const reply =
            "**" + lessonsStart.map(lesson => Utilz.capitalize(lesson.subj) + (lesson.data.elective ? " (fakt)" : "") + " " + Utilz.getMeetingURL(lesson.subj)[lesson.data.elective])
                               .reduce((a, b) => a + "**\n**" + b)
            + `**\n${lessonsStart.length > 1 ? "órák kezdődnek" : "óra kezdődik"}.`;
        const embed = new MessageEmbed()
            .setColor(0x00bb00)
            .setTitle("**Csöngő van!**")
            .setDescription(reply);
        for (var guildID in bell) {
            const channelID = bell[guildID]["channelID"];
            if (!channelID) continue;

            client.channels.fetch(channelID)
                           .then(channel => {
                               channel.send(embed);
                               if (bell[guildID]["ringRole"] === undefined) {
                                   channel.send("@everyone");
                               } else {
                                   channel.send(`<@&${bell[guildID]["ringRole"]}>`);
                               }
                               console.log(`rang the bell in ${channel.name} for classes ${lessonsStart}`);
                           })
                           .catch(err => console.log(`error happened in checkBell: -\t${err}`));
        }
    };
}());

function savePrefs(dataToSave) { // save
    const saveData = dataToSave;
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
    console.log(`loaded prefs for '${prefsFilePath}'`);
    // console.log(loadData);
    return loadData;
}

module.exports = cmdBell;
