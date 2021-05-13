import * as CoreTools from "../_core/core_tools";
import Time from "../time";
import * as schedule from "node-schedule";
import * as types from "../_core/types";
import { Message, MessageEmbed, DMChannel } from "discord.js";
import { Lesson, } from "../custom_types"
import * as Utilz from "../utilz";

const description = "Be-, illetve kikapcsolja a csengetést az adott szerveren.\n"
    + "Bekapcsolásnál abban a csatornában fog csengetni, amelyikben el lett küldve a parancs.\n"
    + "Ezenkívül meg lehet adni, hogy csengetésnél meglyik *role*-t pingelje. Az alapértelmezett az @everyone.\n"
    + "Ha nem adsz meg értéket, akkor kiírja a jelenleg kiválasztott csatornát/*role*-t.";

const cmd: types.Command = {
    func: cmdBell,
    setupFunc: setupJobs,
    name: "csengetés",
    permissions: [ types.adminPermission ],
    aliases: [ "csöngetés", "csengő", "csöngő" ],
    group: "admin",
    usage: "csengetés [be|ki] [role pingelve]",
    description: description,
    examples: [ "", "be", "ki", "be @Csengetes" ]
};

const PREFS_FILE = "bell.json";
const customRingMessages = [
    "Irány órára, gyerekek!",
    "Vigyázzatok, mindenkit felírok, aki késik!",
    "Futás, futás, futás! Kezdődik az óra!"
];


export interface BellData {
    [guildID: string]: {
        readableGuildName:      string;
        channelID:              string;
        readableChannelName:    string;
        ringRoleID?:            string;
    };
}

function cmdBell({ msg, argsStr }: types.CombinedData) {
    const regex = /^(be|ki)?(?:\s+\<@&(\d+)\>)?\s*$/i;
    const match = argsStr.match(regex);
    if (!match) return;

    const option = match[1];
    const ringRoleID = match[2];

    switch (option) {
    case "be":
        setBellActive(msg, true, ringRoleID);
        break;
    case "ki":
        setBellActive(msg, false);
        break;
    default:
        getBellActive(msg);
        // getRingRole(msg);
        break;
    }
}

async function setupJobs(data: types.Data) {
    Object.entries(data.timetable).forEach(([dayStr, lessons]) => {
        const DaysToNum: {[day: string]: number} = {"sunday" : 0, "monday" : 1, "tuesday" : 2, "wednesday" : 3, "thursday" : 4, "friday" : 5, "saturday" : 6};
        const dayNum = DaysToNum[dayStr];

        const uniqueLessons: Lesson[] = [];
        lessons.forEach(lesson => {
            if (!uniqueLessons.some(x => x.start.equals(lesson.start))) {
                uniqueLessons.push(lesson);
            }
        });
        // console.log(uniqueLessons);

        uniqueLessons.forEach(lesson => {
            const startTime = lesson.start;

            const rule = new schedule.RecurrenceRule();
            rule.dayOfWeek = dayNum;
            rule.hour = startTime.hour;
            rule.minute = startTime.minute;
            
            schedule.scheduleJob(`${dayStr}-${lesson.subj}-${lesson.start}`, rule, ringBellConstructor(data));
        });
        console.log(`bell is set up for day '${dayStr}'`);
    });

    function ringBellConstructor(data: types.Data) {
        return function(scheduleDate: Date): void {
            const today = data.timetable[Utilz.getDayString(scheduleDate)];
            const currentTime = new Time(scheduleDate);
            console.log("bell schedule time:", currentTime.toString());
            if (!today) return;
    
            const lessonsStart = today.filter(lesson => lesson.start.equals(currentTime));      // lessons that start now.
            const lessonsStrings = lessonsStart.map(lesson => {
                const subj = lesson.subj;
                const elec = (lesson.elective ? 1 : 0);
                const meetURL = Utilz.getMeetingURL(subj)[elec];
                return "**" + Utilz.capitalize(subj) + (elec ? " (fakt)" : "") + " " + meetURL + "**";
            });
    
            if (lessonsStrings.length === 0) {
                console.error("tried to ring the bell, but there weren't any lessons starting at this time." + currentTime.toString());
                return;
            }

            const reply = lessonsStrings.reduce((a, b) => a + "\n" + b) + "\n"
                + (lessonsStart.length > 1 ? "órák kezdődnek." : "óra kezdődik.");
            const ringMessage = (Math.random() < 0.01
                ? customRingMessages[Math.floor(Math.random() * customRingMessages.length)]
                : "Csöngő van!");
            const embed = new MessageEmbed()
                .setColor(CoreTools.messageColors.ok)
                .setTitle(ringMessage)
                .setDescription(reply);
    
            const bell: BellData = CoreTools.loadPrefs(PREFS_FILE);
    
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

function setBellActive(msg: Message, active: boolean, ringRoleID?: string): void {
    if (msg.channel instanceof DMChannel) return;
    
    const guildID = msg.guild!.id;
    const bell: BellData = CoreTools.loadPrefs(PREFS_FILE, true);
    
    if (active) {

        bell[guildID] = {
            readableGuildName:   msg.guild!.name,
            channelID:           msg.channel.id,
            readableChannelName: msg.channel.name,
            ringRoleID:          ringRoleID
        }

        CoreTools.savePrefs(PREFS_FILE, bell);
        
        const reply = `**Csengetési csatorna kiválasztva: ${msg.channel}**\n`
            + "A csengetési *role*: " + (ringRoleID ? `<@&${ringRoleID}>` : "@everyone");
        
        CoreTools.sendEmbed(msg, "ok", reply);
        console.log(`${msg.author.username}#${msg.author.discriminator} set '#${msg.channel.name}' as the ring channel with '${ringRoleID}' as the ring role`);
    } else {
        if (!bell[guildID]) {
            CoreTools.sendEmbed(msg, "error", "Jelenleg nincs bekapcsolva csengetés, így nincs mit kikapcsolni.");
            return;
        }

        const channelID = bell[guildID].channelID;
        const channelName = bell[guildID].readableChannelName;
        delete bell[guildID];

        CoreTools.savePrefs(PREFS_FILE, bell);

        CoreTools.sendEmbed(msg, "ok", `Csengetés leállítva. ~~(<#${channelID}>~~)`);
        console.log(`${msg.author.username}#${msg.author.discriminator} stopped the bell in '#${channelName}'`);
    }
}

function getBellActive(msg: Message): void {
    if (msg.channel instanceof DMChannel) return;

    const bell: BellData = CoreTools.loadPrefs(PREFS_FILE);
    const guildID = msg.guild!.id;

    const channelID = bell[guildID]?.channelID;
    const ringRoleID = bell[guildID]?.ringRoleID;
    
    const reply = (channelID
        ? `Jelenleg <#${channelID}> van kiválasztva mint csengetési csatorna.\n`
        + "Mellé a csengetési *role*: " + (ringRoleID ? `<@&${ringRoleID}>`: "@everyone") + "."
        : "Jelenleg nincs kiválasztva csengetési csatorna.");
    
    CoreTools.sendEmbed(msg, "neutral", reply);
    console.log(`${msg.author.username}#${msg.author.discriminator} queried the bell channel and the ring role`);
}

module.exports = cmd;
