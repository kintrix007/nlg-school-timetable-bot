"use strict";

const DC = require("discord.js");
const fs = require("fs");
const Utilz = require("./classes/utilz.js");
const Time = require("./classes/time.js");

const CMDS_DIR = "./cmds";

const client = new DC.Client();

const defaultPrefix = "!";
let prefixes = {};

function main() {
    const timetable = loadTimetableData();
    const students = loadStudentData();

    require('events').EventEmitter.defaultMaxListeners = 15;

    client.on("ready", () => {
        console.log("-- bot ready --");
        console.log(`current time is ${new Time(new Date().getHours(), new Date().getMinutes())}`);
    });

    const commandData = {
        defaultPrefix: defaultPrefix,
        client: client,
        timetable: timetable,
        students: students
    }

    loadCmds(commandData);
    loadSetPrefixCmd(commandData);

    loginBot();
}

function loginBot() {
    fs.readFile("token.token", "ascii", (err, data) => {
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

function loadCmds(data) {
    fs.readdir(CMDS_DIR, (err, files) => {
        if (err) {
            return;
        }
        files.forEach(file => {
            const filePath = `${CMDS_DIR}/${file}`
            const cmd = require(filePath);
            cmd(data);
            console.log(`loaded cmd from '${filePath}'`);
        });
    });
}

function loadSetPrefixCmd(data) {
    client.on("message", msg => {
        if (msg.author.bot) return;
        const cont = Utilz.prefixless(data, msg);

        const regex = /^\s*prefix(?:\s+(.+?))?\s*$/i;
        const match = cont?.match(regex);
        if (!match) return;

        prefixes = Utilz.loadPrefs("prefixes.json");
        const guildID = msg.guild.id;
        const newPrefix = match[1];

        if (!newPrefix) {
            const guildID = msg.guild.id;
            const currentPrefix = prefixes[guildID];
            const embed = new DC.MessageEmbed()
                .setColor(0x00bb00)
                .setDescription(`Jelenleg a \`${currentPrefix}\` van kiválasztva, mint prefix.`);
            msg.channel.send(embed);
            return;
        }

        if (!msg.member.hasPermission("MANAGE_GUILD")) {
            const embed = new DC.MessageEmbed()
                .setColor(0xbb0000)
                .setDescription("Nincs jogod ehhez. (\`Manage Server\` hozzáférés szükséges)");
            msg.channel.send(embed);
            return;
        }

        if (newPrefix.length > 3) {
            const embed = new DC.MessageEmbed()
                .setColor(0xbb0000)
                .setDescription(`A *prefix* hossza ne legyen hosszabb, mint \`3\`! \`"${newPrefix}"(${newPrefix.length})\``);
            msg.channel.send(embed);
            return;
        }

        prefixes[guildID] = newPrefix;
        Utilz.savePrefs(prefixes, "prefixes.json");

        const embed = new DC.MessageEmbed()
            .setColor(0x00bb00)
            .setTitle(`Mostantól \`${prefixes[guildID]}\` a prefix!`)
            .setDescription(`A prefix sikeresen átállítva.\nsegítségért: \`${prefixes[guildID]}help\``);
        msg.channel.send(embed);
    });
}


main();
