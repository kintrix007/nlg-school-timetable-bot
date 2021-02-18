import * as Utilz from "./classes/utilz";
import * as types from "./classes/types";
import Time from "./classes/time";
import { createCmdsListener } from "./commands";
import * as fs from "fs";
import * as yaml from "yaml";
import * as DC from "discord.js";

const client = new DC.Client();

const DEFAULT_PREFIX = "!";
const CMDS_DIR = `${__dirname}/cmds`;
console.log(CMDS_DIR);

function main() {
    const timetable = loadTimetableData();
    const students = loadStudentData();

    client.on("ready", () => {
        console.log("-- bot successfully authenticated --");
    });

    const data: types.Data = {
        client: client,
        timetable: timetable,
        students: students,
        defaultPrefix: DEFAULT_PREFIX
    };

    loginBot()
    .then(() => {
        createCmdsListener(data, CMDS_DIR);
        const currentTime = new Time(new Date());
        console.log("current time is:", currentTime.toString());
        console.log("-- bot ready --");
    });
}

async function loginBot() {
    console.log("-- authenticating bot... --");
    const token = fs.readFileSync("source/token.token").toString();
    await client.login(token);
}

function loadTimetableData(): types.Timetable {
    const daysList = ["monday", "tuesday", "wednesday", "thursday", "friday"];

    interface LessonRaw {
        subj: string;
        start: string;
        length: number;
        elective: boolean;
    }

    const timetable: types.Timetable = {};
    daysList.forEach(day => {
        const dayDataRaw = fs.readFileSync(`source/timetable/${day}.yaml`).toString();
        const dayData: LessonRaw[] = yaml.parse(dayDataRaw);
        const convertedDayData : types.TimetableDay = dayData.map(x => {
            const lesson: types.Lesson = {
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

function loadStudentData(): types.Students {
    const rosterRaw = fs.readFileSync("source/students/roster.yaml").toString()
    const roster: string[] = yaml.parse(rosterRaw);
    const lessonsRaw = fs.readFileSync("source/students/lessons.yaml").toString()
    const lessonsStudents: types.LessonsAttendants = yaml.parse(lessonsRaw);
    const studentsLessons: types.StudentsLessons = {};

    roster.forEach(student => {
        const lessons = Object.entries(lessonsStudents).map(([lesson, lessonAttendants]) => {
            const hasAsObligatory = lessonAttendants.obligatory?.includes(student);
            const hasAsElective = lessonAttendants.elective?.includes(student);
            const hasLessons: types.LessonData[] = [];
            if (hasAsObligatory) hasLessons.push({subj: lesson, elective: false});
            if (hasAsElective) hasLessons.push({subj: lesson, elective: true});
            return hasLessons;
        }).reduce((a, b) => [...a, ...b], []);
        studentsLessons[student] = lessons;
    });

    const students: types.Students = {
        roster: roster.sort(),
        lessonsStudents: lessonsStudents,
        studentsLessons: studentsLessons
    };

    return students;
}


main();
