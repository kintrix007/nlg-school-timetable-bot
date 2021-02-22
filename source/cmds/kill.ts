import * as Utilz from "../classes/utilz";
import * as types from "../classes/types";
import { MessageEmbed } from "discord.js";

const cmd: types.Command = {
    func: cmdKill,
    name: "kill",
    usage: "kill",
    group: "owner",
    ownerCommand: true
};

function cmdKill({ msg }: types.CombinedData) {
    const embed = new MessageEmbed()
        .setColor(0x00bb00)
        .setTitle("Shutting down...");
    msg.channel.send(embed).then(sentMsg => {
        console.log("-- stopping bot... --");
        process.exit(0);
    }).catch(console.error);
}

module.exports = cmd;
