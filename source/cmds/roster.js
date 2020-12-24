const Utilz = require("../classes/utilz.js");

function cmdRoster(client, timetable, students) {
    client.on("message", (msg) => {
        if (msg.author.bot) return;
        const cont = msg.content;
        if (
            cont.startsWith("!névsor") ||
            cont.startsWith("!nevsor")
        ) {
            let reply = Utilz.properHunNameSort(students.roster).reduce((a, b) => a + ", " + b);
            console.log(`${msg.member.user.username}#${msg.member.user.discriminator} queried the roster`);
            msg.channel.send(reply);
        }
    });
}

module.exports = cmdRoster;
