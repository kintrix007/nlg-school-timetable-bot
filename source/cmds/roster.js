const { MessageEmbed } = require("discord.js");
const Utilz = require("../classes/utilz.js");

function cmdRoster(client, timetable, students) {
    client.on("message", (msg) => {
        if (msg.author.bot) return;
        const cont = msg.content;
        if (
            cont.startsWith("!névsor") ||
            cont.startsWith("!nevsor")
        ) {
            console.log(`${msg.member.user.username}#${msg.member.user.discriminator} queried the roster`);
            let reply = Utilz.properHunNameSort(students.roster)//.map((function(){let idx = 1; return x => `${idx++}. ${idx<=10 ? " ":""}${x}`;}()))
                                                                .reduce((a, b) => a + "\n" + b);
            const embed = new MessageEmbed()
                .setColor(0x00bb00)
                .setTitle("**Névsor:**")
                .setDescription(reply);
            msg.channel.send(embed);
        }
    });
}

module.exports = cmdRoster;
