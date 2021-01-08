"use strict";

const DC = require("discord.js");
const fs = require("fs");
const Time = require("./classes/time.js");

const CMDS_DIR = "./cmds";

const client = new DC.Client();

function main() {
    const timetable = loadTimetableData();
    const students = loadStudentData();

    require('events').EventEmitter.defaultMaxListeners = 15;

    client.on("ready", () => {
        console.log("-- bot ready --");
        console.log(`Current time is: ${new Time(new Date().getHours(), new Date().getMinutes())}`);
    });

    loadCmds(timetable, students);

    loginBot();
}

function loginBot() {
    fs.readFile("token", "ascii", (err, data) => {
        if (err) {
            throw new Error(err);
        }
        client.login(data);
    });
}

function loadTimetableData() {
    let rawMonday = fs.readFileSync("timetable/monday.json");
    let monday = JSON.parse(rawMonday);
    let rawTuesday = fs.readFileSync("timetable/tuesday.json");
    let tuesday = JSON.parse(rawTuesday);
    let rawWednesday = fs.readFileSync("timetable/wednesday.json");
    let wednesday = JSON.parse(rawWednesday);
    let rawThursday = fs.readFileSync("timetable/thursday.json");
    let thursday = JSON.parse(rawThursday);
    let rawFriday = fs.readFileSync("timetable/friday.json");
    let friday = JSON.parse(rawFriday);
    let days = {
        "monday" : monday,
        "tuesday" : tuesday,
        "wednesday" : wednesday,
        "thursday" : thursday,
        "friday" : friday
    };
    
    for (var dayKey in days) {
        for (var subjKey in days[dayKey]) {
            for (var i in days[dayKey][subjKey]) {
                days[dayKey][subjKey][i]["start"] = new Time(days[dayKey][subjKey][i]["start"]["h"], days[dayKey][subjKey][i]["start"]["m"]);
            }
        }
        let table = [];
        for (var subj in days[dayKey]) {
            for (var lesson of days[dayKey][subj]) {
                table.push({"data" : lesson, "subj" : subj});
            }
        }
        table.sort((a, b) => Math.sign(a["data"]["start"].time - b["data"]["start"].time));
        days[dayKey] = table;
    }

    // Converts to a different, sorted format
    /*
        The format of a day is:
        [
            {
                data : {
                    start : [Time obj],
                    length : [integer value],
                    elective : [0 or 1]
                }
                subj : [string value]}
            },
            {...},
            {...}
        ]
    */

    return days;
}

function loadStudentData() {
    const roster = JSON.parse(fs.readFileSync("students/roster.json"));
    const studentsClasses = JSON.parse(fs.readFileSync("students/classes.json"));
    return {
        "roster" : roster,
        "classes" : studentsClasses
    };
}

function loadCmds(timetable, students) {
    fs.readdir(CMDS_DIR, (err, files) => {
        if (err) {
            return;
        }
        files.forEach(file => {
            const filePath = `${CMDS_DIR}/${file}`
            const cmd = require(filePath);
            cmd(client, timetable, students);
            console.log(`loaded cmd from '${filePath}'`);
        });
    });
}


main();
