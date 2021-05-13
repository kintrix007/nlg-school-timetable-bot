import { initBot } from "./_core/bot_core";
import fs from "fs";
import yaml from "yaml";
import path from "path";
import Time from "./time";
import { Timetable, TimetableDay, Lesson, LessonData, LessonsAttendants, Students, StudentsLessons } from "./custom_types";
import { TIMETABLE_DIR, STUDENTS_DIR } from "./utilz";

initBot(
    {
        defaultPrefix: "!",
        commandDirs: [
            path.join(__dirname, "commands")
        ]
    },
    {
        timetable: loadTimetableData(),
        students:  loadStudentData()
    }
);

function loadTimetableData(): Timetable {
    const daysList = ["monday", "tuesday", "wednesday", "thursday", "friday"];

    interface LessonRaw {
        subj: string;
        start: string;
        length: number;
        elective: boolean;
    }

    const timetable: Timetable = {};
    daysList.forEach(day => {
        const dayPath = path.join(TIMETABLE_DIR, `${day}.yaml`);
        
        const dayDataRaw = fs.readFileSync(dayPath).toString();
        const dayData: LessonRaw[] = yaml.parse(dayDataRaw);

        const convertedDayData : TimetableDay = dayData.map(x => {
            const lesson: Lesson = {
                subj: x.subj,
                start: new Time(x.start),
                end: new Time(x.start).add(new Time(x.length)),
                length: x.length,
                elective: x.elective
            };
            return lesson;
        }).sort((lesson1, lesson2) => Math.sign(lesson1.start.time - lesson2.start.time));
        timetable[day] = convertedDayData;
    });

    return timetable;
}

function loadStudentData(): Students {
    const rosterPath = path.join(STUDENTS_DIR, "roster.yaml");
    const rosterRaw = fs.readFileSync(rosterPath).toString();
    const roster: string[] = yaml.parse(rosterRaw);

    const lessonsPath = path.join(STUDENTS_DIR, "lessons.yaml");
    const lessonsRaw = fs.readFileSync(lessonsPath).toString();
    const lessonsStudents: LessonsAttendants = yaml.parse(lessonsRaw);

    const studentsLessonsAssocList = roster.map(student => {
        const lessons = Object.entries(lessonsStudents).map(([lesson, lessonAttendants]) => {
            const hasAsObligatory = lessonAttendants.obligatory?.includes(student);
            const hasAsElective = lessonAttendants.elective?.includes(student);
            const hasLessons: LessonData[] = [];
            if (hasAsObligatory) hasLessons.push({subj: lesson, elective: false});
            if (hasAsElective) hasLessons.push({subj: lesson, elective: true});
            return hasLessons;
        }).flat(1);
        return [student, lessons] as [string, LessonData[]];
    });
    const studentsLessons: StudentsLessons = Object.fromEntries(studentsLessonsAssocList);

    const students: Students = {
        roster: roster.sort(),
        lessonsStudents: lessonsStudents,
        studentsLessons: studentsLessons
    };

    return students;
}
