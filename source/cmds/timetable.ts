import * as Utilz from "../classes/utilz";
import Time from "../classes/time";
import * as types from "../classes/types";
import { Message, MessageEmbed } from "discord.js";

const description = "Megadja egy adott napra rögzített órarendet.\n" +
    "Ez lehet relatív is, mint `holnap`, vagy `tegnap`.\n" +
    "Ha nincs megadva nap, akkor automatikusan az adott napit adja meg.";

const cmd: types.Command = {
    func: cmdTimetable,
    commandName: "orarend",
    aliases: [ "most" ],
    usage: "orarend [nap]",
    description: description,
    examples: [ "", "tegnap", "holnap", "kedd" ]
};

function cmdTimetable({ data, msg, args }: types.CombinedData) {
    const targetDayStr = Utilz.removeAccents(args[0]?.toLowerCase() ?? "ma");
    const hunDaysToNum: {[day: string]: number} = {"vasarnap" : 0, "hetfo" : 1, "kedd" : 2, "szerda" : 3, "csutortok" : 4, "pentek" : 5, "szombat" : 6};
    console.log(`querying for '${targetDayStr}'...`);

    const targetDate = new Date();
    switch (targetDayStr) {
    case "ma":
        break;
    case "tegnap":
        targetDate.setDate(targetDate.getDate() - 1);
        break;
    case "holnap":
        targetDate.setDate(targetDate.getDate() + 1);
        break;
    default: {
        if (!Object.keys(hunDaysToNum).includes(targetDayStr)) return;
        
        const targetDay = hunDaysToNum[targetDayStr];
        const diff = targetDay - targetDate.getDay();
        targetDate.setDate(targetDate.getDate() + diff);
    }
    }

    sendTimetableOfDay(data, msg, targetDate);
}

function sendTimetableOfDay(data: types.Data, msg: Message, targetDate: Date) {
    const hunDayString = Utilz.getDayStringHun(targetDate);
    const dayString = Utilz.getDayString(targetDate);
    const day = data.timetable[dayString];
    const currentDate = new Date()
    const currentTime = new Time(currentDate);
    // const currentTime = new Time(8, 0);
    
    if (!day) {
        const embed = new MessageEmbed()
            .setColor(0xbb0000)
            .setDescription("Erre a napra nincsenek rögzítve órák.");
        msg.channel.send(embed);
        console.log(`${msg.author.username}#${msg.author.discriminator} tried to query the timetable for ${dayString}`);
        return;
    }    
    const table = day.map(lesson => {
        const startTime = lesson.start;
        const endTime = lesson.end;
        const subj = lesson.subj;
        const elective = (lesson.elective ? " (fakt)" : "");

        const isSameDay = currentDate.getDay() === targetDate.getDay();
        const isSameTime = startTime <= currentTime.add(new Time(5)) && currentTime <= endTime.add(new Time(5)); 
        const now = isSameTime && isSameDay

        const tableRow : [Time, Time, string, string, boolean] = [startTime, endTime, subj, elective, now];
        return tableRow;
    });

    const subjMaxLength = table.reduce((acc, [,,subj,elec]) => (subj.length + elec.length) > acc ? (subj.length + elec.length) : acc, 0);
    const reply = "```c\n" +
        table.map(([start, end, subj, elec, now]) => [
            start.toString(), end.toString(),
            subj + elec + " ".repeat(subjMaxLength - subj.length - elec.length),
            (now ? " <-" : "")
        ])  .map(x => x.reduce((a, b) => a + " ║ " + b, "").trim())
            .reduce((a, b) => a + "\n" + b)
    + "\n```";

    const embed = new MessageEmbed()
        .setColor(0x00bb00)
        .setTitle(`**${Utilz.capitalize(hunDayString)}:**`)
        .setDescription(reply);
    msg.channel.send(embed);
    console.log(`${msg.author.username}#${msg.author.discriminator} queried the timetable for ${dayString}`);
}

module.exports = cmd;
