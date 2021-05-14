export default class Time {
    public time:   number = 0;
    public hour:   number = 0;
    public minute: number = 0;
    
    constructor(date: Date);
    constructor(time: string);
    constructor(time: number);
    constructor(hours: number, minutes: number);
    constructor(foo: Date | number | string, minutes?: number) {
        if (typeof(foo) === "string") {
            const time = foo;
            const hourStr = time.slice(0, 2);
            const minuteStr = time.slice(3, 5);
            this.hour = parseInt(hourStr);
            this.minute = parseInt(minuteStr);
            this.time = this.hour * 60 + this.minute;
        } else
        if (foo instanceof Date) {
            const date = foo;
            this.hour = date.getHours();
            this.minute = date.getMinutes();
            this.time = this.hour * 60 + this.minute;
        }
        if (typeof(foo) === "number") {
            if (minutes === undefined) {
                const time = foo;
                this.time = time;
                this.hour = Math.floor(this.time / 60);
                this.minute = this.time % 60;
            } else {
                const hours = foo;
                this.hour = hours;
                this.minute = minutes;
                this.time = this.hour * 60 + this.minute;
            }
        }
    }

    add(timeObj: Time): Time {
        return new Time(this.time + timeObj.time);
    }

    equals(time: Time) {
        return this.time === time.time;
    }

    valueOf() {
        return this.time;
    }

    toString() {
        let h = `${this.hour < 10 ? "0" : ""}${this.hour}`;
        let m = `${this.minute < 10 ? "0" : ""}${this.minute}`;
        return `${h}:${m}`;
    }
};
