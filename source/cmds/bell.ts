import * as Utilz from "../classes/utilz";
import Time from "../classes/time";
import * as schedule from "node-schedule";
import * as types from "../classes/types";
import { Message, MessageEmbed, DMChannel } from "discord.js";

const PREFS_FILE = "bell.json";

const cmd: types.Command = {
    func: cmdBell,
    setupFunc: setupJobs,
    commandName: "csengetes",
    adminCommand: true,
    aliases: [ "csongetes", "csengo", "csongo" ],
    usage: "csengetés [be|ki|role] [role pingelve]",
    // description: "",
    examples: [ "", "be", "ki", "role", "role @Csengetes" ]
};

export interface BellData {
    [guildID: string]: {
        readableGuildName:      string;
        channelID:              string;
        readableChannelName:    string;
        ringRoleID?:            string;
    };
}

function cmdBell({ data, msg, argsStr }: types.CombinedData) {
    const regex = /^(be|ki|role)?(?:\s+(?:\<@&(\d+)\>|(@everyone)))?\s*$/i;
    const match = argsStr.match(regex);
    if (!match) return;

    const option = match[1];
    const isPingRoleSetter = (match[2] || match[3]) ? true : false;
    const isPingRoleResetter = match[3] ? true : false;
    const ringRoleID = isPingRoleResetter ? undefined : match[2];

    switch (option) {
    case "be":
        setBellActive(msg, true);
        break;
    case "ki":
        setBellActive(msg, false);
        break;
    case "role":
        if (isPingRoleSetter) {
            setRingRole(msg, ringRoleID);
        } else {
            getRingRole(msg);
        }
        break;
    default:
        getBellActive(msg);
        break;
    }
}

async function setupJobs(data: types.Data) {
    Object.entries(data.timetable).forEach(([dayStr, lessons]) => {
        const DaysToNum: {[day: string]: number} = {"sunday" : 0, "monday" : 1, "tuesday" : 2, "wednesday" : 3, "thursday" : 4, "friday" : 5, "saturday" : 6};
        const dayNum = DaysToNum[dayStr];
        lessons.filter((lesson, idx, list) => list.findIndex(x => x.start === lesson.start) === idx)    // remove lessons that start at the same time
            .forEach(lesson => {
                const startTime = lesson.start;

                const rule = new schedule.RecurrenceRule();
                rule.hour = startTime.hour;
                rule.minute = startTime.minute;
                rule.dayOfWeek = dayNum;
                
                schedule.scheduleJob(`${dayStr}-${lesson.subj}-${lesson.start}`, rule, ringBellConstructor(data));
            });
        console.log(`bell is set up for day '${dayStr}'`);
    });

    function ringBellConstructor(data: types.Data) {
        return function(scheduleDate: Date): void {
            const today = data.timetable[Utilz.getDayString(scheduleDate)];
            const currentTime = new Time(scheduleDate);
            if (!today) return;
    
            const lessonsStart = today.filter(lesson => lesson.start === currentTime);      // lessons that start now.
            const lessonsStrings = lessonsStart.map(lesson => {
                const subj = lesson.subj;
                const elec = (lesson.elective ? 1 : 0);
                const meetURL = Utilz.getMeetingURL(subj)[elec];
                return "**" + Utilz.capitalize(subj) + (elec ? " (fakt)" : "") + " " + meetURL + "**";
            });
    
            const reply = lessonsStrings.reduce((a, b) => a + "\n" + b) + "\n"
                + (lessonsStart.length > 1 ? "órák kezdődnek." : "óra kezdődik.");
            const embed = new MessageEmbed()
                .setColor(0x00bb00)
                .setTitle(Math.random() < 0.02 ? "Irány órára, gyerekek!" : "Csöngő van!")
                .setDescription(reply);
    
            const bell: BellData = Utilz.loadPrefs(PREFS_FILE);
    
            Object.entries(bell).forEach(([guildID, guildData]) => {
                const channelID = guildData.channelID;
                if (!channelID) return;             // bell turned off
    
                data.client.channels.fetch(channelID)
                    .then((channel: any) => {       // Channel does not have `.send` method, so it is complaining without the `any` type...
                        if (guildData.ringRoleID === undefined) {
                            channel.send("@everyone", embed);
                        } else {
                            const ringRole = `<@&${guildData.ringRoleID}>`;
                            channel.send(ringRole, embed);
                        }
                    })
                    .catch(err => console.log("ringBell error, channel does not exist:\n" + err));
            });
    
            console.log("rang the bell");
        };
    }
}

function setBellActive(msg: Message, active: boolean): void {
    if (msg.channel instanceof DMChannel) return;
    
    const guildID = msg.guild!.id;
    const bell: BellData = Utilz.loadPrefs(PREFS_FILE);
    
    if (active) {

        bell[guildID] = {
            readableGuildName:   msg.guild!.name,
            channelID:           msg.channel.id,
            readableChannelName: msg.channel.name,
            ringRoleID:          bell[guildID]?.ringRoleID
        }

        Utilz.savePrefs(PREFS_FILE, bell);
        
        const embed = new MessageEmbed()
            .setColor(0x00bb00)
            .setDescription(`Csengetési csatorna kiválasztva: ${msg.channel}`);
        msg.channel.send(embed);
        console.log(`${msg.author.username}#${msg.author.discriminator} set '#${msg.channel.name}' as the ring channel`);
    } else {
        const channelID = bell[guildID].channelID;
        const channelName = bell[guildID].readableChannelName;
        delete bell[guildID];

        Utilz.savePrefs(PREFS_FILE, bell);

        const embed = new MessageEmbed()
            .setColor(0x00bb00)
            .setDescription(`Csengetés leállítva. ~~(<#${channelID}>~~)`);
        msg.channel.send(embed);
        console.log(`${msg.author.username}#${msg.author.discriminator} stopped the bell in '#${channelName}'`);
    }
}

function getBellActive(msg: Message): void {
    if (msg.channel instanceof DMChannel) return;

    const bell: BellData = Utilz.loadPrefs(PREFS_FILE);
    const guildID = msg.guild!.id;
    const channelID = bell[guildID]?.channelID;
    
    const reply = (channelID
        ? `Jelenleg <#${channelID}> van kiválasztva mint csengetési csatorna.`
        : "Jelenleg nincs kiválasztva csengetési csatorna.");
    
    const embed = new MessageEmbed()
        .setColor(0x00bb00)
        .setDescription(reply);
    msg.channel.send(embed);
    console.log(`${msg.author.username}#${msg.author.discriminator} queried the bell channel`);
}

function setRingRole(msg: Message, ringRoleID: string | undefined) {
    if (msg.channel instanceof DMChannel) return;
    
    const bell: BellData = Utilz.loadPrefs(PREFS_FILE);
    const guildID = msg.guild!.id;
    const serverBell = bell[guildID];

    if (bell[guildID] === undefined) {
        return;
    }

    bell[guildID].ringRoleID = ringRoleID;
    
    Utilz.savePrefs(PREFS_FILE, bell);
    
    const embed = new MessageEmbed()
        .setColor(0x00bb00)
        .setDescription((ringRoleID ? `<@&${ringRoleID}>` : "@everyone") + " kiválasztva mint csengetési *role*.");
    msg.channel.send(embed);
    console.log(`${msg.author.username}#${msg.author.discriminator} set '${ringRoleID}' as the ring role`);
}

function getRingRole(msg: Message) {
    if (msg.channel instanceof DMChannel) return;

    const guildID = msg.guild!.id;
    const bell: BellData = Utilz.loadPrefs(PREFS_FILE);

    const ringRoleID = bell[guildID]?.ringRoleID;

    const reply = "A jelenleg kiválasztott csengetési *role*: " + (ringRoleID ? `<@&${ringRoleID}>`: "@everyone") + ".";

    const embed = new MessageEmbed()
        .setColor(0x00bb00)
        .setDescription(reply);
    msg.channel.send(embed);
    console.log(`${msg.author.username}#${msg.author.discriminator} queried the ring role`);
}

module.exports = cmd;
