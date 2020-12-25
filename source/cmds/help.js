const { MessageEmbed } = require("discord.js");

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
            const reply = cmdList.reduce((a, b) => a + "\n"+ b);
            const embed = new MessageEmbed()
                .setColor(0x00bb00)
                .setTitle("**Help:**")
                .setDescription(`\`\`\`\n${reply}\`\`\``);
            msg.channel.send(embed);
        }
    });
}

module.exports = cmdHelp;
