const fs = require("fs");
const Utilz = require("./classes/utilz.js");
const Time = require("./classes/time.js");

/*
const DC = require("discord.js");

const client = new DC.Client();

function loginBot() {
    fs.readFile(".token", "ascii", (err, data) => {
        if (err) {
            throw new Error(err);
        }
        client.login(data);
    });
}
loginBot();


client.on("ready", () => {
    console.log("ready");
    client.channels.fetch("768144541931929620")
    .then(channel => {
        channel.messages.fetch("790543022718320671")
            .then(msg => {
                console.log((new Date().getTime() - msg.createdTimestamp)/1000/60/60);
            })
            .catch(console.error);
    })
    .catch(console.error);
});
*/

// fs.writeFileSync("prefs/bell.json", JSON.stringify({"asd" : 10, "haha" : 20}));

/*
function loadStudentData() {
    const roster = JSON.parse(fs.readFileSync("students/roster.json"));
    const studentsClasses = JSON.parse(fs.readFileSync("students/classes.json"));
    const studentsAliases = JSON.parse(fs.readFileSync("students/aliases.json"));
    return {
        "roster" : roster,
        "classes" : studentsClasses,
        "aliases" : studentsAliases
    };
}


console.log(Utilz.lookupNameFromAlias(loadStudentData(), "cigistudo"));
*/
