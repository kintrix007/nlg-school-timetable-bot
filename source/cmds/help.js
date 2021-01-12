const Utilz = require("../classes/utilz.js");
const { MessageEmbed } = require("discord.js");

const cmdList = {
    "!help [parancs neve]" : "Megadja az adott parancs használati módját.\n\n**pl. `!help órák`**",
    "!órarend [nap]" : "Megadja a napi órarendet. Opcionálisan választható, hogy melyik napot\n\n**pl. `!órarend`, `!órarend holnap`, `!órarend csütörtök`**",
    "!névsor" : "Kiírja a névsort.\n\n**pl. `!névsor`**",
    // "!becenevek" : "Kiírja a névsort, mellé azt is, hogy még hogyan lehet hivatkozni az adott emberre.\n\n**pl. `!bevenevek`**",
    "!következő [diák neve]" : "Megadja, hogy mi lesz az adott diák következő órája.\n\n**pl. `!következő Ábel`**",
    "!kövi (lásd -> !következő)" : "Lásd:  `!következő`",
    "!órák [diák neve]" : "Listázza az összes órát amire az adott diák jár.\n\n**pl. `!órák Ábel`**",
    "!tanulók [óra neve]" : "Listázza az összes diákot, aki részt vesz az adott órán.\n\n**pl. `!tanulók fizika`**",
    "!csengetés [be/ki/rang]" : "Be-, illetve kikapcsolja a csengetést az adott csatornán.\nBeállítható, hogy melyik `role` legyen pingelve csengetéskor.\n(használatához `Manage Server` jog szükséges)\n\n**pl. `!csengetés be`, `!csengetés rang @Suli`**",
    "!csöngő (lásd -> !csengetés)" : "Lásd:  `!csengetés`",
    "!csengess [be/ki]" : "Be-, illletve kikapcsolja, hogy neked szóljon-e a csengő.\n\n**pl. `!csengess be`, `!csengess ki`**"
};

function cmdHelp(client, timetable, students) {
    client.on("message", (msg) => {
        if (msg.author.bot) return;
        const regex = /!help\s*!?(.*)/i;
        const match = msg.content.match(regex);
        if (!match) return

        if (!match[1]) {
            const reply = Object.keys(cmdList).reduce((a, b) => a + "\n"+ b);
            const embed = new MessageEmbed()
                .setColor(0x00bb00)
                .setTitle("**Help:**")
                .setDescription(`\`\`\`\n${reply}\`\`\``);
            msg.channel.send(embed);
            console.log(`${msg.member.user.username}#${msg.member.user.discriminator} queried the general help sheet`);
        } else {
            const cmdName = Utilz.removeAccents(match[1].toLowerCase());
            const cmds = Object.keys(cmdList).map(x => {
                const m = x.match(/!([a-záéíóöőúüű]+)\s*.*/i);
                let dict = {};
                dict[Utilz.removeAccents(m[1])] = m[0];
                return dict;
            });
            
            for (var cmd of cmds) {
                if (cmd[cmdName] !== undefined) {
                    const cmdDesc = cmdList[cmd[cmdName]];
                    const embed = new MessageEmbed()
                        .setColor(0x00bb00)
                        .setTitle(`\`${cmd[cmdName]}\``)
                        .setDescription(cmdDesc);
                    msg.channel.send(embed);
                    console.log(`${msg.member.user.username}#${msg.member.user.discriminator} queried the help sheet for '${cmdName}'`);
                    return;
                }
            }
            const embed = new MessageEmbed()
                .setColor(0xbb0000)
                .setDescription(`Nincs \`${cmdName}\` nevű parancs.`);
            msg.channel.send(embed);
            console.log(`${msg.member.user.username}#${msg.member.user.discriminator} tried to query the help sheet for '${cmdName}', but this command doesn't exist`);
        }
    });
}

module.exports = cmdHelp;
