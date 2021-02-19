# NLG School Timatable Bot

### This bot script is made for mainly personal use, specifically for Németh László Gimnázium's 11/a grade.

The bot is made so that it can be easily used with different schools, and timetables as well. All the data is read from YAML files.

---

### Dependencies

- discord.js
- node-schedule
- yaml

Run `npm install` in the project directory to get the required files.

---

### How to use

1. Clone this repo to your computer, then open up the folder you cloned this to.
1. Open a terminal in that folder (if you `Shift + Right Click` in it, there should be an option for that)
1. Type `npm install` into the command line, then press enter.
1. Wait until it installs the required files
1. Go into the `source/` folder, and create a file called `token.token`, and paste your bot's token there.
Now you have done the basic preparations to run this version of the bot, without changing anything.

### How to change the timetable, the students listed etc...?

1. If you go into the folder `source/` there are two subfolders in which you will need for that. There are `timetable/` and `students/`.
1. Both of these contain YAML files. (Files ending with `.yaml`)
1. By looking at their contents you should get a pretty good idea about their format.
1. Open up `monday.yaml`.
1. There, you'll see the definition of monday's timetable in the following format:
```yaml
- subj: name_of_the_class
  start: "08:00"
  length: 45
  elective: false
```
1. You need to always follow the format `"HH:MM"` for the start time.
1. The length can be any whole number, this tells the length of the lesson in minutes.
1. The elective just signifies whether or not a class is elective. Can be ignored completely, and just always set to `false` (recommended)

~~TO DO: Finish writing this...~~

