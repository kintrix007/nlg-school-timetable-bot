import * as fs from "fs";
import * as yaml from "yaml";
import * as DC from "discord.js";
import * as types from "./types";

const prefsDirPath = "prefs";
const studentsAliasesRaw = fs.readFileSync("source/students/aliases.yaml", "utf-8").toString();
const studentsAliases : {[key: string]: string[]} = yaml.parse(studentsAliasesRaw);

export const getDayString = (function() {
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    
    return (function (date: Date): string {
        return days[date.getDay()];
    });
})();

export const getDayStringHun = (function() {
    const days = ["vasárnap", "hétfő", "kedd", "szerda", "csütörtök", "péntek", "szombat"];
    
    return (function (date: Date): string {
        return days[date.getDay()];
    });
})();

export const translateDayStringToHun = (function() {
    const days: {[key: string]: string} = {
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

export const removeAccents = (function() {
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

export function capitalize(str: string): string {
    return str[0].toUpperCase() + str.slice(1);
}

export const properHunNameSort = function(arr: string[]): string[] {
    return arr.sort((str1: string, str2: string) => {
        const a = removeAccents(str1);
        const b = removeAccents(str2);
        if (a > b) return 1;
        if (a < b) return -1;
        return 0;
    });
};

export function lookupNameFromAlias(lookupName: string): string | null {
    if (studentsAliases[lookupName] !== undefined) return lookupName;
    for (var [name, aliases] of Object.entries(studentsAliases)) {
        if (removeAccents(name.toLowerCase()) === removeAccents(lookupName.toLowerCase())) {
            return name;
        }
        const names = aliases.map(x => removeAccents(x.toLowerCase()));
        if (names.includes(removeAccents(lookupName.toLowerCase()))) {
            return name;
        }
    }
    return null;
}

export function getNameAliases(name: string): string[] {
    return studentsAliases[name];
}

export const getMeetingURL = (function() {
    const meetingURLs = yaml.parse(fs.readFileSync("source/timetable/class_meeting_urls.yaml", "utf-8"));

    return function(lesson: string): [string?, string?] {
        return meetingURLs[lesson];
    };
})();

// returns a lowercase, accentless string, that is after the specified prefix.
// returns an emtpy string if there it is incorrect
export function prefixless(data: types.CommandData, msg: DC.Message): string {
    const guildID = msg.guild!.id;
    const prefixes = loadPrefs("prefixes.json", true);
    const prefix = removeAccents(
        (prefixes[guildID] ?? data.defaultPrefix).toLowerCase()
    );
    const regex = new RegExp(`^(<@!?${data.client.user!.id}>).+$`);
    const cont = removeAccents(msg.content.toLowerCase());
    
    if (cont.startsWith(prefix.toLowerCase())) {
        return cont.slice(prefix.length);
    }
    
    const match = cont.match(regex);
    if (match) {
        return cont.slice(match[1].length);
    }
    
    return "";
}

export function savePrefs(saveData: any, filename: string): void {
    if (!fs.existsSync(prefsDirPath)) {
        fs.mkdirSync(prefsDirPath);
        console.log(`created dir '${prefsDirPath}' because it did not exist`);
    }
    fs.writeFileSync(`${prefsDirPath}/${filename}`, JSON.stringify(saveData, undefined, 4));
    console.log(`saved prefs in '${prefsDirPath}/${filename}'`);
}

export function loadPrefs(filename: string, silent = false): any {
    if (!fs.existsSync(`${prefsDirPath}/${filename}`)) return {};

    const loadDataRaw = fs.readFileSync(`${prefsDirPath}/${filename}`).toString();
    const loadData: any = JSON.parse(loadDataRaw);
    if (!silent)
        console.log(`loaded prefs from '${prefsDirPath}/${filename}'`);
    return loadData;
}
