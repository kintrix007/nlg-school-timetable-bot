const Utilz = require("../classes/utilz.js");
const Time = require("../classes/time.js");
const { MessageEmbed } = require("discord.js");

const bellPrefs = "bell.json";

let bell = {};
let checkInterval;

let checkBell = function(timetable){}; // C-style prototyping the function :P

function cmdBell(data) {
    bell = Utilz.loadPrefs(bellPrefs);

    // Admin permission required
    cmdSetBellCh(data);
    // Admin permission required
    cmdRemoveBellCh(data);
    // Admin permission required
    setBellRole(data);
    
    checkInterval = setInterval(checkBell, 300 * 60, data.client, data.timetable);
}

function cmdSetBellCh(data) {
    data.client.on("message", (msg) => {
        if (msg.author.bot) return;
        const cont = Utilz.prefixless(data, msg);
        if (!cont) return;
        const regex = /^(?:cs[eoö]nget[ée]s|cs[eoö]ng[oöő])\s+be\s*$/i; // !csengetés be
        
        if (regex.test(cont)) {
            const guildID = msg.guild.id;
            const member = msg.member;
            if (!member.hasPermission("MANAGE_GUILD")) {
                const embed = new MessageEmbed()
                    .setColor(0xbb0000)
                    .setDescription("Nincs jogod ehhez. (\`Manage Server\` hozzáférés szükséges)");
                msg.channel.send(embed);
                console.log(`${msg.member.user.username}#${msg.member.user.discriminator} tried turning off the bell in ${msg.guild.name}, but they don't have MANAGE_GUILD permission`);
                return
            }

            bell = Utilz.loadPrefs(bellPrefs);
            if (bell[guildID] === undefined) {
                bell[guildID] = {"readableName" : msg.guild.name};
            }
            bell[guildID]["readableName"] = msg.guild.name;
            bell[guildID]["channelID"] = msg.channel.id;
            Utilz.savePrefs(bell, bellPrefs);
            msg.channel.send(`${msg.channel} kiválaszva, mint csengetési csatorna.`);
            // console.log(bell);
            console.log(`${msg.channel.name} was set as bell channel`);
        }
    });
}

function cmdRemoveBellCh(data) {
    data.client.on("message", (msg) => {
        if (msg.author.bot) return;
        const cont = Utilz.prefixless(data, msg);

        if (!cont) return;
        const regex = /^(?:cs[eoö]nget[ée]s|cs[eoö]ng[oöő])\s+ki\s*$/i;  // !csengetés ki
        
        if (regex.test(cont)) {
            const guildID = msg.guild.id;
            const member = msg.member;
            if (!member.hasPermission("MANAGE_GUILD")) {
                const embed = new MessageEmbed()
                    .setColor(0xbb0000)
                    .setDescription("Nincs jogod ehhez. (\`Manage Server\` hozzáférés szükséges)");
                msg.channel.send(embed);
                console.log(`${msg.member.user.username}#${msg.member.user.discriminator} tried turning off the bell in ${msg.guild.name}, but they don't have MANAGE_GUILD permission`);
                return
            }

            bell = Utilz.loadPrefs(bellPrefs);
            if (bell[guildID] === undefined || bell[guildID]["channelID"] == undefined) {
                const embed = new MessageEmbed()
                    .setColor(0xbb0000)
                    .setDescription("Nincs bekapcsolva csengetés.");
                msg.channel.send(embed);
                return;
            }
            const channelID = bell[guildID]["channelID"];
            bell[guildID]["channelID"] = undefined;
            // bell[guildID]["readableName"] = undefined;
            // bell[guildID]["ringRole"] = undefined;
            Utilz.savePrefs(bell, bellPrefs);
            data.client.channels.fetch(channelID)
                           .then(channel => {
                                msg.channel.send(`Csengetés leállítva a(z) ${channel} csatornában.`);
                                console.log(`${channel.name} is bell channel no more`);
                           })
                           .catch(err => console.log(`error happened bell.js:85 -\t${err}`));
            // console.log(bell);
        }
    });
}

function setBellRole(data) {
    data.client.on("message", (msg) => {
        if (msg.author.bot) return;
        const cont = Utilz.prefixless(data, msg);

        const regex = /^(?:cs[eoö]nget[ée]s|cs[eoö]ng[oöő])\s+(?:role|rang)(?:\s+<@&(\d+)>)?\s*$/i;  // !csengetés rang @Csengetés
        const match = cont?.match(regex);
        if (!match) return;
        
        bell = Utilz.loadPrefs(bellPrefs);
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
        Utilz.savePrefs(bellPrefs);
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

        bell = Utilz.loadPrefs(bellPrefs);
        lastRingIn = 4; // After the bell rang, it can NOT ring for this many ticks.
        const reply =
            "**" + lessonsStart.map(lesson => Utilz.capitalize(lesson.subj) + (lesson.data.elective ? " (fakt)" : "") + " " + Utilz.getMeetingURL(lesson.subj)[lesson.data.elective])
                               .reduce((a, b) => a + "**\n**" + b)
            + `**\n${lessonsStart.length > 1 ? "órák kezdődnek" : "óra kezdődik"}.`;
        const embed = new MessageEmbed()
            .setColor(0x00bb00)
            .setTitle("**Csöngő van!**")
            .setDescription(reply);
        for (const guildID in bell) {
            const channelID = bell[guildID]["channelID"];
            if (!channelID) continue;

            // console.log(bell);
            client.channels.fetch(channelID)
                .then(channel => {
                    if (bell[guildID]["ringRole"] === undefined) {
                        channel.send(embed, "@everyone");
                    } else {
                        const roleID = bell[guildID]["ringRole"];
                        channel.send(embed, `<@&${roleID}>`);
                    }
                    console.log(`rang the bell in ${channel.name} for classes ${lessonsStart}`);
                })
                .catch(err => console.log(`error happened in checkBell: -\t${err}`));
        }
    };
}());

module.exports = cmdBell;
