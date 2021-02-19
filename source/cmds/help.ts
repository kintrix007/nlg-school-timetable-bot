import * as Utilz from "../classes/utilz";
import * as types from "../classes/types";
import { getCmdList } from "../commands";
import { MessageEmbed } from "discord.js";

const cmd: types.Command = {
    func: cmdHelp,
    name: "help",
    group: "help",
    aliases: [ "segítség" ],
    usage: "help [parancs neve]",
    description: "Megadja egy parancs használati módját, leírását, és mutat néhány pédát.",
    examples: [ "", "órarend", "követkető" ]
};

const footerNote = "A [] helyén egy paraméter opcionálisan megadható,\nA <> helyén pedig egy paraméter kötelező.";

function cmdHelp({ data, msg, args }: types.CombinedData) {
    const targetCommand = args[0];
    const currentPrefix = Utilz.getPrefix(data, msg.guild!);
    
    const cmdList = getCmdList();

    if (targetCommand) {
        // query specific help sheet
        const command = cmdList.find(x => Utilz.removeAccents(x.name.toLowerCase()) === targetCommand
            || x.aliases?.map(x => Utilz.removeAccents(x.toLowerCase()))?.includes(targetCommand));
        if (!command) {
            const embed = new MessageEmbed()
                .setColor(0xbb0000)
                .setDescription(`Nem létezik \`${targetCommand}\` nevű parancs.`);
            msg.channel.send(embed);
            return;
        }
        const usage = "`" + currentPrefix + command.usage! + "`";
        const commandName = currentPrefix + command.name;
        const aliases = (command.aliases ? "alias: " + command.aliases.map(x => currentPrefix+x).reduce((a, b) => a + ", " + b) : "");
        const description = command.description || "**[Nincs hozzáadva leírás]**";
        const examples = (command.examples ? "**Pl.:  " +
            command.examples.map(x => x ? `\`${commandName} ${x}\`` : `\`${commandName}\``) 
                            .reduce((a, b) => a + ", " + b) + "**"
        : "");

        const reply = description + "\n\n" + examples;
        const embed = new MessageEmbed()
            .setColor(0x00bb00)
            .setTitle(usage)
            .setDescription(reply)
            .setFooter(aliases);
        
        msg.channel.send(embed);
        console.log(`${msg.author.username}#${msg.author.discriminator} queried the help sheet for '${targetCommand}'`);

    } else {
        // query general help sheet
        const commandsInGroups: {[group: string]: types.Command[]} = {};
        cmdList.forEach(command => {
            if (commandsInGroups[command.group ?? ""] === undefined) {
                commandsInGroups[command.group ?? ""] = [];
            }
            commandsInGroups[command.group ?? ""].push(command);
        });

        const reply = "```\n"
            + Object.entries(commandsInGroups).reduce((acc, [group, commands]) => {
                const isValidGroup = group && group !== "help"; 
                return acc + (isValidGroup ? "```\n**" + Utilz.capitalize(group) + ":**\n```" : "")
                    + commands.reduce((acc, command) => acc + currentPrefix + command.usage! + "\n", "");
            }, "") + "```";
        
        const embed = new MessageEmbed()
            .setColor(0x00bb00)
            .setTitle("**Help:**")
            .setDescription(reply)
            .setFooter(footerNote);

        msg.channel.send(embed);
        console.log(`${msg.author.username}#${msg.author.discriminator} queried the general help sheet`);
    }
}

module.exports = cmd;
