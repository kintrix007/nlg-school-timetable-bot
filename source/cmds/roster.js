const Utilz = require("../classes/utilz.js");
const { MessageEmbed } = require("discord.js");

function cmdRoster(data) {
    data.client.on("message", msg => {
        roster(data, msg);
        aliases(data, msg);
    });
}

function roster(data, msg) {
    if (msg.author.bot) return;
    const cont = Utilz.prefixless(data, msg);
    if (
        cont?.startsWith("nevsor")
    ) {
        console.log(`${msg.member.user.username}#${msg.member.user.discriminator} queried the roster`);
        let reply = Utilz.properHunNameSort(data.students.roster)
                                                            .reduce((a, b) => a + "\n" + b);
        const embed = new MessageEmbed()
            .setColor(0x00bb00)
            .setTitle("**Névsor:**")
            .setDescription(reply);
        msg.channel.send(embed);
    }
}

function aliases(data, msg) {
    if (msg.author.bot) return;
    const cont = Utilz.prefixless(data, msg);
    if (
        cont?.startsWith("becenevek")
    ) {
        console.log(`${msg.member.user.username}#${msg.member.user.discriminator} queried the roster`);
        let reply = Utilz.properHunNameSort(data.students.roster).map(name => `**${name}**` + " - " + Utilz.getNameAliases(name).reduce((a,b) => a + ", " + b))
                                                            .reduce((a, b) => a + "\n" + b);
        const embed = new MessageEmbed()
            .setColor(0x00bb00)
            .setTitle("**Becenevek:**")
            .setDescription(reply);
        msg.channel.send(embed);
    }
}

module.exports = cmdRoster;
