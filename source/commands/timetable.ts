import * as CoreTools from "../_core/core_tools";
import * as types from "../_core/types";
import Time from "../time";
import * as Utilz from "../utilz";
import { Message } from "discord.js";
import { report } from "node:process";

const description = "Megadja egy adott napra rögzített órarendet.\n"
    + "Ez lehet relatív is, mint `holnap`, vagy `tegnap`.\n"
    + "Ha nincs megadva nap, akkor automatikusan a mait adja meg.";

const cmd: types.Command = {
    func: cmdTimetable,
    name: "órarend",
    aliases: [ "most" ],
    usage: "órarend [nap]",
    description: description,
    examples: [ "", "tegnap", "holnap", "kedd" ]
};

function cmdTimetable({ data, msg, args }: types.CombinedData) {
    const targetDayStr = CoreTools.removeAccents(args[0]?.toLowerCase() ?? "ma");
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
        if (!Object.keys(hunDaysToNum).includes(targetDayStr)) {
            CoreTools.sendEmbed(msg, "error", `Nincs rögzítve órarend a '${targetDayStr}' nevű napra.`);
            return;
        }
        
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
        CoreTools.sendEmbed(msg, "error", "Erre a napra nincsenek rögzítve órák.");
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
            start.toString() + " - " + end.toString(),
            subj + elec + " ".repeat(subjMaxLength - subj.length - elec.length),
            (now ? "<-" : "")
        ])  .map(x => x.reduce((a, b) => a + " ║ " + b, "").trim())
            .reduce((a, b) => a + "\n" + b)
    + "\n```";

    CoreTools.sendEmbed(msg, "ok", {
        title: `**${CoreTools.capitalize(hunDayString)}:**`,
        desc:  reply
    });
    console.log(`${msg.author.username}#${msg.author.discriminator} queried the timetable for ${dayString}`);
}

module.exports = cmd;
