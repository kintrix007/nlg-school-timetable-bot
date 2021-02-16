import * as Utilz from "../classes/utilz";
import * as types from "../classes/types";
import { getCmdList } from "../commands";
import { Message, MessageEmbed } from "discord.js";

const cmdList = getCmdList();

const footerNote = "A [] helyén egy paraméter opcionálisan megadható,\nA <> helyén pedig egy paraméter kötelező.";

function cmdHelp(data: types.CommandData, cont: string, msg: Message) {
    const regex = /^\s*help\s*(.*?)\s*$/i;
    const match = cont?.match(regex);
    if (!match) return;

    const targetCommand = match[1];
    const currentPrefix = Utilz.getPrefix(data, msg.guild!);

    if (targetCommand) {
        // query specific help sheet
        const command = cmdList.find(x => x.commandName === targetCommand);
        if (!command) {
            const embed = new MessageEmbed()
                .setColor(0xbb0000)
                .setDescription(`Nem létezik '${targetCommand}' nevű parancs.`);
            msg.channel.send(embed);
            return;
        }
        const usage = "`" + currentPrefix + command.usage! + "`";
        const description = command.description ?? "";
        const examples = command.examples ?? [];
        const examplesStr = "**" + examples.reduce((a, b) => a + ` \`${currentPrefix}${b}\``, "Pl.:") + "**";

        const reply = description + "\n\n" + examplesStr;
        const embed = new MessageEmbed()
            .setColor(0x00bb00)
            .setTitle(usage)
            .setDescription(reply)
            .setFooter(footerNote);
        
        msg.channel.send(embed);
        console.log(`${msg.author.username}#${msg.author.discriminator} queried the help sheet for '${targetCommand}'`);

    } else {
        // query general help sheet
        const reply = "```\n" + cmdList.reduce((a, b) => {
            const usage = currentPrefix + b.usage!;
            return a + usage + "\n"
        }, "") + "\n```";
        const embed = new MessageEmbed()
            .setColor(0x00bb00)
            .setTitle("**Help:**")
            .setDescription(reply)
            .setFooter(footerNote);
        
        msg.channel.send(embed);
        console.log(`${msg.author.username}#${msg.author.discriminator} queried the general help sheet`);
    }
}

export const cmd: types.BotCommand = {
    func: cmdHelp,
    commandName: "help",
    usage: "!help [parancs neve]",
    description: "Megadja egy parancs használati módját, leírását, és mutat néhány pédát.",
    examples: [ "help", "help órarend", "help követkető" ]
}
