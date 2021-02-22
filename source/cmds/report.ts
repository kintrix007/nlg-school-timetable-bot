import * as Utilz from "../classes/utilz";
import * as types from "../classes/types";

const cmd: types.Command = {
    func: cmdReport,
    name: "report"
};

function cmdReport({ data, msg }: types.CombinedData) {
    // TODO
}

module.exports = cmd;
