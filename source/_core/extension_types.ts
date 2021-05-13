import { Timetable, Students } from "../custom_types";

export type CustomCommandGroup = "roles" | "utility";

export interface CustomData {
    timetable: Timetable;
    students:  Students;
};
