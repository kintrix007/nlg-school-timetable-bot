import * as DC from "discord.js";
import Time from "./time";

// Timetable
export interface Lesson {
    subj:       string;
    start:      Time;
    end:        Time;
    length:     number;
    elective:   boolean;
}

export type TimetableDay = Lesson[];

export interface Timetable {
    [key: string]: TimetableDay;
}

// Students
export interface Attendants {
    obligatory?: string[];
    elective?:   string[];
}

export interface LessonsAttendants {
    [key: string]: Attendants;
}

export interface Students {
    roster:     string[];
    lessons:    LessonsAttendants;
}

// Data
export interface CommandData {
    client:         DC.Client;
    timetable:      Timetable;
    students:       Students;
    defaultPrefix:  string;
}

// Bot Command
export interface BotCommand {
    func:           Function;
    usage?:         string;
    description?:   string;
    examples?:      string[];
}
