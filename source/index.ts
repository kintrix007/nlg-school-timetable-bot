// import * as Utilz from "./classes/utilz";
// import * as types from "./classes/types";
// import * as DC from "discord.js";
// import * as fs from "fs";
// import * as yaml from "yaml";
import { Client } from "discord.js";
import { readFileSync } from "fs";
import { types } from "util";
import { parse } from "yaml";
import Time from "./classes/time";
import { Data, LessonData, LessonsAttendants, Students, Timetable, TimetableDay } from "./classes/types";
import { createCmdsListener } from "./commands";

const client = new Client();

const DEFAULT_PREFIX = "!";
const CMDS_DIR = "build/cmds";

function main() {
    const timetable = loadTimetableData();
    const students = loadStudentData();

    client.on("ready", () => {
        console.log("-- bot ready --");
        const currentTime = new Time(new Date());
        console.log("current time is:", currentTime.toString());
    });

    const data: Data = {
        client: client,
        timetable: timetable,
        students: students,
        defaultPrefix: DEFAULT_PREFIX
    };

    createCmdsListener(data, CMDS_DIR);
    loginBot();
}

function loginBot() {
    const token = readFileSync("source/token.token", "ascii");
    client.login(token);
}

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
        const dayDataRaw = readFileSync(`source/timetable/${day}.yaml`).toString();
        const dayData: LessonRaw[] = parse(dayDataRaw);
        const convertedDayData : TimetableDay = dayData.map(x => {
            const lesson: LessonData = {
                subj: x.subj,
                start: new Time(x.start),
                end: new Time(x.start).add(new Time(x.length)),
                length: x.length,
                elective: x.elective
            };
            return lesson;
        }).sort((lesson1, lesson2) => Math.sign(lesson1.start.time - lesson2.start.time));
        timetable[day] = convertedDayData as TimetableDay;
    });

    return timetable;
}

function loadStudentData(): Students {
    const rosterRaw = readFileSync("source/students/roster.yaml").toString()
    const roster: string[] = parse(rosterRaw);
    const lessonsRaw = readFileSync("source/students/lessons.yaml").toString()
    const lessons: LessonsAttendants = (parse(lessonsRaw));

    const students: Students = {
        roster: roster.sort(),
        lessons: lessons
    };

    return students;
}


main();
