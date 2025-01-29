class Source {

    constructor(spec) {
        if (spec.from_file){
            var s = spec.from_file;
            this._day = s.day;
            this._extras = s.extras;
            this._id = s.id;
            this._interviewee = s.interviewee;
            this._interviewer = s.interviewer;
            this._location = s.location;
            this._memo = null;
            this._month = s.month;
            this._name = s.name;
            this._sex = s.sex;
            this._suffix = s.suffix;
            this._year = s.year;
        } else {
            this._day = spec.day;
            this._extras = spec.extras;
            this._id = spec.id;
            this._interviewee = spec.interviewee;
            this._interviewer = spec.interviewer;
            this._location = spec.location;
            this._memo = null;
            this._month = spec.month;
            this._name = spec.name;
            this._sex = spec.sex;
            this._suffix = spec.suffix;
            this._year = spec.year;
        }
    }


    // GETTERS
    get day() {
        if (this._day) {
            return this._day;
        } else {
            return null;
        }
    }

    get id() {
        if (this._id) {
            return this._id;
        } else {
            return null;
        }
    }

    get extras() {
        if (this._extras) {
            return this._extras;
        } else {
            return null;
        }
    }

    get interviewee() {
        if (this._interviewee) {
            return this._interviewee;
        } else {
            return null;
        }
    }

    get interviewee() {
        if (this._interviewee) {
            return this._interviewee;
        } else {
            return null;
        }
    }

    get interviewer() {
        if (this._interviewer) {
            return this._interviewer;
        } else {
            return null;
        }
    }

    get location() {
        if (this._location) {
            return this._location;
        } else {
            return null;
        }
    }

    get memo() {
        if (this._memo) {
            return this._memo;
        } else {
            return null;
        }
    }

    get method() {
        if (this._method) {
            return this._method;
        } else {
            return null;
        }
    }

    get month() {
        if (this._month) {
            return this._month;
        } else {
            return null;
        }
    }

    get id() {
        if (this._id) {
            return this._id;
        } else {
            return null;
        }
    }

    get sex() {
        if (this._sex) {
            return this._sex;
        } else {
            return null;
        }
    }

    get suffix() {
        if (this._suffix) {
            return this._suffix;
        } else {
            return null;
        }
    }

    get year() {
        if (this._year) {
            return this._year;
        } else {
            return null;
        }
    }


    // SETTERS
    set day(da) {
        this._day = da;
    }

    set extras(ext) {
        this._extras = ext;
    }

    set id(id) {
        this._id = id;
    }

    set interviewee(int) {
        this._interviewee = int;
    }

    set interviewer(int) {
        this._interviewer = int;
    }

    set location(loc) {
        this._location = loc;
    }

    set memo(mem) {
        this._memo = mem;
    }

    set method(met) {
        this._method = met;
    }

    set month(mon) {
        this._month = mon;
    }

    set id(id) {
        this._id = id;
    }

    set sex(sx) {
        this._sex = sx;
    }

    set suffix(suf) {
        this._suffix = suf;
    }

    set year(y) {
        this._year = y;
    }


}
