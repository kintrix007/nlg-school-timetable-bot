import * as Utilz from "../classes/utilz";
import * as types from "../classes/types";
import { MessageEmbed } from "discord.js";

const cmd: types.Command = {
    name: "nevek",
    func: cmdNames,
    aliases: [ "név", "becenevek", "becenév" ],
    examples: [ "", "Ábel" ]
};

function cmdNames({ data, msg, args }: types.CombinedData) {
    const targetStudentStr = args[0];
    const targetStudent = Utilz.lookupNameFromAlias(targetStudentStr);

    if (targetStudent === undefined) {
        const roster = data.students.roster;
        const reply = roster.reduce((a, b) => a + ", " + b, "");
        const embed = new MessageEmbed()
            .setColor(0x00bb00)
            .setTitle("Névsor:")
            .setDescription(reply);
        msg.channel.send(embed);
    } else {
        const studentAliases = Utilz.getNameAliases(targetStudent);
        const reply = studentAliases.reduce((a, b) => a + ", " + b, "") || "Nincsenek becenevek megadva.";
        const embed = new MessageEmbed()
            .setColor(0x00bb00)
            .setTitle(targetStudent)
            .setDescription(reply);
        msg.channel.send(embed);
    }
}
