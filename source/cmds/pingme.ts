import * as Utilz from "../classes/utilz";
import * as types from "../classes/types";
import { MessageEmbed, TextChannel, DMChannel, User } from "discord.js";
import { BellData } from "./bell"

const REACTION_PREFS_FILE = "reaction_messages.json";
const BELL_PREFS_FILE = "bell.json";

const cmd: types.Command = {
    func: cmdPingme,
    setupFunc: setup,
    commandName: "csengess",
    adminCommand: true,
    aliases: [ "pingme", "ping" ],
    usage: "csengess",
    // description: "",
    examples: [ "" ]
};

export interface ReactionMessages {
    [guildID: string]: {
        channelID:              string;
        readableChannelName:    string;
        messageID:              string;
    }
}

async function cmdPingme({ data, msg }: types.CombinedData) {
    const guildID = msg.guild!.id;
    const reactionMessages: ReactionMessages = Utilz.loadPrefs(REACTION_PREFS_FILE);
    if (reactionMessages[guildID] !== undefined) {
        try {
            const channel = await data.client.channels.fetch(reactionMessages[guildID].channelID) as TextChannel;
            const message = await channel.messages.fetch(reactionMessages[guildID].messageID);
            message.delete();   // no need to check if it is deletable, we are in a try block.
        }
        catch (err) {
            console.warn("Handled error:\t", err);
        }
    }

    if (!msg.guild?.member(data.client.user!)?.hasPermission("MANAGE_ROLES")) {
        const embed = new MessageEmbed()
            .setColor(0xbb0000)
            .setTitle("Hiányzik hozzáférés...")
            .setDescription("Nincs engedélyezve a `Manage Roles` hozzáférés.");
        msg.channel.send(embed);
    }

    const embed = new MessageEmbed()
        .setColor(0x00bb00)
        .setTitle("Reagálj erre az üzenetre egy 🔔-vel, hogy értesülj a csengetésekről!")
        .setDescription("Amennyiben ezt meg akarod szüntetni, csak vondd vissza a reakctiót.");
    msg.channel.send(embed)
    .then(sentMsg => {
        if (sentMsg.channel instanceof DMChannel) return;       // never happends

        sentMsg.react("🔔");

        reactionMessages[guildID] = {
            channelID: sentMsg.channel.id,
            readableChannelName: sentMsg.channel.name,
            messageID: sentMsg.id
        };
        Utilz.savePrefs(REACTION_PREFS_FILE, reactionMessages)
    });
}

async function setup(data: types.Data) {
    // cache messages
    const reactionMessages: ReactionMessages = Utilz.loadPrefs(REACTION_PREFS_FILE);
    for (const [guildID, guildData] of Object.entries(reactionMessages)) {
        try {
            const channel = await data.client.channels.fetch(guildData.channelID) as TextChannel;
            await channel.messages.fetch(guildData.messageID);
        }
        catch (err) {
            console.warn("Couldn't cache a reaction-role message:\t", err);
            Utilz.savePrefs(REACTION_PREFS_FILE, reactionMessages);
        }
    }
    console.log("successfully cached reaction-role messages");

    reactionChange(data, true);
    reactionChange(data, false);
}

function reactionChange(data: types.Data, add: boolean) {
    const event = add ? "messageReactionAdd" : "messageReactionRemove"

    data.client.on(event, async (reaction, user) => {
        if (user.bot) return;
        if (!(user instanceof User)) return;

        const guildID = reaction.message.guild!.id;
        const messageID = reaction.message.id;

        try {
            const guild = await data.client.guilds.fetch(guildID)
            const botMember = guild.member(data.client.user!);

            if (!botMember?.hasPermission("MANAGE_ROLES")) return;

            const reactionMessages: ReactionMessages = Utilz.loadPrefs(REACTION_PREFS_FILE);

            if (reactionMessages[guildID]?.messageID === messageID) {
                const member = await getMember(data, guildID, user)
                
                if (member === undefined) return;
                const bellData: BellData = Utilz.loadPrefs(BELL_PREFS_FILE, true);
                const ringRoleID = bellData[guildID].ringRoleID;
                if (ringRoleID === undefined) return;
                member.roles.remove(ringRoleID);
            }
        } catch (err) {
            console.error(err);
        }
    });
}

async function getMember(data: types.Data, guildID: string, user: User) {
    try {
        const guild = await data.client.guilds.fetch(guildID);
        const member = await guild.members.fetch(user);
        return member
    }
    catch (err) {
        console.error(err);
    }
    return undefined;
}

module.exports = cmd;
