const cmdList = [
    "!help",
    "!csengetés [be/ki]",
    "!névsor",
    "!órarend",
    "!órák [diák neve]",
    "!tanulók [óra neve]",
    "!következő [diák neve]"
];

function cmdHelp(client, timetable, students) {
    client.on("message", (msg) => {
        if (msg.author.bot) return;
        const cont = msg.content;
        if (
            cont.startsWith("!help")
        ) {
            let reply = cmdList.reduce((a, b) => a + "\n"+ b);
            msg.channel.send("\`\`\`fix\n" + reply + "\`\`\`");
            console.log(msg);
        }
    });
}

module.exports = cmdHelp;
