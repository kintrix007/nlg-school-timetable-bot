class Time {
    constructor(a, b = null) {
        if (b != null) {
            this.time = a * 60 + b;
            this.hour = a + Math.floor(b / 60);
            this.minute = b % 60;
        } else {
            this.time = a;
            this.hour = Math.floor(a / 60);
            this.minute = a % 60;
        }
    }

    toString() {
        let h = `${this.hour < 10 ? "0" : ""}${this.hour}`;
        let m = `${this.minute < 10 ? "0" : ""}${this.minute}`;
        return `${h}:${m}`;
    }

    add(timeObj) {
        return new Time(this.time + timeObj.time);
    }

    compare(timeObj) {
        return Math.sign(this.time - timeObj.time);
    }
};

module.exports = Time;
