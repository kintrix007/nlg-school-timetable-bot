const Utilz = require("../classes/utilz.js");
const Time = require("../classes/time.js");
const { MessageEmbed } = require("discord.js");

function cmdTimetable(client, timetable, students) {
    client.on("message", (msg) => {
        if (msg.author.bot) return;
        const cont = msg.content;
        if (
            cont.startsWith("!órarend") ||
            cont.startsWith("!orarend")
        ) {
            const today = timetable[Utilz.getDayString()];
            if (!today) {
                console.log(`${msg.author} tried getting the timetable for ${Utilz.getDayString()}`);
                const embed = new MessageEmbed()
                    .setColor(0xbb0000)
                    .setDescription("Erre a napra nincsenek órák rögzítve.");
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
            table = table.map((a) => [`| ${a[0]}`, `${a[1]}${" ".repeat(subjMaxWidth - a[1].length)}`, a[2]]);
            
            const reply = table.map((a) => a[0] + " | " + a[1] + " | " + a[2])
                               .reduce((a, b) => a + "\n" + b);
            const embed = new MessageEmbed()
                .setColor(0x00bb00)
                .setTitle(`**${Utilz.capitalize(Utilz.getDayStringHun())}:**`)
                .setDescription(`\`\`\`c\n${reply}\`\`\``);
            msg.channel.send(embed);
        }
    });
}

module.exports = cmdTimetable;