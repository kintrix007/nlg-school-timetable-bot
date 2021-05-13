import * as CoreTools from "../_core/core_tools";
import * as types from "../_core/types";
import * as Utilz from "../utilz";

const cmd: types.Command = {
    name: "nevek",
    func: cmdNames,
    aliases: [ "név", "becenevek", "becenév" ],
    usage: "nevek [tanuló neve]",
    examples: [ "", "Ábel" ]
};

function cmdNames({ data, msg, args }: types.CombinedData) {
    const targetStudentStr = args[0];
    const targetStudent = Utilz.lookupNameFromAlias(targetStudentStr);

    if (targetStudent === undefined) {
        const roster = data.students.roster;
        const reply = roster.reduce((a, b) => a + ", " + b);
        CoreTools.sendEmbed(msg, "neutral", {
            title: "Névsor:",
            desc:  reply
        });
    } else {
        const studentAliases = Utilz.getNameAliases(targetStudent);
        const reply = studentAliases.length
            ? studentAliases.reduce((a, b) => a + ", " + b)
            : "Nincsenek becenevek megadva.";
        CoreTools.sendEmbed(msg, "neutral", {
            title: targetStudent,
            desc: reply
        });
    }
}

module.exports = cmd;
