const Utilz = require("../classes/utilz.js");
const { MessageEmbed } = require("discord.js");

let bell = {};

function pingme(data) {
    data.client.on("message", msg => {
        if (msg.author.bot) return;
        const cont = Utilz.prefixless(data, msg);

        const regex = /^\s*cs[eoö]ngess\s+(be|ki)\s*$/i // !csengess [be/ki]
        const match = cont?.match(regex);
        if (!match) return;

        msg.guild.members.fetch(data.client.user.id) // get the bot as a member
        .then(botMember => {
            const hasPermission = botMember.hasPermission("MANAGE_ROLES");

            if (!hasPermission) {
                const embed = new MessageEmbed()
                    .setColor(0xbb0000)
                    .setDescription("Ehhez szükségem van `Manage Roles` hozzáférésre.");
                msg.channel.send(embed);
                console.log(`${msg.member.user.username}#${msg.member.user.discriminator} tried to get the ring role, but the bot doesn't have permission (${msg.guild.name})`);
                return;
            }
            
            bell = Utilz.loadPrefs("bell.json");
            const guildID = msg.guild.id;
            if (bell[guildID] === undefined) {
                return;
            }
            const ringRoleID = bell[guildID]["ringRole"];
            if (!ringRoleID) {
                const embed = new MessageEmbed()
                .setColor(0xbb0000)
                .setDescription("Nincs kiválasztva csengetési `role`.");
                msg.channel.send(embed);
                console.log(`${msg.member.user.username}#${msg.member.user.discriminator} tried to get the ring role, but the guild doesn't have one (${msg.guild.name})`);
                return;
            }
            const turnOn = match[1].toLowerCase() === "be"
            msg.guild.roles.fetch(ringRoleID)
            .then(ringRole => {
                if (turnOn) {
                    msg.member.roles.add(ringRole);
                    const embed = new MessageEmbed()
                        .setColor(0x00bb00)
                        .setDescription(`${msg.member} magkapta a ${ringRole} \`role\`-t.\n\nMostantől értesülni fogsz a csengetésekről.`)
                    msg.channel.send(embed);
                    console.log(`${msg.member.user.username}#${msg.member.user.discriminator} got the role ${ringRole.name}`);
                } else {
                    msg.member.roles.remove(ringRole);
                    const embed = new MessageEmbed()
                        .setColor(0xffbb00)
                        .setDescription(`${msg.member} elvesztette a ${ringRole} \`role\`-t.\n\nMostantől nem kapsz értesítést a csengetésekről.`)
                    msg.channel.send(embed);
                    console.log(`${msg.member.user.username}#${msg.member.user.discriminator} lost the role ${ringRole.name}`);
                }
            })
            .catch(console.log);
        })
        .catch(console.log);
    })
}

module.exports = pingme;
