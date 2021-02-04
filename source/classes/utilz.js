const fs = require("fs");

class Utilz {
    constructor() {
        this.prefsDirPath = "prefs";
        
        this.getDayString = (function() {
            const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
            
            return (function (date) {
                return days[date.getDay()];
            });
        })();

        this.getDayStringHun = (function() {
            const days = ["vasárnap", "hétfő", "kedd", "szerda", "csütörtök", "péntek", "szombat"];
            
            return (function (date) {
                return days[date.getDay()];
            });
        })();

        this.translateDayStringToHun = (function() {
            const days = {
                "monday" : "hétfő",
                "tuesday" : "kedd",
                "wednesday" : "szerda",
                "thursday" : "csütörtök",
                "friday" : "péntek",
                "saturday" : "szombat",
                "sunday" : "vasárnap"
            };
            return (engDayString) => days[engDayString];
        })();

        this.removeAccents = (function() {
            const accents =     ["á","é","í","ó","ö","ő","ú","ü","ű","Á","É","Í","Ó","Ö","Ő","Ú","Ü","Ű"];
            const non_accents = ["a","e","i","o","o","o","u","u","u","A","E","I","O","O","O","U","U","U"];

            return function(string) {
                let result = string+"";
                accents.forEach((accent, index) => {
                    result = result.replace(new RegExp(accent, "g"), non_accents[index]);
                })
                return result;
            }
        }());

        this.capitalize = (str) => (str[0].toUpperCase() + str.slice(1));

        this.properHunNameSort = function(arr) {
            return arr.sort((str1, str2) => {
                const a = this.removeAccents(str1);
                const b = this.removeAccents(str2);
                if (a == b) return 0;
                if (a > b) return 1;
                if (a < b) return -1;
            });
        };

        this.lookupNameFromAlias = (function () {
            const studentsAliases = JSON.parse(fs.readFileSync("students/aliases.json"));
        
            return function(lookupName) {
                if (studentsAliases[lookupName] !== undefined) return lookupName;
                for (var name in studentsAliases) {
                    if (this.removeAccents(name.toLowerCase()) === this.removeAccents(lookupName.toLowerCase())) {
                        return name;
                    }
                    const names = studentsAliases[name].map(x => this.removeAccents(x.toLowerCase()));
                    if (names.includes(this.removeAccents(lookupName.toLowerCase()))) {
                        return name;
                    }
                }
            };
        })();

        this.getNameAliases = (function () {
            const studentsAliases = JSON.parse(fs.readFileSync("students/aliases.json"));

            return function(name) {
                return studentsAliases[name];
            }
        })();

        this.getMeetingURL = (function() {
            const meetingURLs = JSON.parse(fs.readFileSync("timetable/class_meeting_links.json"));

            return function(lesson) {
                return meetingURLs[lesson];
            };
        })();

        // returns a lowercase, accentless string, that is after the specified prefix.
        // returns null, in not prefixed properly
        this.prefixless = function(data, msg) {
            const guildID = msg.guild.id;
            const prefixes = this.loadPrefs("prefixes.json", true);
            const prefix = this.removeAccents(
                (prefixes[guildID] ?? data.defaultPrefix).toLowerCase()
            );
            const regex = new RegExp(`^(<@!?${data.client.user.id}>).+$`);
            const cont = this.removeAccents(msg.content.toLowerCase());
            
            if (cont.startsWith(prefix.toLowerCase()))
                return cont.slice(prefix.length);
            
            const match = cont.match(regex);
            if (match)
                return cont.slice(match[1].length);
        }

        this.savePrefs = function(saveData, filename) {
            if (!fs.existsSync(this.prefsDirPath)) {
                fs.mkdirSync(this.prefsDirPath);
                console.log(`created dir '${this.prefsDirPath}' because it did not exist`);
            }
            fs.writeFileSync(`${this.prefsDirPath}/${filename}`, JSON.stringify(saveData, undefined, 4));
            console.log(`saved prefs in '${this.prefsDirPath}/${filename}'`);
        }

        this.loadPrefs = function(filename, silent = false) {
            if (!fs.existsSync(`${this.prefsDirPath}/${filename}`)) return {};
        
            const loadDataRaw = fs.readFileSync(`${this.prefsDirPath}/${filename}`);
            const loadData = JSON.parse(loadDataRaw);
            if (!silent)
                console.log(`loaded prefs from '${this.prefsDirPath}/${filename}'`);
            return loadData;
        }
    }
}

module.exports = new Utilz();