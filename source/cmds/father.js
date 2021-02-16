const fecoSynonyms = ["miatyank", "feco", "feri", "feci", "feciba", "feriba", "isten", "mester", "fonok", "foni", "nemeth"];
function cmdFather(data, cont, msg) {
    if (fecoSynonyms.includes(cont)) {
        console.log(`${msg.author.username}#${msg.author.discriminator} queried the fecó`);
        msg.channel.send("", { "files": ["images/feco.jpeg"] });
    }
}
export const cmd = {
    func: cmdFather
};
