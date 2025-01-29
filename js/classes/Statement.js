//C Statement
class Statement {
    /**
     * Create a statement.
     * @param {object} spec - an object-literal containing initialising data.
     */
    constructor(spec) {
        if (spec.kb) {
            var kb = spec.kb;
        } else {
            kb = AKT.KBs[AKT.state.current_kb];
        }

        if (spec.id) {
            this._id = spec.id;
        } else {
            var n = kb.findLargestIndex(kb._statements,'s');
            var n1 = n+1;
            console.log(n,n1);
            this._id = 's'+n1;
        }

        this._kb = kb;

        if (spec.json) {
            this._json = spec.json;
        } else if (spec.formal) {
            this._formal = spec.formal;
            this._json = this.generateJsonFromFormal(this._formal);
            //this._english = this.generateEnglish();
        } else if (spec.from_file){
            var s = spec.from_file;
            //if (s.source_ids) {
                //this._formal = s.formal;
                //this._json = this.generateJsonFromFormal(this._formal);
                this._json = s.json;
                this._english = this.generateEnglish();
                this._memo = s.memo;
                //console.debug(spec.id,s.source_ids);
                this._sources = this.findSourcesFromIds(s.source_ids);
                //console.log(s.source_ids,this._sources);
                //this._sources = s.source_ids;
                this._type = s.type;
                this._formal = this.generateFormal();
            //}
        }

        if (spec.type) {
            this._type = spec.type;
        } else {
            this._type = 'attribute';   // TODO Fix this hack!
        }

        // Nov 2022 Commented out.  
        // Not sure why this is here, but it negates getting sources from spec.from_file above.
        // TODO: See if you can see why it was put in?  
        // Maybe for when user is creating a new statement?
        //if (spec.sources) {
        //    this._sources = spec.sources;
        //} else {
        //    this._sources = [];
        //}
    }


    generateId = function (kb) {
        var id = 's'+kb(findLargestIndex);
    }


    // GETTERS
    get english() {
        if (!this._english) {
            console.log(3);
            this._english = this.generateEnglish();
        }
        return this._english;
    }

    get formal() {
        if (!this._formal) {
            this._formal = this.generateFormal();
        }
        return this._formal;
    }

    get json() {
        return this._json;
    }

    get memo() {
        if (this._memo) {
            return this._memo;
        }
        return null;
    }

    get sources() {
        if (this._sources) {
            return this._sources;
        }
        return null;
    }

    get type() {
        if (this._type) {
            return this._type;
        }
        return null;
    }


    // SETTERS
    set json(json) {
        this._english = null;
        this._formal = null;
        this._json = json;
    }

    // We explicity allow any thing to be captured as a 'formal' statement, 
    // without dong any checks at this point.    This then means that we can
    // subsequenty use Statement methids to do various checks (rather than 
    // having a bunch of functions to do that outside Statement).
    // In effect, we are treating Statement._formal as a possible draft
    // statement.  So, a new Statement instance should be created as soon as
    // we select New in the Statements dialog.
    set formal(formal) {
        this._english = null;
        this._formal = formal;
        this._json = null;
    }

    set memo(mem) {
        this._memo = mem;
    }

    // This sets an array of source IDs.   To add an individual source, use addSource().
    set sources(sour) {
        this._sources = sour;
    }

    set type(typ) {
        this._type = typ;
    }


    // METHODS


    // TODO: Add check that the source actually exists in the list of sources....
    addSource = function(sourceId) {
        this._sources.push(sourceId);
    }

    // There are numerous checks that can be made on a draft formal statement.
    // All we currently do here is see if we can convert it in to JSON (nested arrays), 
    // and, if so, it is deemed to be syntactically correct.  Subsequent checks
    // could include e.g. checking that the first argument for att_value/3 is
    // a known object, a possible mis-spelling for a known object, or an unknown
    // word waiting for the user to enter it as a "formal term".
    checkFormalSyntax = function(formal) {
        var result = this.generateJsonFromFormal(formal);
        if (typeof result === 'object') {
            return 'OK';
        } else {
            return result;
        }
    }

    checkFormal = function () {

        var overallResult = {};

        // Clear out HTML markup in the formal statement, if any.
        const regex = /<\/?\w[^>]*>/g;
        var formal = this._formal.replace(regex, '');

        // PEG.js grammar check
        try {
            var result = statementParser.parse(formal);
            overallResult.peg = {result:'ok', parseTree:result};
        }
        catch(error) {
            overallResult.peg = {result:'fail', error:error};
        }

        return overallResult;
    }


    // Splits a formal or English version of the sattement around' if ',
    // return a two-element array.
    splitAtIf = function(statementString) {  // formal or English
        statementString = statementString.replace(')if ',') if ');
        const parts = statementString.split(' if ');
        if (parts.length === 1){
            parts[1] = '';
        }
        return parts;
    }


    findFormalTermsXXX = function () {
        var kb = AKT.KBs[AKT.state.current_kb];   // TODO: fix!
        var formalTermIds = this._json.flat(99);
        var formalTerms = {};
        for (var i=0; i<formalTermIds.length; i++) {
            var id = formalTermIds[i];
            if (kb._formalTerms[id]) {
                formalTerms[id] = kb.formalTerms[id];
            }
        }
        return formalTerms;
    }

    findSourcesFromIds = function(sourceIds) {
        //console.debug('---- ',sourceIds);
        return sourceIds;
/*
        var kb = AKT.KBs['output'];   // TODO: fix!
        var sources = {};
        for (var i=0; i<sourceIds.length; i++) {
            var sourceId = sourceIds[i];
            sources[sourceId] =  kb.sources[sourceId];
        }
        return sources;
*/
    }


    // We handle each predicate (att_value, causes1way, etc) with a separate 'case' 
    // statement, to allow maximum flexibility for generating semi-natural English.
    generateEnglishHtml = function() {
        var useHtml = true;
        var colours = {object:'#0000ff',attribute:'#ff0000',value:'#00aa00',process:'#8000ff',action:'#0088ff',part:'#000099'};
        const english = translate(this.json,null,null);
        console.log(this._id,english,'\n',$('<div>"'+english+'</div>').text());
        this._english = english;
        return english;

        function translate(phrase,type,context) {

            if (typeof phrase === "string") {  
                return ' <span class="formal_term formal_term_'+type+'" data-type="'+type+'" title="'+type+'">' + phrase + '</span> ';

            } else {
                switch (phrase[0]) {   // Uses the first array element

                    case "action":
                        if (phrase.length === 3) {
                            return translate(phrase[1],'action') + " " + translate(phrase[2],'object');
                        } else {
                            return translate(phrase[1],'action') + " " + translate(phrase[2],'object') + " " + translate(phrase[3],'object');
                        }

                    case "and":
                        return translate(phrase[1]) + " and " + translate(phrase[2]);

                    case "att_value":
                        if (context && context === "cause" || context === "caused") {
                            if (phrase[3] === "increase") {
                                return "an increase in the " + translate(phrase[2],'attribute') + " of " + translate(phrase[1],'object');
                            } else if (phrase[3] === "decrease") {
                                return "a decrease in the " + translate(phrase[2],'attribute') + " of " + translate(phrase[1],'object');
                            } else if (context === "cause") {
                                return "the " + translate(phrase[2],'attribute') + " of " + translate(phrase[1],'object') + " being " + translate(phrase[3],'value');

                            } else if (context === "caused") {
                                return "the " + translate(phrase[2],'attribute') + " of " + translate(phrase[1],'object') + " to be " + translate(phrase[3],'value');

                            } else {
                                return "the " + translate(phrase[2],'attribute') + " of " + translate(phrase[1],'object') + " is " + translate(phrase[3],'value');
                            }
                        } else {
                            return "the " + translate(phrase[2],'attribute') + " of " + translate(phrase[1],'object') + " is " + translate(phrase[3],'value');
                        }

                    case "causes1way":
                        return translate(phrase[1],null,"cause") + " causes " + translate(phrase[2],null,"caused");

                    case "causes2way":
                        return translate(phrase[1],null,"cause") + " causes " + translate(phrase[2],null,"caused");

                    case "comparison":
                        return " the " + translate(phrase[1]) + " of " + translate(phrase[2]) + " is " + translate(phrase[3]) + translate(phrase[4]);

                    case "if":
                        return translate(phrase[1]) + " if " + translate(phrase[2]);

                    case "linkxxx":
                        return "XXX";

                    case "not":
                        return " it is not true that " + translate(phrase[1]);

                    case "or":
                        return translate(phrase[1]) + " or " + translate(phrase[2]);

                    case "part":
                        //return translate(phrase[1],'object') + " " + translate(phrase[2],'part');
                        return ' the ' + translate(phrase[2],'object') + " part of " + translate(phrase[1],'object');

                    case "process":
                        if (phrase.length === 2) {
                            return translate(phrase[1],'process');
                        } else if (phrase.length === 3) {
                            return translate(phrase[1],'object') + " " + translate(phrase[2],'process');
                        } else {
                            return translate(phrase[1],'object') + " " + translate(phrase[2],'process') + " " + translate(phrase[3],'object');
                        }

                    case "rangexxx":
                        return "XXX";

                    default:
                        return JSON.stringify(phrase);
                }
            }
        }
    }


    // We handle each predicate (att_value, causes1way, etc) with a separate 'case' 
    // statement, to allow maximum flexibility for generating semi-natural English.
    //Superceded by generateEnglishHtml(), above, which arks up using
    //classes rather than direct styling.
    generateEnglish = function() {
        var useHtml = true;
        var colours = {object:'#0000ff',attribute:'#ff0000',value:'#00aa00',process:'#8000ff',action:'#0088ff',part:'#000099'};
        const english = translate(this.json,null,null);
        //console.log(this._id,english,'\n',$('<div>"'+english+'</div>').text());
        this._english = english;
        return english;

        function translate(phrase,type,context) {

            if (typeof phrase === "string") {  
                if (true) {
                    if (type && colours[type]) {
                        return ' <span style="color:'+colours[type]+';" title="'+type+'">' + phrase + '</span> ';
                    } else {
                        return ' <span style="color:black;">' + phrase + '</span> ';
                    }
                } else {
                    return ' ' + phrase + ' ';
                }

            } else {
                switch (phrase[0]) {   // Uses the first array element
                    case "action":
                        return translate(phrase[1]) + " " + translate(phrase[2]);

                    case "and":
                        return translate(phrase[1]) + " and " + translate(phrase[2]);

                    case "att_value":
                        if (context && context === "cause" || context === "caused") {
                            if (phrase[3] === "increase") {
                                return "an increase in the " + translate(phrase[2],'attribute') + " of " + translate(phrase[1],'object');
                            } else if (phrase[3] === "decrease") {
                                return "a decrease in the " + translate(phrase[2],'attribute') + " of " + translate(phrase[1],'object');
                            } else if (context === "cause") {
                                return "the " + translate(phrase[2],'attribute') + " of " + translate(phrase[1],'object') + " being " + translate(phrase[3],'value');
                            } else if (context === "caused") {
                                return "the " + translate(phrase[2],'attribute') + " of " + translate(phrase[1],'object') + " to be " + translate(phrase[3],'value');
                            } else {
                                return "the " + translate(phrase[2],'attribute') + " of " + translate(phrase[1],'object') + " is " + translate(phrase[3],'value');
                            }
                        } else {
                            return "the " + translate(phrase[2],'attribute') + " of " + translate(phrase[1],'object') + " is " + translate(phrase[3],'value');
                        }

                    case "causes1way":
                        return translate(phrase[1],null,"cause") + " causes " + translate(phrase[2],null,"caused");

                    case "causes2way":
                        return translate(phrase[1],null,"cause") + " causes " + translate(phrase[2],null,"caused");

                    case "comparison":
                        return " the " + translate(phrase[1]) + " of " + translate(phrase[2]) + " is " + translate(phrase[3]) + translate(phrase[4]);

                    case "if":
                        return translate(phrase[1]) + " if " + translate(phrase[2]);

                    case "linkxxx":
                        return "XXX";

                    case "not":
                        return " it is not true that " + translate(phrase[1]);

                    case "or":
                        return translate(phrase[1]) + " or " + translate(phrase[2]);

                    case "part":
                        return ' the ' + translate(phrase[2],'object') + " part of " + translate(phrase[1],'object');

                    case "process":
                        if (phrase.length === 2) {
                            return translate(phrase[1]);
                        } else if (phrase.length === 3) {
                            return translate(phrase[1]) + " " + translate(phrase[2]);
                        } else {
                            return translate(phrase[1]) + " " + translate(phrase[2]) + " " + translate(phrase[3]);
                        }

                    case "rangexxx":
                        return "XXX";

                    default:
                        return JSON.stringify(phrase);
                }
            }
        }
    }



    /**
     * Generates the (classic AKT) formal representation of a statement, in Prolog syntax.
     * @return {string} The formal version of the statement
     */
    generateFormal = function () {
        const infixOperator = {
            and:true,
            causes1way:true,
            causes2way:true,
            if:true,
            or:true};
            
        const formal = walk(this.json);
        this._formal = formal;
        return formal;

        function walk (part) {
            if (typeof part === "string") {  
                return part;

            } else if (part.length === 3 && infixOperator[part[0]]) {
                return walk(part[1])+' '+walk(part[0])+' '+walk(part[2]);

            } else {   // Unnecessarily generalised, since max of 3 (I think) cases.
                var result = part[0]+'(';
                for (var i=1; i<part.length; i++) {
                    var comma = i<part.length-1?',':'';
                    result += walk(part[i])+comma;
                }
                result += ')';
                return result;
            }
        }
    }


    // This is derived from generateFormal() above.   It's job is to identify each formal term
    // in a statement, and classify it according to its type.
    // Arguably, this could be done in generateFormal() itself, since it involves the same
    // walking-through the JSON, but it seems neater to do it separately.
    
    classifyFormalTerms = function () {
        var terms = {};
        var result = walk(this.json);
        return terms;

        function walk (phrase) {
            if (typeof phrase === 'string') {  
                return;

            } else if (phrase[0] === 'att_value') {
                oneStep(phrase[1],'object');
                oneStep(phrase[2],'attribute');
                oneStep(phrase[3],'value');

            } else if (phrase[0] === 'part') {
                oneStep(phrase[1],'object');
                oneStep(phrase[2],'part');
            
            } else if (phrase[0] === 'process') {
                if (phrase.length === 2) {         // ["process", Process]
                    oneStep(phrase[1],'process');
                } else if (phrase.length === 3) { // ["process", Object1, Process]
                    oneStep(phrase[1],'object');
                    oneStep(phrase[2],'process');
                } else if (phrase.length === 4) {  // ["process", Object1, Process, Object2]
                    oneStep(phrase[1],'object');
                    oneStep(phrase[2],'process');
                    oneStep(phrase[3],'object');
                } else {
                    //ERROR
                }
            
            } else if (phrase[0] === 'action') {
                if (phrase.length === 3) {         // ["action", Action, Object]
                    oneStep(phrase[1],'action');
                    oneStep(phrase[2],'object');
                } else if (phrase.length === 4) {  // ["action", Action, Object1, Object2]
                    oneStep(phrase[1],'action');
                    oneStep(phrase[2],'object');
                    oneStep(phrase[3],'object');
                } else {
                    //ERROR
                }

            } else {   // Some other filler predicate (if, causes1way, and...)
                for (var i=0; i<phrase.length; i++) {
                    oneStep(phrase[i],null);
                }
            }

        function oneStep(phrase, type) {
            if (typeof phrase === 'string') {
                    if (type) { // I.e. not null
                        if (!terms[phrase]) {
                            terms[phrase] = [];
                        }
                        if (!terms[phrase].includes(type)) {
                            terms[phrase].push(type);
                        }
                    }
                } else {
                    walk(phrase);
                }
            }
        }
    }



    // This is the direct equivalent of generateEnglishHtml(), and in fact is derived from it.

    generateFormalHtml = function() {
        var useHtml = true;
        var colours = {object:'#0000ff',attribute:'#ff0000',value:'#00aa00',process:'#8000ff',action:'#0088ff',part:'#000099'};
        const formal = translate(this.json,null,null);
        console.log(this._id,formal,'\n',$('<div>"'+formal+'</div>').text());
        this._formal = formal;
        return formal;

        function translate(phrase,type,context) {

            if (typeof phrase === "string") {  
                return '<span class="formal_term formal_term_'+type+'" data-type="'+type+'" title="'+type+'">' + phrase + '</span>';

            } else {
                switch (phrase[0]) {   // Uses the first array element

                    case "action":
                        if (phrase.length === 3) {
                            return 'action(' + translate(phrase[1],'action') + "," + translate(phrase[2],'object') + ')';
                        } else {
                            return 'action(' + translate(phrase[1],'action') + "," + translate(phrase[2],'object') + "," + translate(phrase[3],'object') + ')';
                        }

                    case "and":
                        return translate(phrase[1]) + " and " + translate(phrase[2]);

                    case "att_value":
                        return 'att_value(' + translate(phrase[1],'object') + ',' + translate(phrase[2],'attribute') + ',' + translate(phrase[3],'value') + ')';

                    case "causes1way":
                        return translate(phrase[1],null,"cause") + " causes1way " + translate(phrase[2],null,"caused");

                    case "causes2way":
                        return translate(phrase[1],null,"cause") + " causes2way " + translate(phrase[2],null,"caused");

                    case "comparison":
                        return 'comparison(' + translate(phrase[1],'attribute') + ',' + translate(phrase[2],'object') + ',' + translate(phrase[3]) + ',' + translate(phrase[4],'object') + ')';

                    case "if":
                        return translate(phrase[1]) + " if " + translate(phrase[2]);

                    case "linkxxx":
                        return "XXX";

                    case "not":
                        return 'not(' + translate(phrase[1]) +')';

                    case "or":
                        return translate(phrase[1]) + " or " + translate(phrase[2]);

                    case "part":
                        return 'part(' + translate(phrase[1],'object') + ',' + translate(phrase[2],'object') + ')';

                    case "process":
                        if (phrase.length === 2) {
                            return 'process(' + translate(phrase[1],'process') + ')';
                        } else if (phrase.length === 3) {
                            return 'process(' + translate(phrase[1],'object') + ',' + translate(phrase[2],'process') + ')';
                        } else {
                            return 'process(' + translate(phrase[1],'object') + ',' + translate(phrase[2],'process') + ',' + translate(phrase[3],'object') + ')';
                        }

                    case "rangexxx":
                        return "XXX";

                    default:
                        return JSON.stringify(phrase);
                }
            }
        }
    }

    generateFormalHtmlxxxxx = function () {
        var terms = {};
        var result = walk(this.json);
        return terms;

        function walk (phrase) {
            if (typeof phrase === 'string') {  
                return;

            } else if (phrase[0] === 'att_value') {
                oneStep(phrase[1],'object');
                oneStep(phrase[2],'attribute');
                oneStep(phrase[3],'value');

            } else if (phrase[0] === 'part') {
                oneStep(phrase[1],'object');
                oneStep(phrase[2],'part');
            
            } else if (phrase[0] === 'process') {
                if (phrase.length === 2) {         // ["process", Process]
                    oneStep(phrase[1],'process');
                } else if (phrase.length === 3) { // ["process", Object1, Process]
                    oneStep(phrase[1],'object');
                    oneStep(phrase[2],'process');
                } else if (phrase.length === 4) {  // ["process", Object1, Process, Object2]
                    oneStep(phrase[1],'object');
                    oneStep(phrase[2],'process');
                    oneStep(phrase[3],'object');
                } else {
                    //ERROR
                }
            
            } else if (phrase[0] === 'action') {
                if (phrase.length === 3) {         // ["action", Action, Object]
                    oneStep(phrase[1],'action');
                    oneStep(phrase[2],'object');
                } else if (phrase.length === 4) {  // ["action", Action, Object1, Object2]
                    oneStep(phrase[1],'action');
                    oneStep(phrase[2],'object');
                    oneStep(phrase[3],'object');
                } else {
                    //ERROR
                }

            } else {   // Some other filler predicate (if, causes1way, and...)
                for (var i=0; i<phrase.length; i++) {
                    oneStep(phrase[i],null);
                }
            }

        function oneStep(phrase, type) {
            if (typeof phrase === 'string') {
                    if (type) { // I.e. not null
                        if (!terms[phrase]) {
                            terms[phrase] = [];
                        }
                        if (!terms[phrase].includes(type)) {
                            terms[phrase].push(type);
                        }
                    }
                } else {
                    walk(phrase);
                }
            }
        }
    }



    findFormalTerms = function (term_type) {
        var kbId = AKT.state.current_kb;
        var kb = AKT.KBs[kbId];

        var terms = this.classifyFormalTerms();
        var terms1 = {};
        if (!term_type || term_type === 'all') {
            for (var id in terms) {
                terms1[id] = kb._formalTerms[id];
            }
        } else {
            for (var id in terms) {
                if (terms[id][0] === term_type) {
                    terms1[id] = kb._formalTerms[id];
                }
            }
        }
        console.log('--- ',term_type,terms,terms1);
        return terms1;
    }



    // For an individual sentence, new or being loaded.
    generateJsonFromFormal = function (formal) {

        let formal1 = AKT.tidyFormal(formal);
        //console.debug('\n',formal1);
        //formal1 = formal1.replace(/(\d+) \byear\b/g,"$1_year");   // Not working

        // HHow hacky is this?   Dealing with values expressed as single-quoted atoms 
        // in the Prolog .kb files.  Treating as a one-off legacy issue, so OK to
        // use crude solution...
        formal1 = formal1.replace(/ week/g,'_week');
        formal1 = formal1.replace(/ month/g,'_month');
        formal1 = formal1.replace(/ year/g,'_year');
        formal1 = formal1.replace(/\'/g,'');
        //console.debug(formal1);

        // First, we split the formal statement using ') if ', if it occurs.
        if (formal1.includes(') if ')) {
            var sif = formal1.split(') if ');
            var main = sif[0]+')';
            var condition = sif[1];
        } else {
            main = formal1;
            condition = null;
        }

        // Then, we check for the presence of a causes keyword, and move it to the
        // front.  (In Prolog terms, we change it from an infix operator to a functor.)
        if (main.includes(') causes1way')) {
            var scause = main.split(') causes1way ');
            var main1 = 'causes1way('+scause[0]+'),'+scause[1]+')';
        } else if (main.includes(') causes2way')) {
            var scause = main.split(') causes2way ');
            main1 = 'causes2way('+scause[0]+'),'+scause[1]+')';
        } else if (main.includes(' causes1way')) {
            var scause = main.split(' causes1way ');
            main1 = 'causes1way('+scause[0]+','+scause[1]+')';
        } else if (main.includes(' causes2way')) {
            var scause = main.split(' causes2way ');
            main1 = 'causes2way('+scause[0]+','+scause[1]+')';
        } else {
            main1 = main;
        }

        // We now attach the 'if' as a functor, if it occurs.
        if (condition) {
            formal1 = 'if('+main1+','+condition+')';
        } else {
            formal1 = main1;
        }

        // We now change from a functor-style for various keywords to a list, with the 
        // functor now the first element of the list.  In Prolog terms, this is
        // euivalent to using univ ( =.. ), e.g. a(b,c) =.. [a,b,c].
        var formal2 = formal1;
        //var sa = formal1.replace(/\(/g,',[');
        formal2 = formal2.replace(/att_value\(/g,'[att_value,');
        formal2 = formal2.replace(/if\(/g,'[if,');
        formal2 = formal2.replace(/causes1way\(/g,'[causes1way,');
        formal2 = formal2.replace(/causes2way\(/g,'[causes2way,');
        formal2 = formal2.replace(/process\(/g,'[process,');
        formal2 = formal2.replace(/action\(/g,'[action,');
        formal2 = formal2.replace(/part\(/g,'[part,');
        formal2 = formal2.replace(/link\(/g,'[link,');
        formal2 = formal2.replace(/range\(/g,'[range,');
        formal2 = formal2.replace(/comparison\(/g,'[comparison,');
        formal2 = formal2.replace(/\(not /g,'[not,');
        formal2 = formal2.replace(/^not /g,'[not,');

        // We now enclose all words in double-quotes (for JSON).
        var formal3 = formal2.replace(/([a-zA-Z0-9_\.\<\>%]+)/g, "\"$1\"");

        // Finally, we replace all closing round brackets with closing square brackets...
        var jsonString = formal3.replace(/\)/g,']');
        // ... and try to parse the result, to check that it's valid JSON.
        // Currently (Sept 2021), 3 statements fail two for 'not' that is not preceded by
        // opening bracket; one for 'or' in condition.  These are excluded from further use.
        // TODO: fix these two issues.
        try { // statements to try
            var jsonObject = JSON.parse(jsonString);
            return jsonObject;
        }
        catch (err) {
            AKT.state.error_count += 1;
            var f = ' '+err;
            var bits = f.split(' ');
            var positionText = bits[bits.length-1];
            var position = parseInt(positionText,10)+1;
            var cleanJsonString = '';
            for (var i=0; i<jsonString.length; i++) {
                var c = jsonString.charAt(i);
                if (c !== '"') {
                    cleanJsonString += c;
                }
                if (i === position) {
                    cleanJsonString += '***';
                }
            }
             
            var before = jsonString.substring(0,position);
            var after = jsonString.substring(position+1,999);
            //var markedString = before+'<here>'+after;
            //return err+'...'+'<br/>The JSON version shows the approximate position of the error, marked with ***<br/>Formal version: <br/>'+formal+'<br/>JSON version:<br/>'+cleanJsonString;
            return 'Cannot translate: '+cleanJsonString;
        }


        function tidyFormal(formal) {

            let formal1 = formal.replace(/\)if /g,') if ');

            formal1 = formal1.replace(/\)causes/g,') causes');
            formal1 = formal1.replace(/\)and /g,') and ');
            formal1 = formal1.replace(/\)or /g,') or ');

            return formal1;
        }
    }


    // Check if this statement passes all the filters that have been set.
    passFiltersxxx = function(filters) {
        var ok_xxx = true;
        var ok_conditional = true;
        var ok_formal_term = true;
        var ok_source = true;
        var ok_type = true;

        var k1 = this.json[0];
        var k2 = this.json[1][0];

        //console.debug('passFilters():'+this._id,'\n',k1,k2,': ',JSON.stringify(filters));

/*
        TODO: Redo anything using these filters to use 'type onstead.  See result5 below.
        if (filters.att_value) {
            result1 = false;
            if ((k1==='att_value' || k2==='att_value') && filters.att_value) {
                result1 = true;
            } else if ((k1==='causes1way' || k1==='causes1way' || k2==='causes1way' || k2==='causes1way') && filters.causal) {
                result1 = true;
            }
        }
*/

        // result2: conditional
        if (filters.conditional) {
            ok_conditional = false;
            if (filters.conditional === 'yes' && k1 === 'if') {
                ok_conditional = true;
            } else if (filters.conditional === 'no' && k1 !== 'if') {
                ok_conditional = true;
            }
        }

/*
        if (filters.formal_terms) {
            result3 = false;
            if (this._english && this._english.includes(filters.formal_terms_value)) {
                result3 = true;
            }
        } else {
            result3 = true;    // If no formal term, don't filter the sttements by formal term.
        }
*/
        // result3: matches formal term
        console.log('---',filters,filters.formal_term)
        if (filters.formal_term) {
            console.log('+++');
            ok_formal_term = false;
            var flat = this._json.flat(99);
            //if (this._english && this._english.includes(filters.formal_term)) {
                if (flat.indexOf(filters.formal_term) > -1) {
                ok_formal_term = true;
            }
        } else {
            ok_formal_term = true;    // If no formal term, don't filter the sttements by formal term.
        }

        
        if (filters.source) {
            ok_source = false;
            for (var i=0; i<this._sources.length; i++) {
                if (this._sources[i] === filters.source_value) {
                    ok_source = true;
                    break;
                }
            }
        } else {
            ok_source = true;    // If no source, don't filter the sttements by source.
        }

        if (filters.type) {
            if (filters.type === this._type) {
                ok_type = true;
            } else {
                ok_type = false;
            }
        }

        console.log({ok_xxx:ok_xxx,ok_conditional:ok_conditional,ok_formal_term:ok_formal_term,ok_source:ok_source,ok_type:ok_type});
        if (ok_xxx && ok_conditional && ok_formal_term && ok_source && ok_type) {
            return true;
        } else {
            return false;
        }
    }


    // This filtering system is under development.    
    // Here, I divide the filter checkboxes into two classes, according to their
    // checked/not-checked status.
    // - those that include a statement only if it's checked, and exclude it if it's not checked.
    //   Examples: conditional, causal....
    // - those that inclde a statement only if it's checked *AND* some qualifier is provided,
    //   and *INCLUDE* it if it's not checked. 
    //   Examples: formal_term, source

    /* The possible properties for the 'filters' object:
        conditional:       true/false
        non_conditional:   true/false;
        att_value:         true/false     
        causal:            true/false
        comparison:        true/false
        formal_term:       true/false    combined with...
        formal_term_value: formal_term._id
        source:            true/false    combined with...
        source_value:      source._id
        topic:             true/false    combined with...
        topic_value        topic._id

    */

    passFilters = function (filters) {
        //console.log('****',filters);

        //var ok = {all:true,conditional:true,non_conditional:true,att_value:true,causal:true,formal_term:true,source:true};

        var k1 = this._json[0];
        var k2 = this._json[1][0];
        var k3 = (k1==='if') ? k2 : k1;

        if (filters) {
            if (k1 === 'if') {
                if (filters.hasOwnProperty('conditional')) {
                    if (filters.conditional === false) {
                        return false;
                    }
                }
            } else {
                if (filters.hasOwnProperty('non_conditional')) {
                    if (filters.non_conditional === false) {
                        return false;
                    }
                }
            }
            
            if (k3 === 'att_value') {
                if (filters.hasOwnProperty('att_value')) {
                    if (filters.att_value === false) {
                        return false;
                    }
                }
            } else if (k3 === 'causes1way' || k3 === 'causes2way') {
                if (filters.hasOwnProperty('causal')) {
                    if (filters.causal === false) {
                        return false;
                    }
                }
            } else if (k3 === 'comparison') {
                if (filters.hasOwnProperty('comparison')) {
                    if (filters.comparison === false) {
                        return false;
                    }
                }
            }

            if (filters.hasOwnProperty('formal_term') && filters.hasOwnProperty('formal_term_value')) {
                if (filters.formal_term && filters.formal_term_value !== '' && !this.containsFormalTerm(filters.formal_term_value)) {
                    return false;
                }
            }

            // "node_name" is the name used for diagram nodes.  Basically
            // composed of all the terms in the causes or caused part of a 
            // causal statement, except for the value term.
            // Since each causal statement has two nodes, the statement has two properties, but these
            // need to be or'd together, not and'd (like formal_term+source+topic) if both are set
            // (i.e. we select statements that have one or the other).   
            // So, the Sentence propert is node_names plural, and it is a simple object with
            // 2 properties, start_name and end_name.   It is up to this.contansNodeName() to
            // handle this correctly.
            // The node_names property is added as two  of each statement when the 
            // causal graph is built, when the KB is loaded.
            if (filters.hasOwnProperty('node_names') && filters.hasOwnProperty('node_name_values')) {
                if (filters.node_names && filters.node_name_values !== '' && !this.containsNodeName(filters.node_name_values)) {
                    return false;
                }
            }

            if (filters.hasOwnProperty('source') && filters.hasOwnProperty('source_value')) {
                if (filters.source && filters.source_value !== '' && !this._sources.includes(filters.source_value)) {
                    return false;
                }
            }

            if (filters.hasOwnProperty('topic') && filters.hasOwnProperty('topic_value')) {
                if (filters.topic && filters.topic_value !== '' && !this.includedInTopic(filters.topic_value)) {
                    return false;
                }
            }

            if (filters.hasOwnProperty('search_expression_js')) {
                if (filters.search_expression_js && !this.includedInSearchExpressionJs(filters.search_expression_js)) {
                    return false;
                }
            }
        }

        return true;
    }


    containsFormalTerm = function (term) {
        var flat = this._json.flat(99);
        //if (this._english && this._english.includes(filters.formal_term)) {
        if (flat.indexOf(term) > -1) {
            return true;
        } else {
            return false;
        }
    }


    // nodeNames is a simple object with at most 2 properties: {start_name:xxx, end_name:yyy},
    // and represents the user's options when double-clicking on a diagram node:
    // - only start_name is set when the user does dblclick while holding the 's' key down;
    // - only end_name is set when the user does dblclick while holding the 'e' key down;
    // - both start_name and end_name are set when the user does dblclick without holding 
    //   down the s or e keys.
    //
    // this._node_names is a statement property just for causal statements.  It is a simple 
    // object which always has  2 properties: {start_name:xxx, end_name:yyy} (but just for
    // causal statements), and is created when the KB is loaded.
    containsNodeName = function (nodeNames) {
        console.log('***2',nodeNames);
        if (this._node_names) {
            if (nodeNames.start_name && this._node_names.start_name === nodeNames.start_name ||
                nodeNames.end_name && this._node_names.end_name === nodeNames.end_name) {
                    return true;
            }
        } else {
            return false;
        }
    }

    // Cosmetic function for includedInBooleanSearch(searchTerm)
    includedInTopic = function (topicId) {
        //console.log('== ',topicId);
        var kbId = AKT.state.current_kb;
        var kb = AKT.KBs[kbId];
        var topic = kb._topics[topicId];
        var searchExpressionJs = topic._javascript; 
        var result = this.includedInSearchExpressionJs(searchExpressionJs);
        return result;
    }

    // This is the uiversal method for seeing whether a statement is included with a Boolean
    // search expression.   This search expression might either come from the use entering it
    // in the Boolean search tool; or be the expression used to define a particular topic.
    includedInSearchExpressionJs = function (searchExpressionJs, options) {   // options are for including conditional part
        var target;

        var kbId = AKT.state.current_kb;
        var kb = AKT.kbs[kbId];

        if (options && !options.include_conditions) {
            target = this._formal.split(/\)if\s/)[0]; 
        } else {
            target = this._formal;
        }
        var regex = {};
        try {
            var result = eval(searchExpressionJs);
            if (result) {
                return true;
            } else {
                return false;
            }
        }
        catch(err) {
            console.log('\n*** ERROR: \n',this._id, searchExpressionJs);
            //console.log('\n*** ERROR: \n',search2);
            return false;
        }

        // This is the function wrapping each formal term in the search expression.
        // There are various ways we can search a statement to see if target 'contains'
        // the search term.   This is the simplest - to search the string looking for 
        // the term as a whole word (\b...\b).
        function contains(searchTerm) {
            regex[searchTerm] = [new RegExp('\\b'+searchTerm+'\\b')];

            // object+subobjects
            if (options && options.include_subobjects === 'object+subobjects') {
                for (var i=0; i<regex[searchTerm].length; i++) {
                    if (target.search(regex[searchTerm][i]) !== -1) {
                        return true;
                    }
                }
                return false;

            // Just subobjects (yes, there are a couple of cases of this)
            } else if (options && options.include_subobjects === 'subobjects') {
                for (var i=1; i<regex[searchTerm].length; i++) {
                    if (target.search(regex[searchTerm][i]) !== -1) {
                        return true;
                    }
                }
                return false;

            // Just objects (the fallback if not specified, since most common)
            } else {
                if (target.search(regex[searchTerm][0]) !== -1) {
                    return true;
                } else {
                    return false;
                }
            }
        }
    }



    // =========================================================================
    // 12 July 2022
    // This is the development area for the "extended boolean search" code (see email
    // to the AKT group dated 12 July 2022  with the same Subject.
    // The idea is to fully isolate the code for handling this from the previous code
    // for handling filters.  There is quite a lot of duplicaction, with the use of the
    // prefix ebf_ for all functions/methods.

    extendedBooleanSearch = function (searchExpression) {
        console.log(this._id,searchExpression);
    }



}
