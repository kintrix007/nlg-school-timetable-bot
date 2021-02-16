// import * as Utilz from "../classes/utilz.js";
import * as types from "../classes/types.js";
import { Message } from "discord.js";

const fecoSynonyms = ["miatyank", "feco", "feri", "feci", "feciba", "feriba", "isten", "mester", "fonok", "foni", "nemeth"];

function cmdFather(data: types.CommandData, cont: string, msg: Message) {
    if ( fecoSynonyms.includes(cont) ) {
        console.log(`${msg.author.username}#${msg.author.discriminator} queried the fecó`);
        msg.channel.send("", {"files" : ["images/feco.jpeg"]});
    }
}

export const cmd: types.BotCommand = {
    func: cmdFather,
    commandName: "miatyánk"
}
