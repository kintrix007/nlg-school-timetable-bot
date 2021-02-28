import * as Utilz from "../classes/utilz";
import * as types from "../classes/types";
import { Collection, Message, MessageEmbed, MessageReaction, User } from "discord.js";

const cmd: types.Command = {
    func: cmdReport,
    name: "report",
    usage: "report",
    examples: [ "" ]
};

const reactionOptions = ["🇦", "🇧", "🇨", "🇩", "🇪", "🇫", "🇬", "🇭", "🇮", "🇯", "🇰", "🇱", "🇲", "🇳", "🇴"];

type OptionFunc = (data: types.Data) => TreeOption[] | true;
type TreeOption = [string, OptionFunc, string?];

const listLessons = (data: types.Data, dayStr: string) => [
    ...[
        ...data.timetable[dayStr].map((x): [string, OptionFunc] => [
            `${x.start}-${x.end} ║ ${x.subj}${x.elective ? " (fakt)" : ""}`,
            () => true
        ]),
        ["missing lesson", () => true] as TreeOption,
        ["lesson incorrectly exists", () => true] as TreeOption
    ]
];

const dayLessonList = (dayStr: string): TreeOption => [dayStr, (data: types.Data) => listLessons(data, dayStr)];

const optionsTree: TreeOption[] = [
    ["timetable error", () => [
        dayLessonList("monday"),
        dayLessonList("tuesday"),
        dayLessonList("wednesday"),
        dayLessonList("thursday"),
        dayLessonList("friday"),
        ["missing day", () => true]
    ]],
    ["other", () => true]
];

const neutralColor = 0x008888;

const loadingMsg = new MessageEmbed()
.setColor(neutralColor)
.setTitle("Loading...");


async function cmdReport({ data, msg }: types.CombinedData) {
    await msg.channel.send(loadingMsg)
    .then(async sentMsg => {
        
        const problemPath = [ "report" ];

        let tree = optionsTree;
        let description = "press reaction...";
        while (true) {
            const answer = await createPoll(msg, sentMsg, tree, description, problemPath);
            if (answer === undefined) {
                sentMsg.edit(new MessageEmbed().setColor(0xbb0000).setTitle("Timed out..."));
                return;
            }
            
            const option = tree[answer];
            problemPath.push(option[0]);
            const selectedOption = option[1](data);
            description = option[2] ?? "";

            if (selectedOption === true) {
                sentMsg.edit(new MessageEmbed().setColor(neutralColor).setDescription("Send report text etc..."));

                const filter = (problemMsg: Message) => problemMsg.author.id === msg.author.id;

                const sendReport = async (collected: Collection<string, Message>) => {
                    const problemDescMsg = collected.first();
                    const owner = await Utilz.getBotOwner(data);
                    const problemString = problemDescMsg?.content?.replace(/\n+/, "\n")?.replace(/\t/, " ")?.replace(/ +/, " ");
                    const embed = new MessageEmbed()
                        .setColor(0xbb0000)
                        .setTitle(`${msg.author.username}#${msg.author.discriminator} reported a problem:`)
                        .setDescription(`**${msg.author}**\n\n**At:**\n\`${problemPath.join(" > ")}\`\n\n**With the description:**\n${problemString}`);
                    await owner.send(embed);

                    const replyEmbed = new MessageEmbed()
                        .setColor(0x00bb00)
                        .setTitle("Successfully reported your problem!")
                        .setDescription(`With the description: '${problemDescMsg?.content?.replace(/\s+/g, " ")}'`);
                    msg.channel.send(msg.author, replyEmbed);
                    sentMsg.delete();
                };

                sentMsg.channel.awaitMessages(filter, {max: 1, time: 120000, errors: ["time"]})
                    .then(sendReport)
                    .catch(sendReport);
                return;
            }

            tree = selectedOption;
            sentMsg.edit(loadingMsg);
        }

    }).catch(console.error);
}

async function createPoll(msg: Message, sentMsg: Message, tree: TreeOption[], desc: string, problemPath: string[]): Promise<number | undefined> {
    const options = tree.map(x => x[0]);
    const optionsAmount = options.length;
    const currentReactions = reactionOptions.slice(0, optionsAmount);
    await addReactions(sentMsg, currentReactions);
    
    const content = `${desc}\n\n`
        + options.reduce((a, b, i) => a + `${currentReactions[i]}   ${b}\n`, "");
    sentMsg.edit(new MessageEmbed().setColor(neutralColor).setTitle(`${Utilz.capitalize(problemPath[problemPath.length-1])}:`).setDescription(content));

    let result: number | undefined = undefined;

    const filter = (reaction: MessageReaction, user: User) => currentReactions.includes(reaction.emoji.name) && user.id === msg.author.id
    await sentMsg.awaitReactions(filter, { max: 1, time: 60000, errors: ["time"] })
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
    
    sentMsg.reactions.removeAll().catch(console.error);
    
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
