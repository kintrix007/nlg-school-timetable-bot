const Utilz = require("../classes/utilz.js");

function cmdFather(client, timetable, students) {
    client.on("message", (msg) => {
        if (msg.author.bot) return;
        const cont = Utilz.removeAccents(msg.content.toLowerCase());
        if (
            ["!miatyank", "!feco", "!feri", "!feci", "!feciba", "!feriba", "!isten", "!mester", "!fonok", "!foni"]
            .includes(cont)
        ) {
            console.log(`${msg.member.user.username}#${msg.member.user.discriminator} queried the fecó`);
            msg.channel.send("", {"files" : ["images/feco.jpeg"]});
        }
    });
}

module.exports = cmdFather;
