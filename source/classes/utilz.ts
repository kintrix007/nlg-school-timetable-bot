import fs from "fs";
import yaml from "yaml";
import DC from "discord.js";
import * as types from "./types";

export namespace Utilz {
    const prefsDirPath = "prefs";
    const studentsAliases = yaml.parse(fs.readFileSync("students/aliases.yaml", "utf-8"));
    
    const getDayString = (function() {
        const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
        
        return (function (date: Date): string {
            return days[date.getDay()];
        });
    })();

    const getDayStringHun = (function() {
        const days = ["vasárnap", "hétfő", "kedd", "szerda", "csütörtök", "péntek", "szombat"];
        
        return (function (date: Date): string {
            return days[date.getDay()];
        });
    })();

    const translateDayStringToHun = (function() {
        const days = {
            "monday"    : "hétfő",
            "tuesday"   : "kedd",
            "wednesday" : "szerda",
            "thursday"  : "csütörtök",
            "friday"    : "péntek",
            "saturday"  : "szombat",
            "sunday"    : "vasárnap"
        };
        return (engDayString: string) => days[engDayString];
    })();

    const removeAccents = (function() {
        const accents =     ["á","é","í","ó","ö","ő","ú","ü","ű","Á","É","Í","Ó","Ö","Ő","Ú","Ü","Ű"];
        const non_accents = ["a","e","i","o","o","o","u","u","u","A","E","I","O","O","O","U","U","U"];

        return function(str: string): string {
            let result = str;
            accents.forEach((accent, index) => {
                result = result.replace(new RegExp(accent, "g"), non_accents[index]);
            })
            return result;
        }
    }());

    function capitalize(str: string): string {
        return str[0].toUpperCase() + str.slice(1);
    }

    const properHunNameSort = function(arr: string[]): string[] {
        return arr.sort((str1: string, str2: string) => {
            const a = removeAccents(str1);
            const b = removeAccents(str2);
            if (a === b) return 0;
            if (a > b) return 1;
            if (a < b) return -1;
        });
    };

    function lookupNameFromAlias(lookupName: string): string {
        if (studentsAliases[lookupName] !== undefined) return lookupName;
        for (var name in studentsAliases) {
            if (removeAccents(name.toLowerCase()) === removeAccents(lookupName.toLowerCase())) {
                return name;
            }
            const names = studentsAliases[name].map(x => removeAccents(x.toLowerCase()));
            if (names.includes(removeAccents(lookupName.toLowerCase()))) {
                return name;
            }
        }
    }

    function getNameAliases(name: string): string[] {
        return studentsAliases[name];
    }

    const getMeetingURL = (function() {
        const meetingURLs = yaml.parse(fs.readFileSync("timetable/class_meeting_links.yaml", "utf-8"));

        return function(lesson: string): [string?, string?] {
            return meetingURLs[lesson];
        };
    })();

    // returns a lowercase, accentless string, that is after the specified prefix.
    // returns null, in not prefixed properly
    function prefixless(data: types.CommandData, msg: DC.Message): string | null {
        const guildID = msg.guild.id;
        const prefixes = loadPrefs("prefixes.json", true);
        const prefix = removeAccents(
            (prefixes[guildID] ?? data.defaultPrefix).toLowerCase()
        );
        const regex = new RegExp(`^(<@!?${data.client.user.id}>).+$`);
        const cont = removeAccents(msg.content.toLowerCase());
        
        if (cont.startsWith(prefix.toLowerCase()))
            return cont.slice(prefix.length);
        
        const match = cont.match(regex);
        if (match)
            return cont.slice(match[1].length);
        
        return null;
    }

    function savePrefs(saveData: any, filename: string): void {
        if (!fs.existsSync(prefsDirPath)) {
            fs.mkdirSync(prefsDirPath);
            console.log(`created dir '${prefsDirPath}' because it did not exist`);
        }
        fs.writeFileSync(`${prefsDirPath}/${filename}`, JSON.stringify(saveData, undefined, 4));
        console.log(`saved prefs in '${prefsDirPath}/${filename}'`);
    }

    function loadPrefs(filename: string, silent = false): any {
        if (!fs.existsSync(`${prefsDirPath}/${filename}`)) return {};
    
        const loadDataRaw = fs.readFileSync(`${prefsDirPath}/${filename}`).toString();
        const loadData: any = JSON.parse(loadDataRaw);
        if (!silent)
            console.log(`loaded prefs from '${prefsDirPath}/${filename}'`);
        return loadData;
    }

}
