import * as CoreTools from "../_core/core_tools";
import * as types from "../_core/types";
import { TextChannel, DMChannel, User } from "discord.js";
import { BellData } from "./bell";

const cmd: types.Command = {
    func: cmdPingme,
    setupFunc: setup,
    name: "értesítés",
    permissions: [ types.adminPermission ],
    group: "admin",
    aliases: [ "reactionmessage", "reaction" ],
    usage: "értesítés",
    // description: "",
    examples: [ "" ]
};

const REACTION_PREFS_FILE = "reaction_messages.json";
const BELL_PREFS_FILE = "bell.json";
const REACTION_EMOJI = "🔔";
const TEMP_MSG_LENGTH = 20;

export interface ReactionMessages {
    [guildID: string]: {
        channelID:              string;
        readableChannelName:    string;
        messageID:              string;
    }
}

async function cmdPingme({ data, msg }: types.CombinedData) {
    const guildID = msg.guild!.id;
    const reactionMessages: ReactionMessages = CoreTools.loadPrefs(REACTION_PREFS_FILE);
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
        CoreTools.sendEmbed(msg, "error", {
            title: "Hozzáférés hiányzik!",
            desc:  "Nincs engedélyezve a `Manage Roles` hozzáférés, így nem fog működni a *role* adás."
        });
        // Do not return
    }

    const bellData: BellData = CoreTools.loadPrefs(BELL_PREFS_FILE);
    if (bellData[guildID]?.ringRoleID === undefined) {
        CoreTools.sendEmbed(msg, "error", {
            title: "Csengetési *role* hiányzik!",
            desc:  "Nincs kiválasztva csengetési *role*, így nem fog működni a *role* adás."
        });
        // Do not return
    }

    CoreTools.sendEmbed(msg, "neutral", {
        title: `Reagálj erre az üzenetre egy ${REACTION_EMOJI}-vel, hogy értesülj a csengetésekről!`,
        desc:  "Amennyiben ezt meg akarod szüntetni, csak vondd vissza a reakctiót."
    }).then(sentMsg => {
        if (sentMsg.channel instanceof DMChannel) return;       // never happends

        sentMsg.react(REACTION_EMOJI);

        reactionMessages[guildID] = {
            channelID: sentMsg.channel.id,
            readableChannelName: sentMsg.channel.name,
            messageID: sentMsg.id
        };
        CoreTools.savePrefs(REACTION_PREFS_FILE, reactionMessages)
    });
}

async function setup(data: types.Data) {
    // cache messages
    const reactionMessages: ReactionMessages = CoreTools.loadPrefs(REACTION_PREFS_FILE);
    for (const [guildID, guildData] of Object.entries(reactionMessages)) {
        try {
            const channel = await data.client.channels.fetch(guildData.channelID) as TextChannel;
            await channel.messages.fetch(guildData.messageID);
        }
        catch (err) {
            console.warn(`Couldn't cache a reaction-role message '${guildID}':\t`, err);
            continue;
        }
    }
    console.log("successfully cached reaction-role messages");

    reactionChange(data, true);
    reactionChange(data, false);

    console.log("successfully set up reaction-role listeners");
}

function reactionChange(data: types.Data, isAdd: boolean) {
    const event = isAdd ? "messageReactionAdd" : "messageReactionRemove"

    data.client.on(event, async (reaction, user) => {
        if (user.bot) return;
        if (!(user instanceof User)) return;
        if (reaction.emoji.name !== REACTION_EMOJI) return;

        const guildID = reaction.message.guild!.id;
        const messageID = reaction.message.id;

        const missingManageRolesText = `Nem sikerült ${isAdd ? "megadni" : "elvenni"} a *role*-t '${user}' felhasználó${isAdd ? "nak" : "tól"}.\n`
            + "Ez ügyben keresd a szerver adminokat.";

        try {
            const guild = await data.client.guilds.fetch(guildID)
            const botMember = guild.member(data.client.user!);

            if (!botMember?.hasPermission("MANAGE_ROLES")) {
                CoreTools.sendEmbed(reaction.message, "error", {
                    title: "Nincs engedélyezve a `Manage Roles` hozzáférés!",
                    desc:  missingManageRolesText
                });
                return;
            };

            const reactionMessages: ReactionMessages = CoreTools.loadPrefs(REACTION_PREFS_FILE, true);

            if (reactionMessages[guildID]?.messageID === messageID) {
                const member = await getMember(data, guildID, user)
                
                if (member === undefined) return;
                const bellData: BellData = CoreTools.loadPrefs(BELL_PREFS_FILE, true);

                const ringRoleID = bellData[guildID]?.ringRoleID;
                if (ringRoleID === undefined) {
                    CoreTools.sendEmbed(reaction.message, "error", {
                        title: "Nincs kiválasztva csengetési *role!*",
                        desc:  missingManageRolesText
                    });
                    return;
                }

                const bellChannel = await data.client.channels.fetch(bellData[guildID].channelID) as TextChannel;

                if (isAdd) {
                    member.roles.add(ringRoleID);
                    bellChannel.send(`${user}, mostantól értesülni fogsz a csengetésekről! 🔔`)
                    .then(sentMsg => setTimeout(() => sentMsg.delete(), TEMP_MSG_LENGTH*1000));

                    console.log(`${user.username}#${user.discriminator} reacted with '${REACTION_EMOJI}'`);
                } else {
                    member.roles.remove(ringRoleID);
                    bellChannel.send(`${user}, mostantól nem fogsz értesítést kapni a csengetésekről! 🔕`)
                    .then(sentMsg => setTimeout(() => sentMsg.delete(), TEMP_MSG_LENGTH*1000));
                    
                    console.log(`${user.username}#${user.discriminator} removed '${REACTION_EMOJI}'`);
                }
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
