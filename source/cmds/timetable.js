const Utilz = require("../classes/utilz.js");
const Time = require("../classes/time.js");
const { MessageEmbed } = require("discord.js");

function cmdTimetable(data) {
    data.client.on("message", (msg) => {
        if (msg.author.bot) return;
        const cont = Utilz.prefixless(data, msg);

        const regex = /^\s*(?:[oó]rarend|most)(?:\s+([a-zA-Z]+))?\s*$/i;   // !órarend [nap] - !most
        const match = cont?.match(regex);
        if (!match) return;

        const targetDayStrRaw = match[1];
        const targetDayStr = Utilz.removeAccents(targetDayStrRaw?.toLowerCase() ?? "ma");
        console.log(`querying for '${targetDayStr}'...`);

        
        const hunDaysToNum = {"vasarnap" : 0, "hetfo" : 1, "kedd" : 2, "szerda" : 3, "csutortok" : 4, "pentek" : 5, "szombat" : 6};
        const date = new Date();
        if (targetDayStr === "ma") {
            // we don't need to change a thing ._.
        } else
        if (targetDayStr === "tegnap") {
            date.setDate(date.getDate() - 1);
        } else
        if (targetDayStr === "holnap") {
            date.setDate(date.getDate() + 1);
        } else
        if (Object.keys(hunDaysToNum).includes(targetDayStr)) {
            const targetDay = hunDaysToNum[targetDayStr];
            const diff = targetDay - date.getDay();
            date.setDate(date.getDate() + diff);
        } else return;

        sendTimetableOfDay(data, msg, date);
    });
}

function sendTimetableOfDay(data, msg, targetDate) {
    const hunDayString = Utilz.getDayStringHun(targetDate)
    const dayString = Utilz.getDayString(targetDate)
    const day = data.timetable[dayString];
    if (!day) {
        console.log(`${msg.author.username}#${msg.author.discriminator} tried to query the timetable for ${dayString}`);
        const embed = new MessageEmbed()
            .setColor(0xbb0000)
            .setDescription("Erre a napra nincsenek rögzítve órák.");
        msg.channel.send(embed);
        return;
    }
    console.log(`${msg.author.username}#${msg.author.discriminator} queried the timetable for ${dayString}`);
    
    const table = day.map(lesson => {
        const startTime = lesson.data.start;
        let lessonLength = new Time(lesson.data.length);
        const endTime = startTime.add(lessonLength);
        const subj = lesson.subj;
        const elective = lesson.data.elective ? " (fakt)" : "";
        let date = new Date();
        let currentTime = new Time(date.getHours(), date.getMinutes());
        // let currentTime = new Time(12, 32);
        let isSameDay = date.getDay() === targetDate.getDay();
        let isSameTime = currentTime.compare(startTime) >= 0 && currentTime.compare(endTime.add(new Time(5))) <= 0; 
        const now = isSameTime && isSameDay ? " <== most" : "";
        return [startTime, endTime, subj, elective, now];
    });

    const subjMaxLength = table.reduce((acc, [,,subj,elec]) => (subj.length + elec.length) > acc ? (subj.length + elec.length) : acc, 0);
    const reply = "```c\n" +
        table.map(([start, end, subj, elec, now]) => [
            start.toString(), end.toString(),
            subj + elec + " ".repeat(subjMaxLength - subj.length - elec.length),
            now
        ])  .map(x => x.reduce((a, b) => a + " ║ " + b, "║ "))
            .reduce((a, b) => a + "\n" + b)
    + "\n```";

    const embed = new MessageEmbed()
        .setColor(0x00bb00)
        .setTitle(`**${Utilz.capitalize(hunDayString)}:**`)
        .setDescription(reply);
    msg.channel.send(embed);
}

module.exports = cmdTimetable;