export default class Time {
    public time: number;
    public hour: number;
    public minute: number;
    
    constructor(time: number | string, minutes: number | undefined = undefined) {
        if (typeof(time) === "string" && minutes === undefined) {
            const hourStr = time.slice(0, 2);
            const minuteStr = time.slice(3, 5);
            this.hour = parseInt(hourStr);
            this.minute = parseInt(minuteStr);
            this.time = this.hour * 60 + this.minute;
        } else
        if (typeof(time) === "number") {
            if (minutes === undefined) {
                this.time = time;
                this.hour = Math.floor(this.time / 60);
                this.minute = this.time % 60;
            } else {
                this.hour = time;
                this.minute = minutes;
                this.time = this.hour * 60 + this.minute;
            }
        }
    }

    valueOf(): number {
        return this.time;
    }

    toString(): string {
        let h = `${this.hour < 10 ? "0" : ""}${this.hour}`;
        let m = `${this.minute < 10 ? "0" : ""}${this.minute}`;
        return `${h}:${m}`;
    }

    add(timeObj: Time): Time {
        return new Time(this.time + timeObj.time);
    }
};
