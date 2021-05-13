import * as CoreTools from "../_core/core_tools";
import * as types from "../_core/types";
import Time from "../time";
import { Lesson, TimetableDay } from "../custom_types";
import * as Utilz from "../utilz";

const description = "Kilistázza egy adott diák jelenleg tartó, illetve a még aznap következő óráit.\n"
    + "Ha nincs megadva név, akkor a küldő Discord felhasználónevét fogja használni.";

const cmd: types.Command = {
    func: cmdNextLesson,
    name: "következő",
    aliases: [ "kövi", "next" ],
    usage: "következő [diák neve]",
    description: description,
    examples: [ "", "Ábel", "Balázs" ]
};

interface Lessons {
    current: Lesson[];
    next:    Lesson[];
}

function cmdNextLesson({ data, msg, args }: types.CombinedData) {
    const targetStudentStr = args[0] ?? (msg.member?.nickname ?? msg.author.username);
    const targetStudent = Utilz.lookupNameFromAlias(targetStudentStr);
    
    if (targetStudent === undefined) {
        CoreTools.sendEmbed(msg, "error", `Nincs rögzítve '${targetStudentStr}' nevű tagja az osztálynak.`);
        return;
    }

    const currentDate = new Date();
    const currentTime = new Time(currentDate);
    const today = data.timetable[Utilz.getDayString(currentDate)];

    const studentClasses = getStudentClassesOnDay(data, today, targetStudent);

    const lessons: Lessons = {
        current: studentClasses.filter(lesson => lesson.start < currentTime && currentTime < lesson.end),
        next: studentClasses.filter(lesson => currentTime < lesson.start)
    };
    
    const reduceFunc = (a: string, b: Lesson) =>
        a + b.start.toString() + " - " + b.end.toString() + " ║ " + b.subj + (b.elective ? " (fakt)" : "") + "\n";
    const currentLessons = lessons.current.reduce(reduceFunc, "");
    const nextLessons = lessons.next.reduce(reduceFunc, "");

    const reply = (currentLessons ? "**Jelenleg tart:**\n" + "```c\n" + currentLessons + "```" : "")
        + (nextLessons ? "**Következik:**\n" + "```c\n" + nextLessons + "```" : "")
        || "A mai tanításnak már vége van.";
    
    CoreTools.sendEmbed(msg, "neutral", reply);
    console.log(`${msg.author.username}#${msg.author.discriminator} queried ${targetStudent}'s next classes`);
}

function getStudentClassesOnDay(data: types.Data, today: TimetableDay, targetStudent: string): Lesson[] {
    const studentClasses = data.students.studentsLessons[targetStudent];
    return today.filter(lesson => studentClasses.some(x => x.subj == lesson.subj && x.elective === lesson.elective));
}

module.exports = cmd;
