class FormalTerm {

    constructor(spec) {
        if (spec) {
            this._id = spec.id;
            if (spec.from_file){
                var s = spec.from_file;
                this._kb = spec.kb;
                this._description = s.description;
                this._formal = s.formal;
                this._memo = s.memo;
                this._synonyms = s.synonyms;
                this._type = s.type;
            } else {
                this._kb = spec.kb;
                this._description = spec.description;
                this._formal = spec.formal;
                this._memo = spec.memo;
                this._synonyms = spec.synonyms;
                this._type = spec.type;
            }
        } else {
            this._kb = AKT.state.current_kb;
            this._description = '';
            this._formal = '';
            this._memo = '';
            this._synonyms = [];
            this._type = 'object';
        }
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

    get formal() {
        if (this._formal) {
            return this._formal;
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

    get synonyms() {
        if (this._synonyms) {
            return this._synonyms;
        } else {
            return null;
        }
    }

    get typexxx() {
        if (this._type) {
            return this._type;
        } else {
            return null;
        }
    }



    addSynonym (newSynonym) {
        this._synonyms.push(newSynonym);
    }


    findHierarchies () {
        var allHierarchies = this._kb._objectHierarchies;
        var myHierarchies = [];
        for (var hierarchyId in allHierarchies) {
            var hierarchy = allHierarchies[hierarchyId];
            if (hierarchy._tree_up[this._id]) {
                myHierarchies.push(hierarchy);
            }
        }
        return myHierarchies;
    }

    passFilters = function(filters) {
        
        if (filters && filters.term_type) {
            if (filters.term_type === 'all') {
            } else if (this._type === filters.term_type) {
            } else {
                return false;
            }
        }

/* Left unfinished.   Checks for use of the formal term in main part or condition
   of at least one sentence.  Can't see much point to this.
        if (filters && filters.use) {
            if (filters.term_type === 'all') {
            } else if (filters.use==='main' && ) {
            } else {
                return false;
            }
        }
*/
        return true;
    }

}
