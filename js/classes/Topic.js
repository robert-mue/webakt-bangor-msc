class Topic {

    constructor(spec) {
        if (spec.from_file){
            var s = spec.from_file;
            this._id = s.name.replace(/ /g,'_');
            this._json = s.json;
            // TODO: Need to rename the _objects property!  It's really confusing...
            // object, objects+subobjects, object+superobjects
            // Something like objectCategories
            this._objects = s.objects;
            this._search_term = s.search_term;
            this._json = s.nested_list;   // TODO  nested_list is a legacy term.   Change to json
            this._javascript = this.generateJavascriptFromJson();
        }
    }

    // GETTERS
    get description() {
        if (this._description) {
            return this._description;
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
    get json() {
        if (this._json) {
            return this._json;
        } else {
            return null;
        }
    }
    get objects() {
        if (this._objects) {
            return this._objects;
        } else {
            return null;
        }
    }
    get searchTerm() {
        if (this._searchTerm) {
            return this._searchTerm;
        } else {
            return null;
        }
    }


    // SETTERS

    set descripton(des) {
        this._description = des;
    }

    set name(na) {
        this._id = na;
    }

    set json(jso) {
        this._json = jso;
    }

    set objects(obj) {
        this._objects = obj;
    }

    set searchTerm(term) {
        this._searchTerm = term;
    }

    // Derived from Statement:generateJsonFromFormal()
    generateJavascriptFromJson= function () {
        const infixOperator = {
            and:'&&',
            or:'||'};

        const prefixOperator = {
            not:'!'};
            
        const javascript = walk(this._json);
        return javascript;

        function walk (part) {
            if (typeof part === "string") {  
                return 'contains("'+part+'")';

            // TODO: Work out bracketting needed to handle and/or precedence.
            // Currently, every subexpression (A and/or B) is bracketted.
            } else if (part.length === 2 && prefixOperator[part[0]]) {
                return ' '+infixOperator[part[0]]+'(' + walk(part[1]) + ')';
            } else if (part.length === 3 && infixOperator[part[0]]) {
                return '('+walk(part[1]) + ' '+ infixOperator[part[0]]+' ' + walk(part[2]) + ')';
            }
        }
    }


    passFilters = function (filters) {
        var kb = AKT.KBs[AKT.state.current_kb];   // TODO: fix!

        if (filters.hasOwnProperty('hierarchyId')) {
            if (filters.hierarchyId !== 'all') {
                if (!this.inHierarchy(filters.hierarchyId)) {
                    return false;
                }
            }
        }
        return true;
    }

    inHierarchy = function (hierarchyId) {
        var kb = AKT.KBs[AKT.state.current_kb];   // TODO: fix!
        var hierarchy = kb._topicHierarchies[hierarchyId];
        if (hierarchy.getAllDescendants(hierarchy._id).includes(this._id)) {
            return true;
        }
        return false;
    }

}
