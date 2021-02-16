// import * as Utilz from "./classes/utilz";
import * as types from "./classes/types";
import * as DC from "discord.js";
import * as fs from "fs";
import * as yaml from "yaml";
import Time from "./classes/time.js";
import { createCmdsListener } from "./commands";

const client = new DC.Client();

const DEFAULT_PREFIX = "!";

function main() {
    const timetable = loadTimetableData();
    const students = loadStudentData();

    client.on("ready", () => {
        console.log("-- bot ready --");
        const currentTime = new Time(new Date());
        console.log("current time is:", currentTime.toString());
    });

    const data: types.CommandData = {
        client: client,
        timetable: timetable,
        students: students,
        defaultPrefix: DEFAULT_PREFIX
    };

    createCmdsListener(data);
    loginBot();
}

function loginBot() {
    const token = fs.readFileSync("source/token.token", "ascii");
    client.login(token);
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
        timetable[day] = convertedDayData as types.TimetableDay;
    });

    return timetable;
}

function loadStudentData(): types.Students {
    const rosterRaw = fs.readFileSync("source/students/roster.yaml").toString()
    const roster: string[] = yaml.parse(rosterRaw);
    const lessonsRaw = fs.readFileSync("source/students/lessons.yaml").toString()
    const lessons: types.LessonsAttendants = (yaml.parse(lessonsRaw));

    const students: types.Students = {
        roster: roster.sort(),
        lessons: lessons
    };

    return students;
}


main();
