import * as Utilz from "../classes/utilz";
import * as types from "../classes/types";
import { Message, MessageReaction, User } from "discord.js";

const cmd: types.Command = {
    func: cmdReport,
    name: "report"
};

const reactionOptions = ["🇦", "🇧", "🇨", "🇩", "🇪", "🇫", "🇬", "🇭", "🇮", "🇯", "🇰", "🇱", "🇲", "🇳", "🇴"];

type OptionPompt = {
    text?: string;
    options: TreeOption[];
}[];

type OptionFunc = (data: types.Data) => TreeOption[] | true;
type TreeOption = [string, OptionFunc];

const listLessons = (data: types.Data, dayStr: string) => [
    ...[
        ...data.timetable[dayStr].map((x): [string, OptionFunc] => [
            `${x.start}-${x.end} ║ ${x.subj}${x.elective ? " (fakt)" : ""}`,
            () => true
        ]),
        ["**missing lesson**", () => true] as TreeOption,
        ["**lesson incorrectly exists**", () => true] as TreeOption
    ]
]

const dayLessonList = (dayStr: string): TreeOption => [dayStr, (data: types.Data) => listLessons(data, dayStr)];

const optionsTree: TreeOption[] = [
    ["timetable error", () => [
        dayLessonList("monday"),
        dayLessonList("tuesday"),
        dayLessonList("wednesday"),
        dayLessonList("thursday"),
        dayLessonList("friday"),
        ["missing day", () => true]
    ]]
];

async function cmdReport({ data, msg }: types.CombinedData) {
    await msg.channel.send("Loading...")
    .then(async sentMsg => {
        
        let tree = optionsTree;
        let problemPath = "errors";
        let problemDesc: string;
        while (true) {
            const answer = await createPoll(sentMsg, tree);
            if (answer === undefined) {
                sentMsg.edit("Timed out...");
                return;
            }
            
            problemPath += ` > ${tree[answer][0]}`;
            const selectedOption = tree[answer][1](data);
            if (selectedOption === true) {
                sentMsg.edit("Thank you for reporting a problem with the bot!\nPlease leave a message, describing the rest of it.");
                
                const filter = (problemMsg: Message) => problemMsg.author.id === msg.author.id;
                sentMsg.channel.awaitMessages(filter, {max: 1, time: 120000, errors: ["time"]})
                    .then(collected => {
                        const problemDescMsg = collected.first();
                    });
                return;
            }

            tree = selectedOption;
            sentMsg.edit("Loading...");
        }

    }).catch(console.error);
}

async function createPoll(msg: Message, tree: TreeOption[]): Promise<number | undefined> {
    const options = tree.map(x => x[0]);
    const optionsAmount = options.length;
    const currentReactions = reactionOptions.slice(0, optionsAmount);
    await addReactions(msg, currentReactions);
    
    const content = options.reduce((a, b, i) => a + `${currentReactions[i]}   ${b}\n`, "");
    msg.edit(content);

    let result: number | undefined = undefined;

    const filter = (reaction: MessageReaction, user: User) => currentReactions.includes(reaction.emoji.name) && user.id === msg.author.id
    await msg.awaitReactions(filter, { max: 1, time: 60000, errors: ["time"] })
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
