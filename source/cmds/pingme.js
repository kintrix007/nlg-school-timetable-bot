const fs = require("fs");
const Utilz = require("../classes/utilz.js");
const { MessageEmbed } = require("discord.js");

const prefsDirPath = "prefs";
const prefsFilePath = `${prefsDirPath}/bell.json`;

let bell = {};

function pingme(client, timetable, students) {
    client.on("message", msg => {
        if (msg.author.bot) return;
        const regex = /^!cs[eoö]ngess\s+(be|ki)\s*$/i // !csengess [be/ki]
        const match = msg.content.match(regex);
        if (!match) return;

        msg.guild.members.fetch(client.user.id) // get the bot as a member
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
            
            bell = loadPrefs();
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
                        .setDescription(`${msg.member} magkapta a ${ringRole} \`role\`-t.\nMostantől értesülni fogsz a csengetésekről.`)
                    msg.channel.send(embed);
                    console.log(`${msg.member.user.username}#${msg.member.user.discriminator} got the role ${ringRole.name}`);
                } else {
                    msg.member.roles.remove(ringRole);
                    const embed = new MessageEmbed()
                        .setColor(0x00bb00)
                        .setDescription(`${msg.member} elvesztette a ${ringRole} \`role\`-t.\nMostantől nem kapsz értesítést a csengetésekről.`)
                    msg.channel.send(embed);
                    console.log(`${msg.member.user.username}#${msg.member.user.discriminator} lost the role ${ringRole.name}`);
                }
            })
            .catch(console.log);
        })
        .catch(console.log);
    })
}


function savePrefs(dataToSave) { // save
    const saveData = dataToSave;
    // console.log(saveData);
    if (!fs.existsSync(prefsDirPath)) {
        console.log(`created dir '${prefsDirPath}' because it did not exist`);
        fs.mkdirSync(prefsDirPath);
    }
    fs.writeFile(prefsFilePath, JSON.stringify(saveData, undefined, 4), err => {if (err) console.log(err)});
    console.log(`saved prefs for '${prefsFilePath}'`);
}

function loadPrefs() { // load
    if (!fs.existsSync(prefsFilePath)) return;
    let loadDataRaw = fs.readFileSync(prefsFilePath, err => {if (err) console.log(err)});
    
    let loadData = JSON.parse(loadDataRaw);
    console.log(`loaded prefs for '${prefsFilePath}'`);
    return loadData;
}

module.exports = pingme;
