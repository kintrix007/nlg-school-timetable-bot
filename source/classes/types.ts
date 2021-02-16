import * as DC from "discord.js";
import Time from "./time";

// Timetable
export interface LessonData {
    subj:       string;
    start:      Time;
    end:        Time;
    length:     number;
    elective:   boolean;
}

export type TimetableDay = LessonData[];

export interface Timetable {
    [day: string]: TimetableDay;
}

// Students
export interface Attendants {
    obligatory?: string[];
    elective?:   string[];
}

export interface LessonsAttendants {
    [lesson: string]: Attendants;
}

export interface Students {
    roster:     string[];
    lessons:    LessonsAttendants;
}

// Data
export interface Data {
    client:         DC.Client;
    timetable:      Timetable;
    students:       Students;
    defaultPrefix:  string;
}

// Bot Command
export interface Command {
    func:           Function;
    commandName:    string;
    aliases?:       string;
    usage?:         string;
    description?:   string;
    examples?:      string[];
}
