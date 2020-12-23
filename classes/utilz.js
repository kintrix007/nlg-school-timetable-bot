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
            const accents =     ["á","é","í","ó","ö","ő","ú","ü","ű"];
            const non_accents = ["a","e","i","o","o","o","u","u","u"];

            return function(string) {
                let result = string;
                accents.forEach((accent, index) => {
                    result = result.replace(accent, non_accents[index]);
                })
                return result;
            }
        }());

    }
}

module.exports = new Utilz();