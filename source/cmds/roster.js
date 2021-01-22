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
            Utilz.removeAccents(cont.toLowerCase()).startsWith("!névsor")
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
            Utilz.removeAccents(cont.toLowerCase()).startsWith("!becenevek")
        ) {
            console.log(`${msg.member.user.username}#${msg.member.user.discriminator} queried the roster`);
            let reply = Utilz.properHunNameSort(students.roster).map(name => `**${name}**` + " - " + Utilz.getNameAliases(name).reduce((a,b) => a + ", " + b))
                                                                .reduce((a, b) => a + "\n" + b);
            const embed = new MessageEmbed()
                .setColor(0x00bb00)
                .setTitle("**Becenevek:**")
                .setDescription(reply);
            msg.channel.send(embed);
        }
    });
}

module.exports = cmdRoster;
