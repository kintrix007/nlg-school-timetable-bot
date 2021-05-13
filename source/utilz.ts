import * as CoreTools from "./_core/core_tools";
import fs from "fs";
import path from "path";
import yaml from "yaml";

export const TIMETABLE_DIR = path.join(CoreTools.ROOT_DIR, "timetable");
export const STUDENTS_DIR = path.join(CoreTools.ROOT_DIR, "students");

const studentsAliasesRaw = fs.readFileSync(path.join(STUDENTS_DIR, "aliases.yaml"), "utf-8").toString();
const studentsAliases : {[key: string]: string[]} = yaml.parse(studentsAliasesRaw);

export function lookupNameFromAlias(lookupName: string | undefined) {
    if (lookupName === undefined) return undefined;
    if (studentsAliases[lookupName] !== undefined) return lookupName;

    for (const [name, aliases] of Object.entries(studentsAliases)) {
        const names = aliases.map(x => CoreTools.removeAccents(x.toLowerCase()));
        if (
            CoreTools.removeAccents(name.toLowerCase()) === CoreTools.removeAccents(lookupName.toLowerCase()) ||
            names.includes(CoreTools.removeAccents(lookupName.toLowerCase()))
        ) return name;
    }

    return undefined;
}

export function getNameAliases(name: string) {
    return studentsAliases[name];
}

export const getMeetingURL = (function() {
    const meetingURLs = yaml.parse(fs.readFileSync(path.join(TIMETABLE_DIR, "class_meeting_urls.yaml"), "utf-8"));

    return function(lesson: string): [string?, string?] {
        return meetingURLs[lesson];
    };
})();

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
        "monday"   : "hétfő",
        "tuesday"  : "kedd",
        "wednesday": "szerda",
        "thursday" : "csütörtök",
        "friday"   : "péntek",
        "saturday" : "szombat",
        "sunday"   : "vasárnap"
    };
    
    return (engDayString: string) => days[engDayString];
})();

export const properHunNameSort = function(arr: string[]): string[] {
    return arr.sort((str1: string, str2: string) => {
        const a = CoreTools.removeAccents(str1);
        const b = CoreTools.removeAccents(str2);
        if (a > b) return 1;
        if (a < b) return -1;
        return 0;
    });
};

export function capitalize(str: string): string {
    return str[0].toUpperCase() + str.slice(1);
}
