class Utilz {
    constructor() {
        this.getDayString = (function() {
            const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
            
            return (function () {
                let date = new Date();
                return days[date.getDay()];
            });
        })();

        this.getDayStringHun = (function() {
            const days = ["vasárnap", "hétfő", "kedd", "szerda", "csütörtök", "péntek", "szombat"];
            
            return (function () {
                let date = new Date();
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
                    result = result.replace(accent, non_accents[index]);
                })
                return result;
            }
        }());

        this.properHunNameSort = function(arr) {
            return arr.sort((str1, str2) => {
                const a = this.removeAccents(str1);
                const b = this.removeAccents(str2);
                if (a == b) return 0;
                if (a > b) return 1;
                if (a < b) return -1;
            });
        };


        this.lookupNameFromAlias = function(students, lookupName) {
            const aliases = students.aliases;
            if (aliases[lookupName] !== undefined) return lookupName;
            for (var name in aliases) {
                if (this.removeAccents(name.toLowerCase()) === this.removeAccents(lookupName.toLowerCase())) {
                    return name;
                }
                const names = aliases[name].map(x => this.removeAccents(x.toLowerCase()));
                if (names.includes(this.removeAccents(lookupName.toLowerCase()))) {
                    return name;
                }
            }
        };

    }
}

module.exports = new Utilz();