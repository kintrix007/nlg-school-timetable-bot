const Utilz = require("../classes/utilz.js");

function cmdStudentClasses(client, timetable, students) {
    client.on("message", (msg) => {
        if (msg.author.bot) return;
        const regex = /![óo]r[áa]k\s*([a-z0-9\._áéíóöőúüű]+)\s*/i // !órák [diák neve]
        const match = msg.content.match(regex);
        if (!match) return;

        const targetStudentStr = match[1];
        const targetStudent = Utilz.lookupNameFromAlias(targetStudentStr);
        if ( // check if classmate exists
            !students.roster.includes(targetStudent)
        ) { // return if doesn't exist
            console.log(`${msg.member.user.username}#${msg.member.user.discriminator} tried to query ${targetStudentStr}'s classes, but they aren't a student`);
            msg.channel.send(`Nincs rögzítve ${targetStudentStr} nevű tagja az osztálynak.`);
            return;
        }

        console.log(`${msg.member.user.username}#${msg.member.user.discriminator} queried ${targetStudentStr}'s classes`);
        const lessons = students.classes;
        let studentClasses = [[], []]; // 1st is obligatory classes, 2nd is elective classes
        for (var lesson in lessons) {
            // Add the lesson to list if student has it as obligatory
            let isTrue = false;
            for (var student of lessons[lesson]["obligatory"]) {
                if (student == Utilz.lookupNameFromAlias(targetStudent)) {
                    isTrue = true;
                    break;
                }
            }
            if (isTrue) studentClasses[0].push(lesson);
            
            // Add the lesson to list if student has it as elective
            isTrue = false;
            for (var student of lessons[lesson]["elective"]) {
                if (student == Utilz.lookupNameFromAlias(targetStudent)) {
                    isTrue = true;
                    break;
                }
            }
            if (isTrue) studentClasses[1].push(lesson);
        }

        const reply = (studentClasses[0].length ? studentClasses[0].sort().reduce((a, b) => a + ", " + b)
                      + "\n" : "") +
                      (studentClasses[1].length ? studentClasses[1].map(a => a + " (fakt)")
                                       .sort().reduce((a, b) => a + ", " + b) : "");

        msg.channel.send(`**${targetStudent} órái:**\n` + reply);
    })
}

module.exports = cmdStudentClasses;