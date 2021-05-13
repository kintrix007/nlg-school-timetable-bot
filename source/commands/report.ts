import * as CoreTools from "../_core/core_tools";
import * as types from "../_core/types";
import { getCmdList } from "../_core/commands";
import { Collection, Message, MessageReaction, User } from "discord.js";

const cmd: types.Command = {
    func: cmdReport,
    name: "report",
    // permissions: [ types.adminPermission ],
    usage: "report",
    // description: "",
    examples: [ "" ]
};

const MAX_DESC_LENGHT = 300;

const reactionOptions = [
    "1⃣", "2⃣", "3⃣", "4⃣", "5⃣", "6⃣", "7⃣", "8⃣", "9⃣",
    "🇦", "🇧", "🇨", "🇩", "🇪", "🇫", "🇬", "🇭", "🇮", "🇯", "🇰", "🇱", "🇲", "🇳", "🇴"
];

type OptionFunc = (data: types.Data) => TreeOption[] | true;
type TreeOption = [string, OptionFunc, string?];

const listLessons = (data: types.Data, dayStr: string) => [
    ...[
        ...data.timetable[dayStr].map((x) =>
            `\`${x.start} - ${x.end}\`  ${x.subj}${x.elective ? " (fakt)" : ""}`
        ),
        "missing lesson",
        "lesson incorrectly exists"
    ].map((x): TreeOption => [x, () => true])
];

const dayLessonList = (dayStr: string): TreeOption => [dayStr, (data: types.Data) => listLessons(data, dayStr), "Which lesson is incorrect?"];

const groupNameList = (groupId = 0, groupSize = 9): OptionFunc => (data: types.Data) => {
    const roster        = data.students.roster;
    const groupStartId  = groupId * groupSize;
    const groupEndId    = (groupId + 1) * groupSize;
    const rosterGroup   = roster.slice(groupStartId, groupEndId);
    const islastGroup   = groupEndId >= roster.length-1;

    const rosterOptions: TreeOption[] = rosterGroup.map((x): TreeOption => [x, () => true]);
    const bonusOptions:  TreeOption[] = (
        islastGroup
        ? [["missing name", () => true]]
        : [["other names", groupNameList(groupId + 1, groupSize)]]
    );

    return [...rosterOptions, ...bonusOptions];
}

function commandList(data: types.Data): TreeOption[] {
    const cmdNames = getCmdList().map(x => x.name);
    const commandOptions: TreeOption[] = cmdNames.map(x => [x, () => true]);
    const otherOptions:   TreeOption[] = [["other", () => true]];
    return [...commandOptions, ...otherOptions];
}

const optionsTree: TreeOption[] = [
    ["timetable error", () => [
        dayLessonList("monday"),
        dayLessonList("tuesday"),
        dayLessonList("wednesday"),
        dayLessonList("thursday"),
        dayLessonList("friday"),
        ["missing day", () => true]
    ]],
    ["nickname error", groupNameList()],
    ["bot bug", commandList],
    ["other", () => true]
];

const loadingMsg = (msg: Message) =>
    CoreTools.createEmbed(msg, "neutral", "Loading...");


async function cmdReport({ data, msg }: types.CombinedData) {
    console.log(`${msg.author.username}#${msg.author.discriminator} started a report session`);
    await msg.channel.send(loadingMsg(msg))
    .then(async sentMsg => {
        
        const problemPath = [ "report" ];

        let tree = optionsTree;
        let description = "Choose an option by clicking on the respective reaction.";
        while (true) {
            const answer = await createPoll(msg, sentMsg, tree, description, problemPath);
            if (answer === undefined) {
                sentMsg.edit(CoreTools.createEmbed(msg, "error", "Timed out..."));
                return;
            }
            
            const option = tree[answer];
            problemPath.push(option[0].replace(/`+/g, ""));
            const selectedOption = option[1](data);
            description = option[2] ?? "";

            if (selectedOption === true) {
                sentMsg.edit(CoreTools.createEmbed(msg, "neutral", `Plese send some text further describing your problem.\n(max. ${MAX_DESC_LENGHT} characters)`));

                const filter = (problemMsg: Message) => problemMsg.author.id === msg.author.id;

                const sendReport = async (collected: Collection<string, Message>) => {
                    const problemDescMsg = collected.first();
                    const owner = await CoreTools.getBotOwner(data);
                    const problemString = problemDescMsg?.content?.slice(0, MAX_DESC_LENGHT)?.replace(/[ \t]+/g, " ")?.replace(/\n+/g, "    ");
                    await CoreTools.sendEmbed(owner, "neutral", {
                        title: `${msg.author.username}#${msg.author.discriminator} (from '${msg.guild?.name}') reported a problem:`,
                        desc:  `**${msg.author}**\n\n**At:**\n\`${problemPath.join(" > ")}\`\n\n**With the description:**\n${problemString}`
                    });

                    const replyEmbed = CoreTools.createEmbed(msg, "ok", {
                        title: "Successfully reported your problem!",
                        desc:  `With the description: '${problemDescMsg?.content?.replace(/\s+/g, " ")}'`
                    });
                    if (typeof replyEmbed === "string") msg.channel.send(`${msg.author}\n${replyEmbed}`);
                    else                                msg.channel.send(msg.author, replyEmbed);
                    sentMsg.delete();
                };

                await sentMsg.channel.awaitMessages(filter, {max: 1, time: 120000, errors: ["time"]})
                    .then(sendReport)
                    .catch(sendReport);
                break;
            }

            tree = selectedOption;
            sentMsg.edit(loadingMsg(msg));
        }
        console.log(`ended report session with ${msg.author.username}#${msg.author.discriminator}`);

    }).catch(console.error);
}

async function createPoll(msg: Message, sentMsg: Message, tree: TreeOption[], desc: string, problemPath: string[]): Promise<number | undefined> {
    const options = tree.map(x => x[0]);
    const optionsAmount = options.length;
    const currentReactions = reactionOptions.slice(0, optionsAmount);
    await addReactions(sentMsg, currentReactions);
    
    const content = `${desc}\n\n`
        + options.reduce((a, b, i) => a + `${currentReactions[i]}   ${b}\n`, "");
    sentMsg.edit(CoreTools.createEmbed(msg, "ok", {title: `${CoreTools.capitalize(problemPath[problemPath.length-1])}:`, desc: content}));

    const filter = (reaction: MessageReaction, user: User) => currentReactions.includes(reaction.emoji.name) && user.id === msg.author.id;
    
    try {
        const collected = await sentMsg.awaitReactions(filter, { max: 1, time: 60000, errors: ["time"] });
        sentMsg.reactions.removeAll().catch(console.error);

        const reaction = collected.first();
        if (reaction === undefined) return undefined;

        const reactionName = reaction.emoji.name;
        const reactionIdx = currentReactions.indexOf(reactionName);
        return reactionIdx;
    }
    catch (err) {
        sentMsg.reactions.removeAll().catch(console.error);
        return undefined;
    }
}

async function addReactions(msg: Message, reactions: string[], maxTries = 3) {
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
