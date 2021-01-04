const Utilz = require("../classes/utilz.js");
const Time = require("../classes/time.js");
const { MessageEmbed } = require("discord.js");

const hunDaysNumDict = {"vasarnap" : 0, "hetfo" : 1, "kedd" : 2, "szerda" : 3, "csutortok" : 4, "pentek" : 5, "szombat" : 6};

function cmdTimetable(client, timetable, students) {
    client.on("message", (msg) => {
        if (msg.author.bot) return;
        const regex = /![oó]rarend(?:\s+([a-zA-Záéíóöőúüű]+))?/i; // !órarend [nap]
        const match = msg.content.match(regex);
        if (!match) return;

        const targetDayStr = match[1];
        let targetDay = Utilz.removeAccents(targetDayStr?.toLowerCase() ?? "ma");
        console.log(`querying for '${targetDay}'...`);
        if (targetDay == "ma") {
            sendTodayTimetable(msg, timetable);
            return;
        } else if (targetDay == "holnap") {
            targetDay = Utilz.getDayStringFromNum(new Date().getDay() + 1);
        } else if (targetDay == "tegnap") {
            targetDay = Utilz.getDayStringFromNum(new Date().getDay() - 1);
        } else if (Object.keys(hunDaysNumDict).includes(targetDay)) {
            targetDay = Utilz.getDayStringFromNum(hunDaysNumDict[targetDay]);
        }

        sendTimetableOfDay(msg, timetable, targetDay);
    });
}

function sendTodayTimetable(msg, timetable) {
    const today = timetable[Utilz.getDayString()];
    if (!today) {
        console.log(`${msg.member.user.username}#${msg.member.user.discriminator} tried to query the timetable for ${Utilz.getDayString()}`);
        const embed = new MessageEmbed()
            .setColor(0xbb0000)
            .setDescription("**A mai napra nincsenek rögzítve órák.**");
        msg.channel.send(embed);
        return;
    }
    console.log(`${msg.member.user.username}#${msg.member.user.discriminator} queried the timetable for ${Utilz.getDayString()}`);
    
    const now = new Time(new Date().getHours(), new Date().getMinutes());
    let table = [];
    for (var lesson of today) {
        const startTime = lesson.data.start;
        const lessonLength = new Time(lesson.data.length);
        const endTime = startTime.add(lessonLength);
        table.push([
            `${startTime.toString()} - ${endTime.toString()}`,
            `${lesson.subj}${lesson.data["elective"] ? " (fakt)" : ""}`,
            now.add(new Time(5)).compare(startTime) >= 0 && now.compare(endTime) <= 0 ?
            "<-- most" : ""
        ]);
    }
    const subjMaxWidth = table.reduce((a, b) => a[1].length >= b[1].length ? a : b)[1].length;
    table = table.map((a) => [`║ ${a[0]}`, `${a[1]}${" ".repeat(subjMaxWidth - a[1].length)}`, a[2]]);
    
    const reply = table.map((a) => a[0] + " ║ " + a[1] + " ║ " + a[2])
                        .reduce((a, b) => a + "\n" + b);
    const embed = new MessageEmbed()
        .setColor(0x00bb00)
        .setTitle(`**${Utilz.capitalize(Utilz.getDayStringHun())}:**`)
        .setDescription(`\`\`\`c\n${reply}\`\`\``);
    msg.channel.send(embed);
}

function sendTimetableOfDay(msg, timetable, dayString) {
    const today = timetable[dayString];
    if (!today) {
        console.log(`${msg.member.user.username}#${msg.member.user.discriminator} tried to query the timetable for ${dayString}`);
        const embed = new MessageEmbed()
            .setColor(0xbb0000)
            .setDescription("**Erre a napra nincsenek rögzítve órák.**");
        msg.channel.send(embed);
        return;
    }
    console.log(`${msg.member.user.username}#${msg.member.user.discriminator} queried the timetable for ${dayString}`);
    
    let table = [];
    for (var lesson of today) {
        const startTime = lesson.data.start;
        const lessonLength = new Time(lesson.data.length);
        const endTime = startTime.add(lessonLength);
        table.push([
            `${startTime.toString()} - ${endTime.toString()}`,
            `${lesson.subj}${lesson.data["elective"] ? " (fakt)" : ""}`
        ]);
    }
    const subjMaxWidth = table.reduce((a, b) => a[1].length >= b[1].length ? a : b)[1].length; // [0] is time, [1] is subject name
    table = table.map((a) => [`║ ${a[0]}`, `${a[1]}${" ".repeat(subjMaxWidth - a[1].length)}`]); // preprocessing the list, done uglily...
    
    const reply = table.map((a) => a[0] + " ║ " + a[1] + " ║")
                        .reduce((a, b) => a + "\n" + b);
    const embed = new MessageEmbed()
        .setColor(0x00bb00)
        .setTitle(`**${Utilz.capitalize(Utilz.translateDayStringToHun(dayString))}:**`)
        .setDescription(`\`\`\`c\n${reply}\`\`\``);
    msg.channel.send(embed);
}

module.exports = cmdTimetable;