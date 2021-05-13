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
