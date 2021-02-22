import * as Utilz from "../classes/utilz";
import * as types from "../classes/types";
import { Message, ReactionEmoji, User } from "discord.js";

const cmd: types.Command = {
    func: cmdReport,
    name: "report"
};

function cmdReport({ data, msg }: types.CombinedData) {
    msg.channel.send("TODO")
    .then(sentMsg => {
        const reactionOptions = ["🇦", "🇧", "🇨", "🇩", "🇪"]
        addReactions(sentMsg, reactionOptions);
        const filter = (reaction: ReactionEmoji, user: User) => user.id === msg.author.id && reactionOptions.includes(reaction.name);
        sentMsg.awaitReactions(filter, { time: 60000, max: 1, errors: [ "time" ] })
            .then(collected => {
                console.log(collected);
                sentMsg.edit("Thank you");
            })
            .catch(console.error);
    });
}

async function addReactions(msg: Message, reactions: string[], maxTries = 10) {
    try {
        for (const reaction of reactions) {
            await msg.react(reaction);
        }
    }
    catch (err) {
        if (maxTries === 0) return console.error(err);

        await msg.reactions.removeAll()
        .then(() => addReactions(msg, reactions, maxTries-1))
        .catch(console.error);
    }
}

module.exports = cmd;
