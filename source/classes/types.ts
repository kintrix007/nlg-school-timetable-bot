import * as DC from "discord.js";
import Time from "./time";

export interface Lesson {
    subj:       string;
    start:      Time;
    end:        Time;
    length:     number;
    elective:   boolean;
}

export interface Attendants {
    obligatory: string[] | undefined;
    elective:   string[] | undefined;
}

export interface LessonsAttendants {
    biosz:      Attendants;
    angol1:     Attendants;
    angol2:     Attendants;
    nemet_hm:   Attendants;
    nemet_kl:   Attendants;
    francia:    Attendants;
    orosz:      Attendants;
    olasz:      Attendants;
    magyar:     Attendants;
    matek:      Attendants;
    kemia:      Attendants;
    tori:       Attendants;
    fizika:     Attendants;
    info:       Attendants;
    foci:       Attendants;
}

export interface Students {
    roster:     string[];
    lessons:    LessonsAttendants;
}

export interface CommandData {
    client:         DC.Client;
    timetable:      Lesson[];
    students:       Students;
    defaultPrefix:  string;
}
