class Image {

    constructor(id,spec) {
        this._id = id;
        if (spec.url) {
            this._url = spec.url;
        }
        if (spec.caption) {
            this._caption = spec.caption;
        }
        if (spec.description) {
            this._description = spec.description;
        }
        if (spec.label) {
            this._label = spec.label;
        }
        if (spec.memo) {
            this._memo = spec.memo;
        }
/*
        if (spec.from_file){
            var s = spec.from_file;
            this._description = s.description;
            this._formal = s.formal;
            this._memo = s.memo;
            this._synonyms = s.synonyms;
            this._type = s.type;
        }
*/
    }


    // GETTERS
    get id() {
        if (this._id) {
            return this._id;
        } else {
            return null;
        }
    }

    get description() {
        if (this._descripion) {
            return this._description;
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



}
