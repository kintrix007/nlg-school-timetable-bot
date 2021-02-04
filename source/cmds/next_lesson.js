const Utilz = require("../classes/utilz.js");
const Time = require("../classes/time.js");
const { MessageEmbed } = require("discord.js");

function cmdNextClass(data) {
    data.client.on("message", (msg) => {
        if (msg.author.bot) return;
        const cont = Utilz.prefixless(data, msg);

        const regex = /^\s*(?:k[öo]vetkez[őöo]|k[öo]vi)(?:\s+([a-z0-9\._áéíóöőúüű]+))?\s*$/i; // következő [diák neve]
        const match = cont?.match(regex);
        if (!match) return;

        const targetStudentStr = match[1] ?? (msg.member.nickname ?? msg.member.user.username);

        const targetStudent = Utilz.lookupNameFromAlias(targetStudentStr);
        if ( // check if classmate exists
            !data.students.roster.includes(targetStudent)
        ) { // return if doesn't exist
            const embed = new MessageEmbed()
                .setColor(0xbb0000)
                .setDescription(`Nincs rögzítve **${targetStudentStr}** nevű tagja az osztálynak.`)
            msg.channel.send(embed);
            console.log(`${msg.member.user.username}#${msg.member.user.discriminator} tried to query ${targetStudentStr}'s next class, but they aren't a student`);
            return;
        }
        
        const studentClasses = getStudentsClasses(data.students, targetStudent);
        const date = new Date();
        const today = data.timetable[Utilz.getDayString(date)];
        const now = new Time(date.getHours(), date.getMinutes());
        // const now = new Time(13, 0);
        if (!today) {
            console.log(`${msg.member.user.username}#${msg.member.user.discriminator} tried to query ${targetStudentStr}'s next class, but there are no classes on ${Utilz.getDayString(date)}`);
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
        
        const classNowData = classesNow.length ? [
            classesNow[0].data.start.toString(),
            classesNow[0].data.start.add(new Time(classesNow[0].data.length)).toString(),
            classesNow[0].subj + (classesNow[0].data.elective ? " (fakt)" : "")
        ] : [];
        const classesLeftData = classesLeft?.map(x => [
            x.data.start.toString(),
            x.data.start.add(new Time(x.data.length)).toString(),
            x.subj + (x.data.elective ? " (fakt)" : "")
        ]) ?? [];

        const reply =
            (classNowData.length ?
            "**MOST:**\n"
            + "\`\`\`c\n" +
            classNowData[0] + " - " + classNowData[1] + " ║ " + classNowData[2]
            + "\`\`\`\n" : "") + 
            (classesLeftData.length ?
            `**KÖVETKEZŐ${classesLeftData.length > 1 ? "K" : ""}:**\n`
            + "\`\`\`c\n" +
            classesLeftData.map(x => x[0] + " - " + x[1] + " ║ " + x[2]).reduce((a,b) => a + "\n" + b)
            + "\`\`\`" : "");
        
        console.log(`${msg.member.user.username}#${msg.member.user.discriminator} queried ${targetStudentStr}'s next class`);
        const embed = new MessageEmbed()
            .setColor(0x00bb00)
            .setTitle(targetStudent)
            .setDescription(reply || `**${targetStudent}** nevű tanulónak ma már nem lesz több órája.`);
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