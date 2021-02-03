const Utilz = require("../classes/utilz.js");
const { MessageEmbed } = require("discord.js");

function cmdClassStudents(data) {
    data.client.on("message", (msg) => {
        if (msg.author.bot) return;
        const cont = Utilz.prefixless(data, msg);

        const regex = /^tanul[óo]k\s+([a-z0-9_áéíóöőúüű]+)\s*$/i; // !tanulók [óra neve]
        const match = cont?.match(regex);
        if (!match) return;

        const targetLessonStr = match[1];
        const targetLesson = Utilz.removeAccents(targetLessonStr.toLowerCase());

        if (!(targetLesson in data.students["classes"])) {
            // return if class doesn't exist
            console.log(`${msg.member.user.username}#${msg.member.user.discriminator} tried to query the students of class ${targetLesson}, but this class doesn't exist`);
            const embed = new MessageEmbed()
                .setColor(0xbb0000)
                .setDescription(`Nincs rögzítve ${targetLesson} nevű tantárgy.`);
            msg.channel.send(embed);
            return;
        }
        console.log(`${msg.member.user.username}#${msg.member.user.discriminator} queried the students of class ${targetLesson}`);

        const studentClasses = [
            data.students.classes[targetLesson]["obligatory"],
            data.students.classes[targetLesson]["elective"]
        ];
        const reply = (studentClasses[0].length ? "**Alap:**\n" + Utilz.properHunNameSort(studentClasses[0]).reduce((a, b) => a + "\n" + b)
                    + "\n\n" : "") +
                    (studentClasses[1].length ? "**Fakt:**\n" + Utilz.properHunNameSort(studentClasses[1]).reduce((a, b) => a + "\n" + b) : "");
        const embed = new MessageEmbed()
            .setColor(0x00bb00)
            .setDescription(reply)
        msg.channel.send(embed);
    });
}

module.exports = cmdClassStudents;