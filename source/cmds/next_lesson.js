const Utilz = require("../classes/utilz.js");
const Time = require("../classes/time.js");
const { MessageEmbed } = require("discord.js");

function cmdNextClass(client, timetable, students) {
    client.on("message", (msg) => {
        if (msg.author.bot) return;
        const regex = /!k[öo]vetkez[őöo]\s+([a-z0-9\._áéíóöőúüű]+)\s*/i; // következő [diák neve]
        const match = msg.content.match(regex);
        if (!match) return;

        const targetStudentStr = match[1];
        const targetStudent = Utilz.lookupNameFromAlias(targetStudentStr);
        if ( // check if classmate exists
            !students.roster.includes(targetStudent)
        ) { // return if doesn't exist
            console.log(`${msg.member.user.username}#${msg.member.user.discriminator} tried to query ${targetStudentStr}'s next class, but they aren't a student`);
            const embed = new MessageEmbed()
                .setColor(0xbb0000)
                .setDescription(`Nincs rögzítve ${targetStudentStr} nevű tagja az osztálynak.`)
            msg.channel.send(embed);
            return;
        }
        
        const studentClasses = getStudentsClasses(students, targetStudent);
        const today = timetable[Utilz.getDayString()];
        const now = new Time(new Date().getHours(), new Date().getMinutes());
        if (!today) {
            console.log(`${msg.member.user.username}#${msg.member.user.discriminator} tried to query ${targetStudentStr}'s next class, but there are no classes on ${Utilz.getDayString()}`);
            const embed = new MessageEmbed()
                .setColor(0xbb0000)
                .setDescription(`**${targetStudent}** nevű tanulónak ma nincsenek órái.`);
            msg.channel.send(embed);
            return;
        }
        const classesLeft = today.filter(x => now.compare(x.data.start) < 0)
        .filter(x => (x.subj in studentClasses[0] && !x.data.elective) || (x.subj in studentClasses[1] && x.data.elective));
        const classesNow  = today.filter(x => now.compare(x.data.start) >= 0 && now.compare(x.data.start.add(new Time(x.data.length))) <= 0)
        .filter(x => (x.subj in studentClasses[0] && !x.data.elective) || (x.subj in studentClasses[1] && x.data.elective));
        
        const reply = ((classesNow.length ? "**MOST:**\n" +
            "\`\`\`c\n" + classesNow[0].data.start.toString() + " - " + classesNow[0].data.start.add(new Time(classesNow[0].data.length)).toString() + " ║ "
            + classesNow[0].subj + (classesNow[0].data.elective ? " (fakt)" : "") + "\`\`\`\n" : "") +
            (classesLeft.length ? "**KÖVETKEZŐ:**\n" +
            "\`\`\`c\n" + classesLeft[0].data.start.toString() + " - " + classesLeft[0].data.start.add(new Time(classesLeft[0].data.length)).toString() + " ║ " 
            + classesLeft[0].subj + (classesLeft[0].data.elective ? " (fakt)" : "") + "\`\`\`" : "")
            )
            || `**${targetStudent}** nevű tanulónak ma már nem lesz több órája.`;
        
        console.log(`${msg.member.user.username}#${msg.member.user.discriminator} queried ${targetStudentStr}'s next class`);
        const embed = new MessageEmbed()
            .setColor(0x00bb00)
            .setTitle(targetStudent)
            .setDescription(reply);
        msg.channel.send(embed);
    });
}

function getStudentsClasses(students, targetStudent) {
    const lessons = students.classes;
    let studentClasses = [{}, {}]; // 1st is obligatory classes, 2nd is elective classes
    for (var lesson in lessons) {
        // Add the lesson to list if student has it as obligatory
        let isTrue = false;
        for (var student of lessons[lesson]["obligatory"]) {
            if (student == Utilz.lookupNameFromAlias(targetStudent)) {
                isTrue = true;
                break;
            }
        }
        if (isTrue) studentClasses[0][lesson] = lessons[lesson];
        
        // Add the lesson to list if student has it as elective
        isTrue = false;
        for (var student of lessons[lesson]["elective"]) {
            if (student == Utilz.lookupNameFromAlias(targetStudent)) {
                isTrue = true;
                break;
            }
        }
        if (isTrue) studentClasses[1][lesson] = lessons[lesson];
    }

    return studentClasses;
}

module.exports = cmdNextClass;