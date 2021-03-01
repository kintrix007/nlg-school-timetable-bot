import * as types from "../classes/types";

const cmd: types.Command = {
    func: cmdInfo,
    name: "botinfo",
    // usage: "botinfo",
    examples: [ "" ]
}

function cmdInfo({ msg }: types.CombinedData) {
    msg.channel.send("info about the bot idk");
}

module.exports = cmd;
