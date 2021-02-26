import * as Utilz from "../classes/utilz";
import * as types from "../classes/types";
import { Message } from "discord.js";

const reactionOptions = ["🇦", "🇧", "🇨", "🇩", "🇪", "🇫", "🇬", "🇭", "🇮"];

const cmd: types.Command = {
    func: cmdReport,
    name: "report"
};

const optionsTree = [
    ["timetable bug" , () => [
        ["monday" , () => []],
        ["tuesday" , () => []],
        ["wednesday" , () => []],
        ["thursday" , () => []],
        ["friday" , () => []]
    ]],
    ["missing alias" , () => []],
    ["bot crash" , () => []],
    ["other" , () => []]
];

async function cmdReport({ data, msg }: types.CombinedData) {
    await msg.channel.send("Loading...")
    .then(async sentMsg => {

        const answer = await createPoll(sentMsg, ["random option", "uhh, no...?"]);
        if (answer === undefined) {
            sentMsg.edit("Timed out");
            return;
        }

        switch (answer) {
        case 0:
            
            break;
        case 1:
            
            break;
        case 2:
            
            break;
        case 3:
            
            break;
        case 4:

            break;
        }
        sentMsg.edit(`Thank you for answering! (#${answer})`);

    }).catch(console.error);
}

async function createPoll(msg: Message, options: string[]): Promise<number | undefined> {
    const optionsAmount = options.length;
    const currentReactions = reactionOptions.slice(0, optionsAmount);
    await addReactions(msg, currentReactions);
    
    const content = options.reduce((a, b, i) => a + `${currentReactions[i]} - ${b}\n`, "");
    msg.edit(content);

    let result: number | undefined = undefined;
    await msg.awaitReactions(() => true, { max: 1, time: 10000, errors: ["time"] })
        .then(collected => {
            const reaction = collected.first();
            if (reaction === undefined) return;

            const reactionName = reaction.emoji.name;
            const reactionIdx = currentReactions.indexOf(reactionName);
            result = reactionIdx;
        })
        .catch(err => {
            result = undefined;
        });
    
    msg.reactions.removeAll().catch(console.error);
    
    return result;
}

async function addReactions(msg: Message, reactions: string[], maxTries = 5) {
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
