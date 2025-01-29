// TODO TODO Shift event hadlers into the setup() section.



AKT.widgets.topic_details = {};


AKT.widgets.topic_details.setup = function (widget) {
    var kbId = widget.options.kbId;
    var kb = AKT.KBs[kbId];

    console.log('--- +++ topic',widget.options);

    // TODO: fix this inconsistency; and add in type checking, error message etc
    if (widget.options.topic) { // The formal term object
        var topic = widget.options.topic; 
    } else if (widget.options.topic_id) {   // The formal term id
        var topic = kb._topics[widget.options.topic_id]; 
    }
/*
    $(widget.element).find('.button_in_hierarchy').on('click', function() {
        console.log('Clicked on topic In hierarchy button');
        var kbId = widget.options.kbId;
        var kb = AKT.kbs[kbId];
        console.log(topic);
        var eventShiftKey = event ? event.shiftKey : null;
        var panel = new Panel('dialog_Generic',
            eventShiftKey, 
            {left:'20px',top:'20px',width:'450px',height:'540px'}, 
            {widget_name:'hierarchy_tree', kbId:AKT.state.current_kb, tree_type:'topic',item_id:topic._id});
    });
*/

    $(widget.element).find('.button_in_hierarchy').on('click', function() {
        event.stopPropagation();
        console.debug('Clicked on topic_details In hierarchy button');
        var kbId = widget.options.kbId;
        var kb = AKT.KBs[kbId];




        var nodeId = widget.options.item_id;
        var hierarchies = kb._topicHierarchies;
        console.log('+++',hierarchies);

        var hierarchyId = null;
        $.each(hierarchies, function(id,hierarchy) {
            var hier = hierarchies[id];
            var nodes = hier.getAllDescendants(hier._root);
            if (nodes.includes(nodeId)) {
                console.log('yes!',nodeId,'is in',hier._id);
                hierarchyId = hier._id;
            } else {
                console.log('no!',nodeId,'is not in',hier._id);
            }
        });

        hierarchy = hierarchies[hierarchyId];
        console.log('hierarchy:',hierarchy);





        var panel = AKT.panelise({
            widget_name:'hierarchy_details',
            position:{left:'20px',top:'20px'},
            size:{width:'450px',height:'540px'},
            shift_key: event.shiftKey,
            options:{kbId:kbId, tree_type:'topic', hierarchy:hierarchy, type:'xxxx', item_id:topic._id}
        });



        AKT.recordEvent({
            file:'topic_details.js',
            function:'AKT.widgets.topic_details.setup()',
            element:widget.element,
            finds:['.button_in_hierarchy'],
            event:'click',
            value: topic._id,
            message:'Clicked on the In Hierarchy button in the topic_details panel.'
        });
    });
};


AKT.widgets.topic_details.display = function (widget) {
    console.log('AKT.widgets.topic_details.display: ',widget.options);
    var kbId = widget.options.kbId;
    var kb = AKT.KBs[kbId];

    // TODO: fix this inconsistency; and add in type checking, error message etc
    if (widget.options.topic) { // The topic object
        var topic = widget.options.topic; 
    } else if (widget.options.topic_id) {   // The topic id
        var topic = kb._topics[widget.options.topic_id]; 
    }

    $(widget.element).find('.textarea_topic').val(topic._id);
    $(widget.element).find('.textarea_searchterm').val(topic._search_term);
    $(widget.element).find('.textarea_description').val(topic._description);

    // TODO: Need to rename the _objects property!  It's really confusing...
    var objectCategories = topic._objects.split('+');  // object, objects+subobjects, object+superobjects
    $(widget.element).find('.checkbox_object').prop('checked', false);
    $(widget.element).find('.checkbox_subobjects').prop('checked', false);
    $(widget.element).find('.checkbox_superobjects').prop('checked', false);
    for (var i=0; i<objectCategories.length; i++) {
        if (objectCategories[i] === 'object') {
            $(widget.element).find('.checkbox_object').prop('checked', true);
        } else if (objectCategories[i] === 'subobjects') {
            $(widget.element).find('.checkbox_subobjects').prop('checked', true);
        } else if (objectCategories[i] === 'superobjects') {
            $(widget.element).find('.checkbox_superobjects').prop('checked', true);
        }
    }

    function getTopic(topicName) {
        for (var i=0; i<kb.topics.length; i++) {
            if (kb.topics[i].name === topicName) {
                return kb.topics[i];
            }
        }
        return null;
    };

    $(widget.element).find('.button_statements').on('click', function() {
        event.stopPropagation();
        console.debug('Clicked on topic_details Statements button');
        var kbId = widget.options.kbId;
        var kb = AKT.kbs[kbId];

        console.log(topic);
        var eventShiftKey = event ? event.shiftKey : null;
        var panel = new Panel('dialog_Generic', 
            eventShiftKey, 
            {left:'650px',top:'20px',width:'580px',height:'550px'},
            {widget_name:'statements', kbId:kbId, filters:{topic:true,topic_value:topic._id}});
    });

    $(widget.element).find('.button_diagram').on('click', function() {
        event.stopPropagation();
        console.debug('Clicked on topic_details diagram button');
        var kbId = widget.options.kbId;
        var kb = AKT.kbs[kbId];
        
        console.log('kb',kb);
        console.log('topic',topic);
        //var kbId = AKT.state.current_kb;
        //var kb = AKT.KBs[kbId];
        //var title = $('#load_diagram_local_storage_title').val();

        var diagram = new Diagram('diagram_from_topic','systo');
        AKT.state.current_diagram = diagram;  // The object, not the ID

        // Confusingly, Chromolaena is the topic name for acheampong.
        diagram.convertCausalToSysto(topic._id);

        //diagram.graphLayoutCola();  // Work on using cola stopped when I found that
        // springy did a good job with orphan subgraphs and links.
        console.log(AKT.state);
        diagram.graphLayoutSpringy(widget);
    });


};


AKT.widgets.topic_details.html = `
<div class="content" style="margin:15px;border:none;">

    <div>
        <div style="float:left;width:40px;height:20px;">Topic</div>
        <textarea class="textarea_topic" style="float:left;width:220px;height:20px;"></textarea>
    </div>


    <fieldset>
        <legend>Boolean Search String</legend>
        <textarea class="textarea_searchterm" style="width:250px;height:50px;"></textarea>
    </fieldset>

    <div>
        <fieldset style="float:left;">
            <legend>Search Mode</legend>
            <input class="checkbox checkbox_object" type="checkbox">
            <label for="topicDetail200">object</label><br/>

            <input class="checkbox checkbox_subobjects" type="checkbox" disabled>
            <label for="topicDetail201">subobjects</label><br/>

            <input class="checkbox checkbox_superobjects" type="checkbox" disabled>
            <label for="topicDetail202">superobjects</label><br/>
        </fieldset>

        <button id="topicDetail100" disabled style="float:left;width:60px;height:35px;margin-left:30px;margin-top:30px;">Save</button>

        <div style="clear:both;"></div>
    </div>

    <fieldset>
        <legend>Description</legend>
        <textarea class="textarea_description" style="width:250px;height:130px;"></textarea>
    </fieldset>

    <button class="button_statements" style="width:140px;height:35px;" title="Show all statements for this topic.">Statements</button>
    <button class="button_in_hierarchy" style="width:140px;height:35px;" title="Show this topic in the topic hierarchies.">In hierarchy</button>
    <button class="button_diagram" style="display:none;width:140px;height:35px;" title="Generate and display the causal diagram for all causal statements for this topic.">Diagram</button>

</div>     <!-- End of content div -->
`;



