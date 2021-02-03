const Utilz = require("../classes/utilz.js");
const Time = require("../classes/time.js");
const schedule = require("node-schedule");
const { MessageEmbed } = require("discord.js");

const bellPrefs = "bell.json";

let bell = {};
// let checkInterval;

// let checkBell = function(){};   // C-style prototyping the function :P

function cmdBell(data) {
    bell = Utilz.loadPrefs(bellPrefs);
    
    data.client.on("message", msg => {
        if (msg.author.bot) return;
        const cont = Utilz.prefixless(data, msg);

        const regex = /^\s*(?:cs[eo]nget[e]s|cs[eo]ngo)(?:\s+(be|ki|role|rang)(?:\s+(?:<@&(\d+)>|(@everyone)))?)?\s*$/i;
        const match = cont?.match(regex);
        if (!match) return;

        const option = match[1];
        const isSetPingRole = (match[2] || match[3]) ? true : false;
        const isPingRoleEveryone = match[3] ? true : false;
        const pingRoleID = isPingRoleEveryone ? undefined : match[2];

        switch (option) {
            case "be":
                turnOnBell(msg);
                break;
            case "ki":
                turnOffBell(msg);
                break;
            case "role": case "rang":
                if (isSetPingRole) {
                    setRingRole(msg, pingRoleID);
                } else {
                    getRingRole(msg);
                }
                break;
            default:
                getActiveBell(msg);
                break;
        }
    });

    setupJobs(data);
    
    // checkInterval = setInterval(checkBell, 300 * 60, data.client, data.timetable);
}

function setupJobs(data) {
    Object.entries(data.timetable).forEach(([dayStr, lessons]) => {
        const DaysToNum = {"sunday" : 0, "monday" : 1, "tuesday" : 2, "wednesday" : 3, "thursday" : 4, "friday" : 5, "saturday" : 6};
        const dayNum = DaysToNum[dayStr];
        lessons.filter((lesson, idx, list) => list.findIndex(x => x.data.start.compare(lesson.data.start) === 0) === idx) // remove lessons that start at the same time
            .forEach(lesson => {
                const startTime = lesson.data.start;

                const rule = new schedule.RecurrenceRule();
                rule.hour = startTime.hour;
                rule.minute = startTime.minute;
                rule.dayOfWeek = dayNum;
                
                schedule.scheduleJob(`${dayStr}-${lesson.subj}-${lesson.data.start}`, rule, ringBellConstructor(data));
            });
    });
}

/*
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
                        channel.send("@everyone", embed);
                    } else {
                        const roleID = bell[guildID]["ringRole"];
                        channel.send(`<@&${roleID}>`, embed);
                    }
                    console.log(`rang the bell in ${channel.name} for classes ${lessonsStart}`);
                })
                .catch(err => console.log(`error happened in checkBell: -\t${err}`));
        }
    };
}());
*/

function ringBellConstructor(data) {
    // console.log("constructed bell schedule");

    return function(scheduleDate) {
        const today = data.timetable[Utilz.getDayString(scheduleDate)];
        const currentTime = new Time(scheduleDate.getHours(), scheduleDate.getMinutes());
        if (!today) return;

        const lessonsStart = today.filter(lesson => lesson.data.start.compare(now) === 0);      // lessons that start now.
        const lessonsStrings = lessonsStart.map(lesson => {
            const subj = Utilz.capitalize(lesson.subj);
            const elec = lesson.data.elective ? " (fakt)" : "";
            const meetURL = Utilz.getMeetingURL(subj)[elec ? 1 : 0];
            return "**" + subj + elec + " " + meetURL + "**";
        });

        const reply = lessonsStrings.reduce((a, b) => a + "\n" + b) + "\n"
            + (lessonsStart.length > 1 ? "órák kezdődnek." : "óra kezdődik.");
        const embed = new MessageEmbed()
            .setColor(0x00bb00)
            .setTitle(Math.random < 0.02 ? "Irány órára gyerekek!" : "Csöngő van!")
            .setDescription(reply);

        bell = Utilz.loadPrefs(bellPrefs);

        Object.entries(bell).forEach(([guildID, guildData]) => {
            const channelID = guildData.channelID;
            if (!channelID) return;     // bell turned off

            data.client.channels.fetch(channelID)
                .then(channel => {
                    if (guildData.ringRole === undefined) {
                        channel.send("@everyone", embed);
                    } else {
                        const ringRole = `<@&${guildData.ringRole}>`;
                        channel.send(ringRole, embed);
                    }
                })
                .catch(err => console.log("ringBell error, channel does not exist:\n" + err));
        });
    };
}

function turnOnBell(msg) {
    const member = msg.member;
    if (!member.hasPermission("MANAGE_GUILD")) {
        const embed = new MessageEmbed()
            .setColor(0xbb0000)
            .setDescription("Nincs jogod ehhez. (\`Manage Server\` hozzáférés szükséges)");
        msg.channel.send(embed);
        return;
    }

    bell = Utilz.loadPrefs(bellPrefs);
    const guildID = msg.guild.id;
    const guildName = msg.guild.name;
    const channelID = msg.channel.id;
    const channelName = msg.channel.name;
    
    if (bell[guildID] === undefined) {
        bell[guildID] = {"readableName" : guildName};
    }
    bell[guildID]["readableName"] = guildName;
    bell[guildID]["channelID"] = channelID;
    bell[guildID]["channelName"] = channelName;

    Utilz.savePrefs(bell, bellPrefs);
    
    const embed = new MessageEmbed()
        .setColor(0x00bb00)
        .setDescription(`${msg.channel} kiválaszva mint csengetési csatorna.`);
    msg.channel.send(embed);
    console.log(`${msg.author.username}#${msg.author.descriminator} set '#${msg.channel.name}' as the ring channel`);
}

function turnOffBell(msg) {
    const member = msg.member;
    if (!member.hasPermission("MANAGE_GUILD")) {
        const embed = new MessageEmbed()
            .setColor(0xbb0000)
            .setDescription("Nincs jogod ehhez. (\`Manage Server\` hozzáférés szükséges)");
        msg.channel.send(embed);
        return;
    }

    bell = Utilz.loadPrefs(bellPrefs);
    const guildID = msg.guild.id;
    const channelID = bell[guildID]?.channelID;

    if (!channelID) {
        const embed = new MessageEmbed()
            .setColor(0xbb0000)
            .setDescription("Nincs kiválaszva csengetési csatorna, így nem lehet kikapcsolni.");
        msg.channel.send(embed);
        return;
    }

    const channelName = bell[guildID]["channelName"];
    bell[guildID]["channelID"] = undefined;
    bell[guildID]["channelName"] = undefined;

    Utilz.savePrefs(bell, bellPrefs);
   
    const embed = new MessageEmbed()
        .setColor(0x00bb00)
        .setDescription(`Csengetés kikapcsolva a(z) <#${channelID}> csatornában.`);
    msg.channel.send(embed);
    console.log(`${msg.author.username}#${msg.author.descriminator} made '#${channelName}' a ring channel no more`);
}

function getActiveBell(msg) {
    bell = Utilz.loadPrefs(bellPrefs);
    const guildID = msg.guild.id;
    const channelID = bell[guildID]?.channelID;
    
    const reply = !channelID ?
        "Jelenleg nincs bekapcsolva csengetés." : `Jelenleg <#${channelID}> van kiválasztva mint csengetési csatorna.`;
    
    const embed = new MessageEmbed()
        .setColor(0x00bb00)
        .setDescription(reply);
    msg.channel.send(embed);
    console.log(`${msg.author.username}#${msg.author.descriminator} queried the current bell channel`);
}

function setRingRole(msg, pingRoleID) {
    const member = msg.member;
    if (!member.hasPermission("MANAGE_GUILD")) {
        const embed = new MessageEmbed()
        .setColor(0xbb0000)
        .setDescription("Nincs jogod ehhez. (\`Manage Server\` hozzáférés szükséges)");
        msg.channel.send(embed);
        return;
    }
    
    bell = Utilz.loadPrefs(bellPrefs);
    const guildID = msg.guild.id;
    
    if (bell[guildID] === undefined) {
        bell[guildID] = {"readableName" : guildName};
    }
    bell[guildID]["ringRole"] = pingRoleID;
    
    Utilz.savePrefs(bell, bellPrefs);
    
    const embed = new MessageEmbed()
    .setColor(0x00bb00)
    .setDescription((pingRoleID ? `<@&${pingRoleID}>` : "@everyone") + " kiválasztva mint csengetési *role*.");
    msg.channel.send(embed);
    console.log(`${msg.author.username}#${msg.author.descriminator} set '${pingRoleID}' as the ring role`);
}

function getRingRole(msg) {
    bell = Utilz.loadPrefs(bellPrefs);
    const guildID = msg.guild.id;
    const ringRoleID = bell[guildID]?.ringRole;

    const reply = "Jelenleg az " + (!ringRoleID ?
        "alapértelemzett, @everyone" : `<@&${ringRoleID}>`)
        + " van kiválasztva mint csengetési *role*.";
    
    const embed = new MessageEmbed()
        .setColor(0x00bb00)
        .setDescription(reply);
    msg.channel.send(embed);
    console.log(`${msg.author.username}#${msg.author.descriminator} queried the current ring role`);
}

module.exports = cmdBell;
