const Utilz = require("../classes/utilz.js");
const Time = require("../classes/time.js");

function cmdNextClass(client, timetable, students) {
    client.on("message", (msg) => {
        if (msg.author.bot) return;
        const regex = /!következő\s*([a-z\.áéíóöőúüű]+)/i;
        const match = msg.content.match(regex);
        if (!match) return;

        const targetStudentStr = match[1];
        const targetStudent = Utilz.removeAccents(targetStudentStr.toLowerCase());
        if ( // check if classmate exists
            !students.roster.map(a => Utilz.removeAccents(a.toLowerCase()))
                            .includes(targetStudent)
        ) { // return if doesn't exist
            console.log(`${msg.member.user.username}#${msg.member.user.discriminator} tried to query ${targetStudentStr}'s next class, but they aren't a student`);
            msg.channel.send(`Nincs rögzítve ${targetStudentStr} nevű tagja az osztálynak`);
            return;
        }
        console.log(`${msg.member.user.username}#${msg.member.user.discriminator} queried ${targetStudentStr}'s next class`);
        
        const studentClasses = getStudentsClasses(students, targetStudent);
        const today = timetable[Utilz.getDayString()];
        const now = new Time(new Date().getHours(), new Date().getMinutes());
        const classesLeft = today.filter(x => now.compare(x.data.start) < 0)
                                 .filter(x => (x.subj in studentClasses[0] && !x.data.elective) || (x.subj in studentClasses[1] && x.data.elective));
        const classesNow  = today.filter(x => now.compare(x.data.start) >= 0 && now.compare(x.data.start.add(new Time(x.data.length))) <= 0)
                                 .filter(x => (x.subj in studentClasses[0] && !x.data.elective) || (x.subj in studentClasses[1] && x.data.elective));
        const reply = ((classesNow.length ? "**MOST:**\n" + classesNow[0].subj + (classesNow[0].data.elective ? " (fakt)" : "")
                      + "\n" : "") +
                      (classesLeft.length ? "**KÖVETKEZŐ:**\n" + classesLeft[0].subj + (classesLeft[0].data.elective ? " (fakt)" : "") : "")
                      ) || `${targetStudentStr} nevű tanulónak ma már nem lesz több órája`;
        
        msg.channel.send(reply);
    });
}

function getStudentsClasses(students, targetStudent) {
    const lessons = students.classes;
    let studentClasses = [{}, {}]; // 1st is obligatory classes, 2nd is elective classes
    for (var lesson in lessons) {
        // Add the lesson to list if student has it as obligatory
        let isTrue = false;
        for (var student of lessons[lesson]["obligatory"]) {
            if (Utilz.removeAccents(student.toLowerCase()) == targetStudent) {
                isTrue = true;
                break;
            }
        }
        if (isTrue) studentClasses[0][lesson] = lessons[lesson];
        
        // Add the lesson to list if student has it as elective
        isTrue = false;
        for (var student of lessons[lesson]["elective"]) {
            if (Utilz.removeAccents(student.toLowerCase()) == targetStudent) {
                isTrue = true;
                break;
            }
        }
        if (isTrue) studentClasses[1][lesson] = lessons[lesson];
    }

    return studentClasses;
}

module.exports = cmdNextClass;