import * as types from "./classes/types";
import * as Utilz from "./classes/utilz";
import * as fs from "fs";
import { Message, MessageEmbed, DMChannel } from "discord.js";

const cmds: types.Command[] = [];

function createCmd(command: types.Command): void {
    console.log(`loaded command '${command.commandName}'`);

    if (command.showOnTop) {
        cmds.unshift(command);      // unshift == prepend
    } else {
        cmds.push(command);
    }
}

function loadCmds(cmds_dir: string) {
    console.log("-- started loading commands... --");

    const files = fs.readdirSync(cmds_dir)
        .filter(filename => filename.endsWith(".js"))
        .map(filename => filename.slice(0, filename.length-3));

    files.forEach(filename => {
        const command: types.Command = require(`${cmds_dir}/${filename}`);
        createCmd(command);
    });

    console.log("-- finished loading commands --");
}

function setUpCmds(data: types.Data) {
    console.log("-- started setting up commands... --");

    cmds.forEach(async cmd => {
        if (cmd.setupFunc) await cmd.setupFunc(data);
    });
    
    console.log("-- finished setting up commands --");
}

export function createCmdsListener(data: types.Data, cmds_dir: string): void {
    loadCmds(cmds_dir);
    setUpCmds(data);

    data.client.on("message", (msg: Message) => {
        if (msg.channel instanceof DMChannel) return;
        if (msg.author.bot) return;
        const cont = Utilz.prefixless(data, msg);
        if (!cont) return;
        const [command, ...args] = cont.trim().split(" ").filter(x => x !== "");
        const combData: types.CombinedData = {
            data: data,
            msg: msg,
            args: args,
            argsStr: args.join(" "),
            cont: cont
        }

        cmds.forEach(cmd => {
            if (
                Utilz.removeAccents(cmd.commandName.toLowerCase()) === command ||
                cmd.aliases?.map(x => Utilz.removeAccents(x.toLowerCase()))?.includes(command)
            ) {
                // if admin command called by non-admin, then return
                if (cmd.adminCommand && !msg.member!.hasPermission("MANAGE_GUILD")) {
                    const embed = new MessageEmbed()
                        .setColor(0xbb0000)
                        .setDescription("Ehhez `Manage Server` hozzáférésre van szükséged.");
                    msg.channel.send(embed);
                    return;
                }
                cmd.func(combData);
            }
        });
    });

    console.log("-- all message listeners set up --");
}

export function getCmdList(): types.Command[] {
    return cmds.filter(x => x.usage !== undefined);
}
