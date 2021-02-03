const Utilz = require("../classes/utilz.js");

function cmdFather(data) {
    data.client.on("message", (msg) => {
        if (msg.author.bot) return;
        const cont = Utilz.prefixless(data, msg);
        if (!cont) return;
        
        if (
            ["miatyank", "feco", "feri", "feci", "feciba", "feriba", "isten", "mester", "fonok", "foni"]
            .includes(cont)
        ) {
            console.log(`${msg.member.user.username}#${msg.member.user.discriminator} queried the fecó`);
            msg.channel.send("", {"files" : ["images/feco.jpeg"]});
        }
    });
}

module.exports = cmdFather;
