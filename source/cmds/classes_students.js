const Utilz = require("../classes/utilz.js");

function cmdClassStudents(client, timetable, students) {
    client.on("message", (msg) => {
        if (msg.author.bot) return;
        const regex = /!tanul[óo]k\s*([a-z0-9_áéíóöőúüű]+)\s*/i; // !tanulók [óra neve]
        const match = msg.content.match(regex);
        if (!match) return;

        const targetLessonStr = match[1];
        const targetLesson = Utilz.removeAccents(targetLessonStr.toLowerCase());

        if (!(targetLesson in students["classes"])) {
            // return if class doesn't exist
            console.log(`${msg.member.user.username}#${msg.member.user.discriminator} tried to query the students of class ${targetLesson}, but this class doesn't exist`);
            msg.channel.send(`Nincs rögzítve ${targetLesson} nevű tantárgy.`);
            return;
        }
        console.log(`${msg.member.user.username}#${msg.member.user.discriminator} queried the students of class ${targetLesson}`);

        let studentClasses = [students.classes[targetLesson]["obligatory"], students.classes[targetLesson]["elective"]];
        let reply = (studentClasses[0].length ? "**ALAP:**\n" + Utilz.properHunNameSort(studentClasses[0]).reduce((a, b) => a + ", " + b)
                    + "\n" : "") +
                    (studentClasses[1].length ? "**FAKT:**\n" + Utilz.properHunNameSort(studentClasses[1]).reduce((a, b) => a + ", " + b) : "");
        msg.channel.send(reply);
    });
}

module.exports = cmdClassStudents;