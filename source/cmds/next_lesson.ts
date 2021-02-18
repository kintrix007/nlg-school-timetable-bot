import * as Utilz from "../classes/utilz";
import * as types from "../classes/types";
import Time from "../classes/time";
import { MessageEmbed } from "discord.js";

const description = "Kilistázza egy adott diák jelenleg tartó, illetve a még aznap következő óráit.\n" +
    "Ha nincs megadva név, akkor a küldő Discord felhasználónevét fogja használni.";

const cmd: types.Command = {
    func: cmdNextLesson,
    commandName: "kovetkezo",
    aliases: [ "kovi", "next" ],
    usage: "következő [diák neve]",
    description: description,
    examples: [ "", "Ábel", "Balázs" ]
};

interface Lessons {
    current: types.Lesson[];
    next:    types.Lesson[];
}

function cmdNextLesson({ data, msg, args }: types.CombinedData) {
    const targetStudentStr = args[0] ?? (msg.member?.nickname ?? msg.author.username);
    const targetStudent = Utilz.lookupNameFromAlias(targetStudentStr);
    
    if (targetStudent === undefined) {
        const embed = new MessageEmbed()
            .setColor(0xbb0000)
            .setDescription(`Nincs rögzítve '${targetStudentStr}' nevű tagja az osztálynak.`);
        msg.channel.send(embed);
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
    
    const reduceFunc = (a: string, b: types.Lesson) => a + b.start.toString() + " ║ " + Utilz.capitalize(b.subj) + (b.elective ? " (fakt)" : "") + "\n";

    const reply = "**Jelenleg tart:**\n" + "```c\n" +
        lessons.current.reduce(reduceFunc, "") + "```" +
        "\n**Következik:**\n" + "```c\n" +
        lessons.next.reduce(reduceFunc, "") + "```";
    const embed = new MessageEmbed()
        .setColor(0x00bb00)
        .setTitle(`${targetStudent}:`)
        .setDescription(reply);
    msg.channel.send(embed);
    console.log(`${msg.author.username}#${msg.author.discriminator} queried ${targetStudent}'s next classes`);
}

function getStudentClassesOnDay(data: types.Data, today: types.TimetableDay, targetStudent: string): types.Lesson[] {
    const studentClasses = data.students.studentsLessons[targetStudent];
    return today.filter(lesson => studentClasses.some(x => x.subj == lesson.subj && x.elective === lesson.elective));
}

module.exports = cmd;
