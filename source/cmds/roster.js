const Utilz = require("../classes/utilz.js");
const { MessageEmbed } = require("discord.js");

function cmdRoster(client, timetable, students) {
    roster(client, students);

    aliases(client, students);
}

function roster(client, students) {
    client.on("message", (msg) => {
        if (msg.author.bot) return;
        const cont = msg.content;
        if (
            cont.startsWith("!névsor") ||
            cont.startsWith("!nevsor")
        ) {
            console.log(`${msg.member.user.username}#${msg.member.user.discriminator} queried the roster`);
            let reply = Utilz.properHunNameSort(students.roster)
                                                                .reduce((a, b) => a + "\n" + b);
            const embed = new MessageEmbed()
                .setColor(0x00bb00)
                .setTitle("**Névsor:**")
                .setDescription(reply);
            msg.channel.send(embed);
        }
    });
}

function aliases(client, students) {
    client.on("message", (msg) => {
        if (msg.author.bot) return;
        const cont = msg.content;
        if (
            cont.startsWith("!becenevek")
        ) {
            console.log(`${msg.member.user.username}#${msg.member.user.discriminator} queried the roster`);
            let reply = Utilz.properHunNameSort(students.roster).map(name => `**${name}**` + " - " + Utilz.getNameAliases(name).reduce((a,b) => a + ", " + b))
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
