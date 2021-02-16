import * as types from "./classes/types";
import * as Utilz from "./classes/utilz";
import * as fs from "fs";
import { Message } from "discord.js";

const CMDS_DIR = "source/cmds";
const cmds: types.Command[] = [];

function createCmd(command: types.Command): void {
    console.log(`added command '${command.commandName}'`);

    cmds.push(command);
}

function loadCmds() {
    const files = fs.readdirSync(CMDS_DIR)
        .filter(filename => filename.endsWith(".js"));
    console.log(files);

    files.forEach(filename => {
        const command: types.Command = require(`./cmds/${filename}`);
        createCmd(command)
        console.log(command);
    })
}

export function createCmdsListener(data: types.Data): void {
    loadCmds();
    
    console.log("message listener set");

    data.client.on("message", (msg: Message) => {
        console.log("recieved message", msg.content);
        if (msg.author.bot) return;
        const cont = Utilz.prefixless(data, msg);
        if (!cont) return;

        cmds.forEach(cmd => {
            cmd.func(data, cont, msg);
        });
    });
}

export function getCmdList(): types.Command[] {
    return cmds
        .filter(x => x.usage !== undefined)
        .sort((a, b) => {
            if (a.usage! > b.usage!) return 1;
            if (a.usage! < b.usage!) return -1;
            return 0;
        });
}
