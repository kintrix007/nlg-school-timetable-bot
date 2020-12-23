function cmdRoster(client, timetable, students) {
    client.on("message", (msg) => {
        if (msg.author.bot) return;
        const cont = msg.content;
        if (
            cont.startsWith("!névsor") ||
            cont.startsWith("!nevsor")
        ) {
            let reply = students.roster.reduce((a, b) => a + ", " + b);
            msg.channel.send(reply);
        }
    });
}

module.exports = cmdRoster;
