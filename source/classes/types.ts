import * as DC from "discord.js";
import Time from "./time";

export interface LessonData {
    subj:       string;
    elective:   boolean;
}

// Timetable
export interface Lesson extends LessonData {
    start:  Time;
    end:    Time;
    length: number;
}

export type TimetableDay = Lesson[];

export interface Timetable {
    [day: string]:  TimetableDay;
}

// Students

export interface LessonsAttendants {
    [lesson: string]: {
        obligatory?:    string[];
        elective?:      string[];
    };
}

export interface StudentsLessons {
    [student: string]:  LessonData[];
}

export interface Students {
    roster:             string[];
    lessonsStudents:    LessonsAttendants;
    studentsLessons:    StudentsLessons;
}

// Data
export interface Data {
    client:         DC.Client;
    timetable:      Timetable;
    students:       Students;
    defaultPrefix:  string;
}

export interface CombinedData {
    data:       Data;
    msg:        DC.Message;
    args:       string[];
    argsStr:    string;
    cont:       string;
}

// Bot Command
export interface Command {
    func:           Function;
    setupFunc?:     (data: Data) => Promise<void>;
    commandName:    string;
    showOnTop?:     boolean;
    aliases?:       string[];
    usage?:         string;
    description?:   string;
    examples?:      string[];
    adminCommand?:  boolean;
}
