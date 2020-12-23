const Utilz = require("../classes/utilz.js");

function cmdStudentClasses(client, timetable, students) {
    client.on("message", (msg) => {
        if (msg.author.bot) return;
        const regex = /!órák\s*([a-z\.áéíóöőúüű]+)/i
        const match = msg.content.match(regex);
        if (!match) return;

        const targetStudentStr = match[1];
        const targetStudent = Utilz.removeAccents(targetStudentStr.toLowerCase());
        if ( // check if classmate exists
            !students.roster.map(a => Utilz.removeAccents(a.toLowerCase()))
                            .includes(targetStudent)
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
                if (Utilz.removeAccents(student.toLowerCase()) == targetStudent) {
                    isTrue = true;
                    break;
                }
            }
            if (isTrue) studentClasses[0].push(lesson);
            
            // Add the lesson to list if student has it as elective
            isTrue = false;
            for (var student of lessons[lesson]["elective"]) {
                if (Utilz.removeAccents(student.toLowerCase()) == targetStudent) {
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

        msg.channel.send(`**${targetStudentStr.toUpperCase()} ÓRÁI:**\n` + reply);
    })
}

module.exports = cmdStudentClasses;