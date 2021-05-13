// import * as Utilz from "../classes/utilz";
import * as types from "../_core/types";

const fecoSynonyms = ["miatyank", "feco", "feri", "feci", "feciba", "feriba", "isten", "mester", "fonok", "foni", "nemeth"];

const cmd: types.Command = {
    func: cmdFather,
    name: "miatyánk",
    aliases: fecoSynonyms
};

function cmdFather({ msg }: types.CombinedData) {
    console.log(`${msg.author.username}#${msg.author.discriminator} queried the fecó`);
    msg.channel.send("", {"files" : ["source/images/feco.jpeg"]});
}

module.exports = cmd;
