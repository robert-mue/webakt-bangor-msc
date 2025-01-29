/** Class representing a knowledge base. 
* @constructor
*/
class Kb {
    /**
     * Create a knowledge base class.
     * @param {object} spec - an object-literal containing initialising data.
     */
    constructor(spec) {     
        this._id = spec.name;

        //this._images.nyanya0001 = new Image({id:'nyanya0001',url:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR33JS988Kp1SL184AFRpm1uVCV7p2s4d1zew&usqp=CAU',description:'Picture of nyanya'});
        //this._images.nyanya0002 = new Image({id:'nyanya0002',url:'http://www.africa.com',description:'Another picture of nyanya'});
        //this._images.nyanya0003 = new Image({id:'nyanya0003',url:'http://www.africa.com',description:'Yet another picture of nyanya'});
        this._sources = {};
        this._statements = {};
        this._topics = {};

        this._counters = {
            statement:0
        };
        if (spec.kb_from_file) {
            this._kb_from_file = spec.kb_from_file;
            this.loadKbFromFile(spec.kb_from_file);
        } else {
            this._acknowledgements = '';
            this._author = ''; 
            this._description = ''; 
            this._counters = {};
            this._diagrams = {};
            this._formalTerms = {};
            this._images = {};
            this._metadata = {};
            this._methods = '';
            this._objectHierarchies = {};
            this._purpose = '';
            this._source_user_labels = ['Age','Ethnic origin'];    // TODO: This obviously should
                // be an empty array, unitl I provide a dialog to allow user to provide them for
                // a new KB.
            this._sources = {}
            this._statements = {};
            this._study_area = '';
            this._timing = '';
            this._title = ''; 
            this._topicHierarchies = {};
            this._topics = {}
        }
        return this;

    }


    get objects() {
        if (this._objects) {
            return this._objects;
        } else {
            return null;
        }
    }


    get formalTerms() {
        if (this._formalTerms) {
            return this._formalTerms;
        } else {
            return null;
        }
    }



    get sources() {
        if (this._sources) {
            return this._sources;
        } else {
            return null;
        }
    }


    get statements() {
        if (this._statements) {
            return this._statements;
        } else {
            return null;
        }
    }


    get topics() {
        if (this._topics) {
            return this._topics;
        } else {
            return null;
        }
    }

    // ===========================================================
    // Add one instance of the appropriate class

    addFormalTerm = function(id,json) {
        this._formal_term[id] = json;
    }




    addSource = function(source) {
        if (source) {
            this._sources[source.id] = source;
        }
    }


    addStatement = function(statement) {
        if (statement) {
            this._statements[statement._id] = statement;
            AKT.trigger('new_statement_created_event',{statement:statement});
        }
    }


    addTopic = function(id,json) {
        this._topics[id] = json;
    }


    // ================================================ METHODS

    // ------------------------------------------------ FORMAL TERMS
    findImages = function () {

        return this._images;
    }


    // --------------------------------------------------------------- STATEMENTS
    findFormalTermById = function(id) {
        if (id) {
            return this._formalTerms[id];
        } else {
            return null;
        }
    }


    findSourceById = function(id) {
        if (id) {
            return this._statements[id];
        } else {
            return null;
        }
    }


    findStatementById = function(id) {
        if (id) {
            return this._statements[id];
        } else {
            return null;
        }
    }


    findTopicById = function(id) {
        if (id) {
            return this._topics[id];
        } else {
            return null;
        }
    }


    findHierarchies = function (type, links) {
        var hierarchies = {};
        var hierarchyIds = []; 

        if (Array.isArray(links)) {
            for (var i=0; i<links.length; i++) {
                var link = links[i];
                if (link.item === "top") {
                    hierarchyIds.push(link.hierarchy);
                }
            }
        } else {
            for (var id in links) {
                var link = links[id];
                if (link.item === "top") {
                    hierarchyIds.push(link.hierarchy);
                }
            }
        }

        for (var i=0; i<hierarchyIds.length; i++) {
            if (type === 'object') {
                var hierarchy = new ObjectHierarchy({id:hierarchyIds[i]});
            } else if (type === 'topic') {
                hierarchy = new TopicHierarchy({id:hierarchyIds[i]});
            } else {
                hierarchy = null;
            }
            hierarchies[hierarchyIds[i]] = hierarchy;
        }
        return hierarchies;
    }


    findSources = function (filter) {   // 'options' allows for selectors, like GoJS 
                                            // for Nodes in Diagram
        if (!filter) {
            return this._sources;
        } else {
            return this._sources;
        }
    }


    findStatementsxxx = function (filters) {   // 'options' allows for selectors, like GoJS 
                                            // for Nodes in Diagram
        if (!filters) {
            return this._statements;
        } else {
            if (filters.validJsonOnly) {  // Exludes statements that don't convert to English
                var okStatements1 = {};
                for (var statementId in this._statements) {
                    var statement = this._statements[statementId];
                    if (statement._english && !statement._english.includes('SyntaxError')) {
                        okStatements1[statementId] = statement;
                    }
                }
            } else {
                okStatements1 = this._statements;
            }

            if (filters.statements_for_source) {
                var source = filters.statements_for_source;
                var okStatements2 = {};
                for (var statementId in okStatements1) {
                    var statement = okStatements1[statementId];
                    for (var i=0; i<statement.sources.length; i++) {
                        if (source.id === statement.sources[i]) {
                            okStatements2[statementId] = statement;
                            break;
                        }
                    }
                }
            } else {
                okStatements2 = okStatements1;   // TODO: fix this horrible method
            }
            return okStatements2;
        }
    }


    findStatements = function (filters) {
        var okStatements = {};
        //console.log('>>>\n',filters,'\n',this._statements);

        if (typeof filters === 'object') {
            for (var statementId in this._statements) {
                var statement = this._statements[statementId];
                if (statement.passFilters(filters)) {
                    okStatements[statementId] = statement;
                }
            }

        // See email to the AKT group dated 12th July 2022 on "extended boolean search"
        } else {  // filters is a string, being the pure JavaScript for the extended Boolean search
            var searchExpression = filters;
            for (var statementId in this._statements) {
                var statement = this._statements[statementId];
                if (statement.extendedBooleanSearch(searchExpression)) {
                    okStatements[statementId] = statement;
                }
            }

        }
        return okStatements;
    }


    findNodeNames = function () {
        var okNodeNames = {};
        for (var statementId in this._statements) {
            var statement = this._statements[statementId];
            if (statement._node_names) {
                var nodeNames = statement._node_names;
                okNodeNames[nodeNames.start_name] = {id:nodeNames.start_name};
                okNodeNames[nodeNames.end_name] = {id:nodeNames.end_name};
            }
        }
        return okNodeNames;
    }


    findTopics = function (filters) {
        var okTopics = {};
        for (var topicId in this._topics) {
            var topic = this._topics[topicId];
            if (topic.passFilters(filters)) {
                okTopics[topicId] = topic;  // The topic object, not its ID.
            }
        }
        return okTopics;
    }


    findFormalTerms = function (filters) {
        var okFormalTerms = {};
        for (var formalTermId in this._formalTerms) {
            var formalTerm = this._formalTerms[formalTermId];
            if (formalTerm.passFilters(filters)) {
                okFormalTerms[formalTermId] = formalTerm;
            }
        }
        return okFormalTerms;
    }


    extractFormalTerms() {
        var allFormalTerms = {};
        for (var statementId in this._statements) {
            var statement = this._statements[statementId];
            var terms = statement.classifyFormalTerms();
            for (var termId in terms) {
                allFormalTerms[termId] = terms[termId];
            }
        }
        var count = [0,0,0,0];
        for (var id in allFormalTerms) {
            count[allFormalTerms[id].length] += 1;
        }
    }

    // Returns an ARRAY of the ID (key) of the words (formal terms) that satisfy the filters object.
    // E.g. filters = {term_type:'process'};
    findWords = function (filters) {   
        var words = [];
        for (var formalTermId in this._formalTerms) {
            var formalTerm = this._formalTerms[formalTermId];
            if (formalTerm.passFilters(filters)) {
                words.push(formalTermId);
            }
        }
        return words;
    }

    // This looks at the key for every instance of the specified list of objects,
    // and finds the largest integer part of that key.   So if the list of objects is
    // this._statements, the key has the form snnn, and the prefix part is 's',
    // it finds the largest value for the nnn part.
    // objects could be anything, but is here because it is here in Class Kb because ot
    // is probably some collection of entities for this KB.
    // Currently only statements employ this type of key.
    findLargestIndex = function (objects,prefix) {
        console.log(objects,prefix);
        var maxIndex = 0;
        for (var key in objects) {
            var index = parseInt(key.replace(prefix,''));
            maxIndex = index > maxIndex ? index : maxIndex;
        }
        return maxIndex;
    }


    checkStatements = function () {
        var kbId = this._id;
        AKT.state.statement_check = {ok:0,fail:0};
        $.each(this._statements, function(id,statement) {
            var result = statement.checkFormal();
            AKT.state.statement_check[result.peg.result] += 1;
            if (result.peg.result === 'fail') {
                //console.log(JSON.stringify(result));
            }
        });
        console.log('\nCheck counts: ',JSON.stringify(AKT.state.statement_check),'\n');
    }

    
    // This is purely to generate a test .csv file, for demo purposes.
    // In practice, the idea is that a knowledge elicitatpr would create a spreadsheet
    // with two table - one for the sentences, and one for the sources, cross-
    // referenced using the source number.
    generateCsv = function () {

        // Build source lookup table
        // The idea is to give each source a simple number, this being easier to type
        // than it's actual ID.
        var lookup = {};
        var i = 0;
        $.each(this._sources, function (sourceId,source) {
            i += 1;
            lookup[source._id] = i;
            var string = i + ';' + source._id;
            //console.log(string);
        });
            

        $.each(this._statements, function(statementId,statement) {
            var sourceIndexes = '';
            $.each(statement._sources, function(sourceId,source) {
                if (sourceIndexes === '') {
                    sourceIndexes += lookup[source];
                } else {
                    sourceIndexes += ','+lookup[source];
                }
            });
            //console.log(statementId,';',statement._formal,';',sourceIndexes,';',statement._memo);
        });
    }

    
    buildKbFromCsv = function (statements,sources) {
        //console.log(statements,sources);

        // First, create the lookup of sourceId given source number.
        // Note that source number is a string for an integer, not a real integer.
        var sourceIdLookup= {};
        var csvSourcesArray = [];
        var csvSources = sources.split('\n');
        for (var i=0;i<csvSources.length; i++) {
            csvSourcesArray[i] = csvSources[i].split('#');
            var index = csvSourcesArray[i][0];
            var sourceId = csvSourcesArray[i][1];
            sourceIdLookup[index] = sourceId;
            this._sources[sourceId] = new Source({
                day: 1,
                extras: 'none',
                id: sourceId,
                interviewee: 'xxx',
                interviewer: 'yyy',
                location: 'zzz',
                memo: null,
                month: 2,
                name: 'Fred',
                sex: 'm',
                suffix: 'a',
                year: 2000
            });
        }
        console.log(sourceIdLookup);

        var csvStatements = statements.split('\n');
        for (var i=0;i<csvStatements.length; i++) {
            var sources = [];
            var s = csvStatements[i].split('#');
            if (s.length >= 4) {
                s[2] = s[2].split(',');
                for (var j=0; j<s[2].length; j++) {
                    var index = s[2][j];
                    var sourceId = sourceIdLookup[index];
                    sources.push(this._sources[sourceId]);
                    //sourceIds.push(sourceId);
                }
                this._statements[s[0]] = new Statement({id:s[0],formal:s[1],sources:sources});
            }
        }

        console.log(this);
    }



    // Note that this method MUST come before loadKbFromFile, since otherwise
    // you get a "function not found" error!
    makeHierarchies1 = function (type,links) {
        var hierarchyNames = []; 
        var rootIds = [];

        if (Array.isArray(links)) {  // It's this one.
            for (var i=0; i<links.length; i++) {
                var link = links[i];
                if (link.item === "top") {
                    hierarchyNames.push(link.hierarchy.replace(/ /g,'_'));
                    rootIds.push(link.subitem.replace(/ /g,'_'));
                }
            }
        } else {
            for (var id in links) {
                var link = links[id];
                if (link.item === "top") {
                    hierarchyNames.push(link.hierarchy.replace(/ /g,'_'));
                    rootIds.push(link.subitem);
                }
            }
        }

        var hierarchies = {};
        for (var i=0; i<hierarchyNames.length; i++) {
            var hierarchyName = hierarchyNames[i];
            var hierarchy = new Hierarchy({kb:this,type:type,root:rootIds[i],name:hierarchyName,links:links});
            hierarchies[hierarchyName] = hierarchy;
        }

        return hierarchies;
    }



    makeHierarchies2 = function (hierarchiesFromFile) {
        var hierarchies = hierarchiesFromFile;
        return hierarchies;
    }

/*
    // This is a version of ObjectHierarchy/TopicHierarchy makeTree() method, which handles
    // the whole tree (i.e. combining all herarchies under 'top'.   I could achieve the same
    // effect by looping over all  the hierarchies and combining their subtrees together,
    // but frankly it's actually easier and uses less code to do it this way.
    makeTree = function (treeType) {    // 'object' or 'topic'
        const kbTreeTypes = {object:'subobjects',topic:'subtopics'};
        const kbTreeType = kbTreeTypes[treeType];
        var treeDown = {};
        var treeUp = {};
        var links = this._kb_from_file[kbTreeType];
        if (Array.isArray(links)) {
            for (var i=0; i<links.length; i++) {
                var link = links[i];
                if (!treeDown[link.item]) {
                    treeDown[link.item] = [];
                }
                treeDown[link.item].push(link.subitem);
                treeUp[link.subitem] = link.item;
            }
        } else {
            for (var id in links) {
                var link = links[id];
                if (!treeDown[link.item]) {
                    treeDown[link.item] = [];
                }
                treeDown[link.item].push(link.subitem);
                treeUp[link.subitem] = link.item;
            }
        }
        return [treeDown,treeUp];
    };
*/

    makeUlTree = function (treeType) {
        const tree = this.makeTree(treeType);
        var treeDown = tree[0]
        var ul = $('<ul class="myUL"></ul>');
        getAll(ul, treeDown, 'top', 0);
        return ul;

        function getAll(ul, treeDown, node, level) {
            level += 1;
            var children = treeDown[node];
            for (var i=0; i<children.length; i++) {
                if (level === 1) {
                    var li = $('<li class="level'+level+'">'+children[i]+'</li>');
                } else {
                    li = $('<li class="level'+level+'">'+children[i]+'</li>');
                }
                $(ul).append(li);
                if (treeDown[children[i]]) {
                    var ul1 = $('<ul class="nested"></ul>');
                    $(li).append(ul1);
                    getAll(ul1, treeDown, children[i], level);
                }
            }
        }
    };


    filter = function(filter) {
        var temp = {};
        $.each(this._filteredStatements, function(id,statement) {
            if (statement.passFilters(filter)) {
                temp[id] = statement;
            }
        });
        this._filteredStatements = temp;
        return this;
    }
                

    // You might think that I would generate a whole object from the internal KB object,
    // consisting of just those properties that need to be saved, and the JSON.srngify the
    // whole lot.  However, that produces a file with just one line in it, which is a pain
    // to work with.   The alternative is touse the third argument of JSON.stringify, but 
    // that puts each key:value pair on a separate line.
    // So instead I generate a string for each element (e.g. one sattement, one source),
    // and add that to the eventual string, with a n after each item.

    // 30 mins later...
    // Just decided to use 3rd argument of JSON.stringify, and just live with the
    // length output.  Not easy to get the strings handled as JSON.

    generateJsonFromKb = function () {

        var jsonObject = {
            metadata:{}, 
            formalTerms:{},
            statements:{}, 
            sources:{}, 
            source_user_labels:[],
            subobjects:[],
            subtopics:[],
            topics:{}
        };

        // Metadata
        for (var itemId in this._metadata) {
            if (itemId !== 'file') {   // This should not be saved in file, since user could change it.
                        // Only filled in when a user loads a KB from file.
                var item = this._metadata[itemId];
                jsonObject.metadata[itemId] = item;
            }
        };


        // Formal Terms
        for (var itemId in this._formalTerms) {
            var formalTerm = this._formalTerms[itemId];
            var formalTermJson = {
                term: formalTerm._term,
                type: formalTerm._type,
                description:formalTerm._description,
                synonyms:formalTerm._synonyms,
                memo: formalTerm._memo
            };
            jsonObject.formalTerms[itemId] = formalTermJson;
        }


        // Statements
        for (var itemId in this._statements) {
            var statement = this._statements[itemId];
            var statementJson = {
                id: statement._id,
                json: statement._json,
                type: statement._type,
                description:statement._description,
                source_ids:statement._sources,
                memo: statement._memo
            };
            jsonObject.statements[itemId] = statementJson;
        }

        // Sources
        for (var itemId in this._sources) {
            var source = this._sources[itemId];
            var sourceJson = {
                id: source._id,
                name: source._name,
                location: source._location,
                suffix: source._suffix,
                method: source._method,
                interviewer: source._interviewer,
                interviewee: source._interviewee,
                sex: source._sex,
                day: source._day,
                month: source._month,
                year: source._year,
                memo: source._memo,
                extras: source._extras
            }
            jsonObject.sources[itemId] = sourceJson;
        }

        // Topics
        for (var itemId in this._topics) {
            var topic = this._topics[itemId];
            var topicJson = {
                id: topic._id,
                name: topic._id,   // TODO: should be name!!
                description: topic._description,
                search_term: topic._search_term,
                nested_list: topic._json,
                objects: topic._objects
            };
            jsonObject.topics[itemId] = topicJson;
        }

        // TODO: Comletely overhaul to have compact, readable, DRY notation
        // Subobjects (from objectHierarchies)
        for (var itemId in this._objectHierarchies) {
            var objectHierarchy = this._objectHierarchies[itemId];
            var subobject = {
                id: objectHierarchy._id,
                name: objectHierarchy._name,   
                root: objectHierarchy._description,
                tree_down: objectHierarchy._tree_down,
                tree_up: objectHierarchy._tree_up,
                type: objectHierarchy._type
            };
            jsonObject.subobjects.push(subobject);
        }

        // TODO: Comletely overhaul to have compact, readable, DRY notation
        // Subtopics (from topicHierarchies)
        for (var itemId in this._topicHierarchies) {
            var topicHierarchy = this._topicHierarchies[itemId];
            var subtopic = {
                id: topicHierarchy._id,
                name: topicHierarchy._name,   
                root: topicHierarchy._description,
                tree_down: topicHierarchy._tree_down,
                tree_up: topicHierarchy._tree_up,
                type: topicHierarchy._type
            };
            jsonObject.subtopics.push(subtopic);
        }


        return jsonObject;
    }

    generateJsonFromKbForSearch = function () {

        var searchArray = [];


        // Metadata
        for (var itemId in this._metadata) {
            var item = this._metadata[itemId];
            searchArray.push(['metadata',itemId,item]);
        };

/*
        // Formal Terms
        for (var itemId in this._formalTerms) {
            var formalTerm = this._formalTerms[itemId];
            var formalTermJson = {
                term: formalTerm._term,
                type: formalTerm._type,
                description:formalTerm._description,
                synonyms:formalTerm._synonyms,
                memo: formalTerm._memo
            };
            jsonObject.formalTerms[itemId] = formalTermJson;
        }
*/

        // Statements
        for (var itemId in this._statements) {
            var statement = this._statements[itemId];
            var statementJson = {
                id: statement._id,
                json: statement._json,
                type: statement._type,
                description:statement._description,
                source_ids:statement._sources,
                memo: statement._memo
            };
            searchArray.push(['statement',itemId,JSON.stringify(statementJson)]);
        }
/*
        // Sources
        for (var itemId in this._sources) {
            var source = this._sources[itemId];
            var sourceJson = {
                id: source._id,
                name: source._name,
                location: source._location,
                suffix: source._suffix,
                method: source._method,
                interviewer: source._interviewer,
                interviewee: source._interviewee,
                sex: source._sex,
                day: source._day,
                month: source._month,
                year: source._year,
                memo: source._memo,
                extras: source._extras
            }
            jsonObject.sources[itemId] = sourceJson;
        }

        // Topics
        for (var itemId in this._topics) {
            var topic = this._topics[itemId];
            var topicJson = {
                id: topic._id,
                name: topic._id,   // TODO: should be name!!
                description: topic._description,
                search_term: topic._search_term,
                nested_list: topic._json,
                objects: topic._objects
            };
            jsonObject.topics[itemId] = topicJson;
        }

        jsonObject.subobjects = this._objectHierarchies;
        jsonObject.subtopics = this._topicHierarchies;

        return jsonObject;
*/
    }




                   


    loadKbFromFile = function (file_kb) {
        // Copy metadata properties across as top-level KB properties.
        // No idea why I decided  to do this.  Both forms kept in for legacy reasons.
        // TODO: rationalise throughout to use a kb._metadata property.
        this._metadata = {};
        this._formalTerms = {};

        var items = file_kb.metadata;
        for (var itemId in items) {
            this['_'+itemId] = items[itemId];
            this._metadata[itemId] = items[itemId];
        }


        // formalTerms
        if (file_kb.formalTerms) {   // Legacy
            var formalTerms = file_kb.formalTerms;
        } else if (file_kb.formal_terms) {    // Current (Aug 2022)
            formalTerms = file_kb.formal_terms;
        }
        for (var id in formalTerms) {  
            var spec = formalTerms[id];
            spec.kb = this._id;
            var formalTerm = new FormalTerm({kb:this, id:id, from_file:spec});
            this._formalTerms[id] = formalTerm;
        }


        // object hierarchies
        this._objectHierarchies = this.makeHierarchies1('object', file_kb.subobjects);
        //this._objectHierarchies = this.makeHierarchies2(file_kb.subobjects);


        // sources
        if (file_kb.sources) {
            for (var id in file_kb.sources) {
                var source = new Source({id:id, from_file:file_kb.sources[id]});
                this._sources[id] = source;
            }
        } else if (file_kb.source_ids) {
            for (var id in file_kb.source_ids) {
                var source = new Source({id:id, from_file:file_kb.source_ids[id]});
                this._sources[id] = source;
            }
        }


        // statements
        if (file_kb.sentences) {   // Legacy...
            for (var id in file_kb.sentences) {
                var statement = new Statement({id:id, kb:this, from_file:file_kb.sentences[id]});
                this._statements[id] = statement;
            }
        } else if (file_kb.statements) {   // New format (August 2022)
            for (var id in file_kb.statements) {
                var statement = new Statement({id:id, kb:this, from_file:file_kb.statements[id]});
                this._statements[id] = statement;
            }
        }
        this._filteredStatements = this._statements;


        // topics
        for (var id in file_kb.topics) {
            var id1 = id.replace(/ /g,'_');
            var topic = new Topic({id:id1,from_file:file_kb.topics[id]});
            this._topics[id1] = topic;
        }


        // topic hierarchies
        this._topicHierarchies = this.makeHierarchies1('topic', file_kb.subtopics);
        //this._topicHierarchies = this.makeHierarchies2(file_kb.subtopics);


        this._source_user_labels = file_kb.source_user_labels;

        // images
/*
        if (file_kb.images) {
            if (Array.isArray(file_kb.images)) {
                for (var i=0; i<file_kb.images.length; i++) {
                    var id = file_kb.images[i].id;
                    var image = new Image(id, file_kb.images[i]);
                    this._statements[id] = statement;
                }
            } else {
                for (var id in file_kb.images) {
                    var image = new Image(id, file_kb.images[id]);
                    this._images[id] = image;
                }
            }
        }
*/
        if (AKT.images) {
            this._images = {};
            var images = AKT.images;
            if (Array.isArray(images)) {
                for (var i=0; i<images.length; i++) {
                    var id = images[i].id;
                    var image = new Image(id, images[i]);
                    this._images[id] = image;
                }
            } else {
                for (var id in images) {
                    var image = new Image(id, images[id]);
                    this._images[id] = image;
                }
            }
        }


        this._diagramsOld = file_kb.diagrams;

        if (Array.isArray(file_kb.diagrams)) {
            for (var i=0; i<file_kb.diagrams.length; i++) {
                var id = file_kb.diagrams[i].name;
                var diagram = new Diagram(id,'systo',file_kb.diagrams[i]);
                this._diagrams[id] = diagram;
            }
        } else {
            for (var id in file_kb.diagrams) {
                //var diagram = new Diagram(id,'systo',file_kb.diagrams[id]);
                //diagram.convertSystoToJoint();
                //this._diagrams[id] = diagram;
            }
        }

        this._systo = this.convertCausalToSysto();
    }


    // This code was originally in Diagram.  However, in response to the need to
    // be able to change a diagram dynamically, e.g. by clicking on a node, I'm 
    // shifting the code here so that the graph for the whole KB is worked out
    // once (or whenever the KB is changed), rather than for each diagram.

    // The code is rather convoluted.  To help understand it, it might be helpful to
    // know what the endpoint is.  Basically, a representation of a graph of causal relationships
    // for the whole model, using Systo format, extended to allow for efficient two-way lookup for:
    // - finding the start_node and end_node OBJECTS, with arc_id as the key, for each arc; and
    // - finding the set of inarc and outarc OBJECTS for each node, with node_id as the key, 
    //   represented as a map (object-literal) rather than as an array.
    convertCausalToSysto = function () {
        
        var nodes = {};
        var arcs = {};
        //var statements = kb.findStatements({att_value:false,comparison:false,topic:true,topic_value:searchExpression});
        // Note that we now remove the topic filter - filtering will be done on the whole graph.
        var statements = this.findStatements({att_value:false,comparison:false});

        // We loop over all the (causal) statements, and create arc objects.
        for (var id in statements) {
            // Put this as a method in Statement class.
            var json = statements[id].json;
            var nodeIds = processStatement(json);
            if (nodeIds && 
                typeof nodeIds.start_node_id === 'string' && 
                typeof nodeIds.end_node_id === 'string') {            
                    statements[id]._node_names = {
                        start_name:nodeIds.start_node_id, 
                        end_name:nodeIds.end_node_id
                    };
                arcs[id] = nodeIds;
                arcs[id].name = nodeIds.start_node_id+'__'+nodeIds.end_node_id;
            }
        }

        // We now loop over all the arc objects, and create node objects, including arrays
        // of the inarcs and outarcs for each node.
        for (var arcId in arcs) {   // arcId is the same as the causal statement id.
            var arc = arcs[arcId];
            if (!nodes[arc.start_node_id]) {
                nodes[arc.start_node_id] = {
                    type:    'object', 
                    label:   arc.start_node_id.replace(/_/g,'\n'),
                    centrex: Math.round(800*Math.random()), 
                    centrey: Math.round(400*Math.random()),
                    inarcs:  {},
                    outarcs: {}
                };
            }
            arc.start_node = nodes[arc.start_node_id];
            nodes[arc.start_node_id].outarcs[arcId] = arc;

            if (!nodes[arc.end_node_id]) {
                nodes[arc.end_node_id] = {
                    type:    'object', 
                    label:   arc.end_node_id.replace(/_/g,'\n'),
                    centrex: Math.round(800*Math.random()), 
                    centrey: Math.round(400*Math.random()),
                    inarcs:  {},
                    outarcs: {}
                };
            }
            arc.end_node = nodes[arc.end_node_id];
            nodes[arc.end_node_id].inarcs[arcId] = arc;
        }

        for (var arcId in arcs) {   // arcId is the same as the causal statement id.
            var arc = arcs[arcId];
            arc.start_node = nodes[arc.start_node_id];
            arc.end_node = nodes[arc.end_node_id];
        }
        //this._systo = systo;
        //this._joint = this.convertSystoToJoint();
        return {nodes:nodes, arcs:arcs};;
                

        function processStatement(json) {
            if (json[0] !== 'if') {
                var result = processMain(json);
            } else {
                result = processMain(json[1]);
            }
            return result;
        }

        function processMain(json) {
            if (json[0] === 'causes1way') {
                var startNodeId = processCausalPart(json[1]);
                var endNodeId = processCausalPart(json[2]);
                return {start_node_id:startNodeId,end_node_id:endNodeId};
            } else if (json[0] === 'causes2way') {  // Separate, since might handle bi-directional aspect sometime...
                var startNodeId = processCausalPart(json[1]);
                var endNodeId = processCausalPart(json[2]);
                return {start_node_id:startNodeId,end_node_id:endNodeId};
            } else {
                return null;
            }
        }

        function processCausalPart(json) {
            if (typeof json === 'string') {
                return json;
            } else if (json[0] === 'att_value') {
                var arg1 = processArg1(json[1]);
                var attribute = json[2];
                return arg1+'_'+attribute;
            } else if (json[0] === 'process') {
                var arg1 = processArg1(json[1]);
                if (json[2]) {
                    var attribute = json[2];
                    return arg1+'_'+attribute;
                } else {
                    return arg1;
                }
            } else if (json[0] === 'action') {
                var arg1 = processArg1(json[1]);
                var attribute = json[2];
                return arg1+'_'+attribute;
            }
        }

        // Obviously, unnecessary duplication, since different predicates are handled
        // using the same code, allowing for 1 to 3 arguments.  Left as it is in case
        // someone decides to handle each of the 4 cases differently.

        function processArg1(json) {
            if (typeof json === 'string') {
                return json;   // It's a simple object
            } else if (json[0] === 'part') {
                return json[1]+'_'+json[2];
            } else if (json[0] === 'process') {
                if (json.length === 2) {
                    return processArg1(json[1]);
                } else if (json.length === 3) {
                    return processArg1(json[1])+'_'+json[2];
                } else if (json.length === 4) {
                    return processArg1(json[1])+'_'+json[2]+'_'+json[3];
                }
            } else if (json[0] === 'action') {
                if (json.length === 2) {
                    return json[1];
                } else if (json.length === 3) {
                    return json[1]+'_'+json[2];
                } else if (json.length === 4) {
                    return json[1]+'_'+json[2]+'_'+json[3];
                }
            }
        }
    }


    crosscheckFormalTerms = function () {
        console.log('starting...');
        var formalTermsFromKb = this._formalTerms;
        var formalTermsFromStatements = this.extractFormalTermsFromStatements();
        console.log(formalTermsFromKb);
        console.log(formalTermsFromStatements);
        var composite = {};

        for (var id1 in formalTermsFromKb) {
            composite[id1] = {kb:formalTermsFromKb[id1]._type};
        }

        for (var id2 in formalTermsFromStatements) {
            if (composite[id2]) {
                composite[id2].statements = formalTermsFromStatements[id2];
            } else {
                composite[id2] = {statements:formalTermsFromStatements[id2]};
            }
        }

        for (var id in composite) {
            if (composite[id].kb && composite[id].statements) {
            } else if (composite[id].kb) {
                //console.log('kb: ',id,composite[id].kb);
            } else if (composite[id].statements) {
                //console.log('statements: ',id,composite[id].statements);
            }
        }

        for (var id in composite) {
            if (composite[id].kb && composite[id].statements) {
                //console.log(this._formalTerms[id]._type,formalTermsFromStatements[id][0]);
                this._formalTerms[id]._type = formalTermsFromStatements[id][0];
            }
        }
    }


    extractFormalTermsFromStatements = function () {
        var statements = this._statements;
        var allTerms = {};
        var countStarted = {};
        var countObject = {};
        var countPart = {};
        for (var statementId in statements) {
            var statement = statements[statementId];
            var terms = statement.classifyFormalTerms();
            //console.log(statementId,terms);
            for (var termId in terms) {
                if (termId === 'acheampong') {
                    console.log('+++ ',terms[termId][0],statementId,JSON.stringify(statement.json));
                }

                if (!countStarted[termId]) {
                    countObject[termId] = 0;
                    countPart[termId] = 0;
                }
                var term = terms[termId];
                //console.log('* ',termId,term);
                if (term[0] === 'object') {
                    countStarted[termId] = true;
                    countObject[termId] += 1;
                }
                if (term[0] === 'part') {
                    countStarted[termId] = true;
                    countPart[termId] += 1;
                }
                allTerms[termId] = terms[termId];
            }
        }
        for (var termId in countObject) {
            if (countObject[termId]>0 || countPart[termId]>0) {
                if (countObject[termId]>0 && countPart[termId]>0) {
                    console.log('*** ',termId,countObject[termId],countPart[termId]);
                } else {
                    //console.log('    ',termId,countObject[termId],countPart[termId]);
                }
            }
        }
        return allTerms;
    }
}

