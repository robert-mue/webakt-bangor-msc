AKT.widgets.statements = {};


AKT.widgets.statements.setup = function (widget) {
    var self = this;
    var widgetSettings = $('<div></div>');
    $(widget.element).find('.content').prepend(widgetSettings);
    var kbId = widget.options.kbId;
    var kb = AKT.KBs[kbId];

    var kbSelectElement = AKT.makeReprocessSelector(widget.element, widget.widgetName,
        'Knowledge base', AKT.getKbIds(), AKT.state.current_kb, 'kbId');
    $(widgetSettings).append(kbSelectElement);

    if (!widget.options.filters) {
        widget.options.filters = {};
    }
    var filters = widget.options.filters;
   
    if (widget.options.term_type) {
        var term_type_filter = widget.options.term_type;
    } else {
        term_type_filter = 'all';
    }
    if (widget.options.use) {
        var use_filter = widget.options.use;
    } else {
        var use_filter = 'all';
    }
    if (widget.options.topic) {
        var topic_filter = widget.options.topic;
    } else {
        var topic_filter = 'all';
    }

    var formalTerms = kb.findFormalTerms({term_type:term_type_filter,use:use_filter});
    AKT.loadSelectOptions(widget.element, 'listbox_formal_terms', formalTerms, ['id','id']);

    var sources = kb.findSources({});
    AKT.loadSelectOptions(widget.element, 'listbox_sources', sources, ['id','id']);

    var topics = kb.findTopics({});
    AKT.loadSelectOptions(widget.element, 'listbox_topics', topics, ['id','id']);

    var nodeNames = kb.findNodeNames();   
    AKT.loadSelectOptions(widget.element, 'listbox_node_names', nodeNames, ['id','id']);


    // ============================================================================
    // EVENT HANDLERS
    // The following events are handled:
    // 1. Change in any checkbox (with options for the formal_term and source checkboxes).
    // 2. Change in the 'formal term types' listbox.
    // 3. Change in the 'formal terms' listbox.
    // 4. Change in the 'sources' listbox.
    // 5. Change in the statements listbox.
    // 6. Click on the 'New' button.
    // 7. Click on the 'View' button.


    // 1. Change in any checkbox (with options for the formal_term and source checkboxes).
    // We can handle checkboxes generically, since we just pick up the value associated 
    // with it (e.g. 'att_value' and its checked/unchecked state, and use this to filter
    // statements and refresh the list of selected statements.


    // Avoiding over-generalising checkboxes - handling each one separately
    $(widget.element).find('.checkbox_formal_term').on('change', function () {
        event.stopPropagation();

        var filterTypeValue = $(widget.element).find('.listbox_formal_terms').val();
        
        widget.options.filters.formal_term = $(this)[0].checked;
        widget.options.filters.formal_term_value = filterTypeValue;

        $(widget.element).dialog_Generic('option', 'filters', widget.options.filters);
        $(widget.element).blur();
    });


    $(widget.element).find('.checkbox_source').on('change', function (event,value) {
        event.stopPropagation();

        var filterTypeValue = $(widget.element).find('.listbox_sources').val();
        
        widget.options.filters.source = $(this)[0].checked;
        widget.options.filters.source_value = filterTypeValue;

        $(widget.element).dialog_Generic('option', 'filters', widget.options.filters);
        $(widget.element).blur();
    });


    $(widget.element).find('.checkbox_topic').on('change', function (event,value) {
        event.stopPropagation();
        
        var filterTypeValue = $(widget.element).find('.listbox_topics').val();

        widget.options.filters.topic = $(this)[0].checked;
        widget.options.filters.topic_value = filterTypeValue;

        $(widget.element).dialog_Generic('option', 'filters', widget.options.filters);
        $(widget.element).blur();
    });


    $(widget.element).find('.checkbox_node_name').on('change', function (event,value) {
        event.stopPropagation();

        var filterTypeValue = $(widget.element).find('.listbox_node_names').val();

        widget.options.filters.node_name = $(this)[0].checked;
        widget.options.filters.node_name_value = filterTypeValue;

        $(widget.element).dialog_Generic('option', 'filters', widget.options.filters);
        $(widget.element).blur();
    });



    $(widget.element).find('.checkbox').on('change', function (event) {
        event.stopPropagation();
        
        var elementClass = event.target.classList[0];
        var selectedOption = $(widget.element).find('.'+elementClass).val();
        widget.options.filters[selectedOption] = $(this)[0].checked;
        //widget.options.filters[filterType] = checked;

        $(widget.element).dialog_Generic('option', 'filters', widget.options.filters);
        $(widget.element).blur();
    });        


    // 2. Change in the 'formal term types' listbox.
    // User selects a formal term *type* from the listbox, and this loads up the
    // formal terms listbox with terms just of that type.
    $(widget.element).find('.listbox_formal_term_types').on('change', function () {
        event.stopPropagation();
        var kbId = widget.options.kbId;
        var kb = AKT.KBs[kbId];
        var formalTerms = kb.findFormalTerms({term_type:$(this).val(),use:use_filter});
        AKT.loadSelectOptions(widget.element, 'listbox_formal_terms', formalTerms, ['id','id']);
    });


    // 3. Change in the 'formal terms' listbox.
    // User selects a formal term from the listbox, and this causes the list of statements to be
    // re-filtered for this term, *provided that* the formal term checkbox is checked.
    $(widget.element).find('.listbox_formal_terms').on('change', function () {
        event.stopPropagation();
        if ($(widget.element).find('.checkbox_formal_term')[0].checked) {
            var filterTypeValue = $(widget.element).find('.listbox_formal_terms').val();
            widget.options.filters.formal_term_value = filterTypeValue;

            $(widget.element).dialog_Generic('option', 'filters', widget.options.filters);
            $(widget.element).blur();
        }
    });


    // 4. Change in the 'sources' listbox.
    // User selects a source from the listbox, and this causes the list of statements to be
    // re-filtered for this term, *provided that* the source checkbox is checked.
    $(widget.element).find('.listbox_sources').on('change', function () {
        event.stopPropagation();
        if ($(widget.element).find('.checkbox_source')[0].checked) {
            var filterTypeValue = $(widget.element).find('.listbox_sources').val();
            widget.options.filters.source_value = filterTypeValue;

            $(widget.element).dialog_Generic('option', 'filters', widget.options.filters);
            $(widget.element).blur();
        }
    });


    // 5. Change in the 'topic' listbox.
    // User selects a topic from the listbox, and this causes the list of statements to be
    // re-filtered for this term, *provided that* the topic checkbox is checked.
    $(widget.element).find('.listbox_topics').on('change', function () {
        event.stopPropagation();
        if ($(widget.element).find('.checkbox_topic')[0].checked) {
            var filterTypeValue = $(widget.element).find('.listbox_topics').val();
            widget.options.filters.topic_value = filterTypeValue;

            $(widget.element).dialog_Generic('option', 'filters', widget.options.filters);
            $(widget.element).blur();
        }
    });


    // 6. Change in the statements listbox.
    $(widget.element).find('.listbox_statements').on('change', function (event, value) {
        console.log('#### 163 ',kb.statements);
        event.stopPropagation();
        // Needed this, since this.value is blank when triggered (in AKT.singleStep).
        //if (this.value === '') {
        //    var optionValue = value;
        //} else {
        //    optionValue = this.value;
        //}
        console.log($(this).val(),value);
        var statementId = $(this).val();
        var statement = kb._statements[statementId];
        AKT.state.current_statement = statement;   // Note: the Statement object, not its ID!
        $(widget.element).find('.div_english').html('<span>'+statementId+': '+statement.english+'</span>');

        //var i = parseInt(optionValue.split(':')[0],10);
        //var sentenceIndex = i;
        //AKT.state.sentence_index = sentenceIndex;
        $(widget.element).find('.textarea_formal_language').text(statementId+': '+statement.formal);
        
    });


    // ========================================================================== BUTTON: New
    // 6. Click on the 'New' button.
/*
    $(widget.element).find('.button_newXXX').on('click', function (event) {   
        console.debug('BUTTON: Clicked on statements New button');
        event.stopPropagation();

        var id = $(widget.element).find('.listbox_statements').val();
        var statement = statements[id];

        var kbId = AKT.state.current_kb;
        var kb = AKT.kbs[kbId];

        var panel = new Panel('dialog_Generic', 
            event.shiftKey, 
            {left:'650px',top:'20px',width:'600px',height:'400px'},
            {widget_name:'statement', kbId:kbId});
    });


    $('buttonxxx').on('clickxxx', function (event) {
        console.log(this);
        console.log($(this));
        console.log('---** event :', event.type, '::', event.target.localName, ':::', event.target.classList[0],'::::',event.target.parentElement.parentElement.parentElement.id,$(widget.element).attr('id'), '\n',event);
    });
*/


    // 7a, 7b and 7c are basically the same - they all open up the statement_details widget.
    // The option 'mode' is used to tell the widget which of the 3 modes it is in.
    // 7a Details button, mode='details': Shows the details for the selected statement, but does not allow editing.
    // 7b Edit button, mode='edit:        Shows the details for the selected statement, but *does* allow editing.
    // 7c New button, mode='new':         Shows an empty statement_details widget panel.

    // ====================================================================================== BUTTON: Details
    // 7a. Click on the 'View' button.
    $(widget.element).find('.button_view').on('click', function (event) {   // Statement View button
        console.log('BUTTON: Clicked on the statements View button');
        event.stopPropagation();

        //var statementId = $(widget.element).find('.listbox_statements').val();
        console.log('>><< widget.options: ',widget.options);

/* Old method - use widget.options.statementId
        if (widget.options.statementId) {
            var statementId = widget.options.statementId;
            var statement = kb.statements[statementId];
        }
*/
        // Alternative method: uses the fact that AKT.myListbox sets an
        // HTML data-key attribute for every <tr> element in the listbox.
        var statementId = $(widget.element).find('.tr_listbox[data-selected="yes"]').data('key');
        console.log('button View:',statementId);

        if (statementId) {
            var statement = kb._statements[statementId];

            var panel = AKT.panelise({
                widget_name:'statement_details',
                position:{left:'650px',top:'20px'},
                size:{width:'580px',height:'450px'},
                shift_key: event.shiftKey,
                options:{kbId:kbId, mode:'view', item_id:statementId, statement:statement}
            });

            $('#'+panel._id).dialog_Generic('option', 'statement', statement);
        } else {
            alert('Please first select a statement from the listbox.');
        }


    });


    // ======================================================================= BUTTON: Edit
    // 7b. Click on the 'Edit' button.
    $(widget.element).find('.button_edit').on('click', function (event) {   
        console.log('BUTTON: Clicked on statements Edit button');
        event.stopPropagation();

        //var statementId = $(widget.element).find('.listbox_statements').val();
        var statementId = $(widget.element).find('.tr_listbox[data-selected="yes"]').data('key');

        if (statementId) {
            var statement = kb.statements[statementId];

            var panel = AKT.panelise({
                widget_name:'statement_details',
                position:{left:'650px',top:'20px'},
                size:{width:'580px',height:'450px'},
                shift_key: event.shiftKey,
                options:{kbId:kbId, mode:'edit', item_id:statementId, statement:statement}
            });
        } else {
            alert('Please first select a statement from the listbox.');
        }
    });


    // 7c. Click on the 'New' button.
    $(widget.element).find('.button_new').on('click', function (event) {   // Statement new button
        console.log('BUTTON: Clicked on the statements New button');
        event.stopPropagation();

        var panel = AKT.panelise({
            widget_name:'statement_details',
            position:{left:'650px',top:'20px'},
            size:{width:'580px',height:'450px'},
            shift_key: event.shiftKey,
            options:{kbId:kbId, mode:'new'}
        });
    });


    // -----------------------------------------------------------------------------
    // Custom event handlers
    $(document).on('new_statement_created_event', function(event,args) {
        self.display(widget);
    });

    $(document).on('statement_changed_event', function(event,args) {
        self.display(widget);
    });

};


// ===================================================================================
AKT.widgets.statements.display = function (widget) {
    //console.log('\n** STARTING statements.display **',widget.options);
    var kbId = widget.options.kbId;
    var kb = AKT.KBs[kbId];
    //'-
    console.log('filters:',widget.options.filters);

    if (widget.options.filters) {
        var filters = widget.options.filters;

        if (filters.formal_term) {
            var formalTermId = filters.formal_term_value;
            var formalTermTypeId = kb._formalTerms[formalTermId].type;
            $(widget.element).find('.checkbox_formal_term').prop('checked',true);
            $(widget.element).find('.listbox_formal_terms option[value="'+formalTermId+'"]').prop('selected',  true);
            $(widget.element).find('.listbox_formal_term_types option[value="'+formalTermTypeId+'"]').prop('selected',  true);
        }

        if (filters.source) {
            var sourceId = filters.source_value;
            $(widget.element).find('.checkbox_source').prop('checked',true);
            $(widget.element).find('.listbox_sources option[value="'+sourceId+'"]').prop('selected',  true);
        }

        if (filters.topic) {
            var sourceId = filters.topic_value;
            $(widget.element).find('.checkbox_topic').prop('checked',true);
            $(widget.element).find('.listbox_topics option[value="'+sourceId+'"]').prop('selected',  true);
        }

        var statements = kb.findStatements(filters);  

    // See email to the AKT group dated 12th July 2022 on "extended boolean search"
    } else if (widget.options.extended_boolean_search) {
        statements = kb.findStatements(widget.options.extended_boolean_search);
    }

    var nStatements = Object.keys(statements).length;
    $(widget.element).find('.div_nstatements').text(nStatements);

    AKT.myListbox({
        widget_element:    widget.element,
        div_element_class: 'mylistbox_statements',
        items:             statements,
        property_names:    ['_id', '_english', '_formal'],
        include_key:       false
    });

    $('#viewallstatements1009').text(nStatements);

/*
    var h = $(widget.element).height()-145;
    $(widget.element).find('.mylistbox_statements').css('height',h+'px');
    $(widget.element).on( "resize", function( event, ui ) {
        var h = $(widget.element).height()-145;
        $(widget.element).find('.mylistbox_statements').css('height',h+'px');
    });
*/


/*
    // This has to go in display rather than setup, because we build the table after setup
    $(widget.element).find('.mylistbox_statements').find('.tr_listbox').on('click', function (event, value) {
        console.log(999);
        event.stopPropagation();
        // Needed this, since this.value is blank when triggered (in AKT.singleStep).
        //if (this.value === '') {
        //    var optionValue = value;
        //} else {
        //    optionValue = this.value;
        //}
        $(widget.element).find('.mylistbox_statements').find('.tr_listbox').css({background:'white'});
        $(widget.element).find('.mylistbox_statements').find('.tr_listbox:odd').css({background:'#d0d0d0'});
        $(this).css({background:'yellow'});
        var statementId = $(this).attr('data-key');
        widget.options.statementId = statementId;   // Hacky...
        var statement = kb.statements[statementId];
        AKT.state.current_statement = statement;   // Note: the Statement object, not its ID!
        $(widget.element).find('.div_english').html('<span>'+statementId+': '+statement.english+'</span>');

        //var i = parseInt(optionValue.split(':')[0],10);
        //var sentenceIndex = i;
        //AKT.state.sentence_index = sentenceIndex;
        $(widget.element).find('.textarea_formal_language').text(statementId+': '+statement.formal);
        
    });
*/
};

AKT.widgets.statements.html = `
<div class="content" style="border:none;padding:5px;">

    <div>
        <div style="float:left; margin-right:15px;">
            <div style="float:left;">
                <span>Include...</span><br/>
                <input type="checkbox" class="checkbox_att_value checkbox" checked value="att_value"/>
                <label>att_value</label><br/>
                <input type="checkbox" class="checkbox_causal checkbox" checked value="causal" />
                <label>causal</label><br/>
                <input type="checkbox" class="checkbox_comparison checkbox" checked value="comparison" />
                <label>comparison</label>
            </div>

            <div style="float:left;margin-left:15px;">
                <br/>
                <input type="checkbox" class="checkbox_non_conditional checkbox" checked value="non_conditional" />
                <label>non-conditional</label><br/>
                <input type="checkbox" class="checkbox_conditional checkbox" checked value="conditional" />
                <label>conditional</label>
            </div>
        </div>

        <div style="float:left;">
            <span>Restrict to...</span><br/>

            <input type="checkbox" class="checkbox_formal_term" value="formal_term" />
            <label style="display:inline-block;margin-left:17px;width:80px;">formal term</label>
            <select class="listbox_formal_terms" style="width:120px;"></select>
            <span> of type </span>
            <select  class="listbox_formal_term_types">
                <option value="all">all</option>
                <option value="object">object</option>
                <option value="attribute">attribute</option>
                <option value="value">value</option>
                <option value="process">process</option>
                <option value="action">action</option>
            </select><br/>

            <input type="checkbox" class="checkbox_source" value="source" />
            <label style="display:inline-block;margin-left:17px;width:80px;">source</label>
            <select class="listbox_sources" style="width:120px;"></select><br/>

            <input type="checkbox" class="checkbox_topic" value="topic" />
            <label style="display:inline-block;margin-left:17px;width:80px;">topic</label>
            <select class="listbox_topics" style="width:120px;"></select><br/>

            <!-- Nov 22 Odd: I have this listbox, but no code for handling it!  So commented out.
            <input type="checkbox" class="checkbox_node_names" value="node_name" />
            <label style="display:inline-block;margin-left:17px;width:80px;">node name</label>
            <select class="listbox_node_names" style="width:120px;"></select><br/>
            -->
        </div>
    </div>

    <div style="clear:both;"></div>

    <div class="w3-row">
        <div class="w3-col w3-right w3-container" style="width:75px;margin:15px;">
            <button class="button_view" style="width:65px;height:30px;">View</button><br/>
            <button class="button_edit" style="width:65px;height:30px;">Edit</button><br/>
            <button class="button_new" style="width:65px;height:30px;">New</button><br/>
            <button class="button_delete" style="width:65px;height:30px;">Delete</button>
        </div>

        <div class="w3-rest w3-container mylistbox mylistbox_statements" 
            style="overflow-y:auto; height:200px; border:solid 1px black; background:white;">
        </div>
    </div>


    <fieldset style="display:none; float:left;margin-top:10px;">
        <legend>Selected Statement</legend>

        <div style="float:left;">
            <label>Natural Language</label><br/>
            <div class="div_english" style="border:solid 1px black;background:white;width:420px;height:40px;"></div><br/>
        </div>

        <div style="clear:both;"></div>

        <div style="float:left;">
            <label>Formal Language</label><br/>
            <textarea class="textarea_formal_language" style="width:420px;height:40px;"></textarea>
        </div>
    </fieldset>

    <div style="clear:both;"></div>

    <div style="float:right;">
        <div style="float:left; width:130px;height:20px;">Number of statements</div>
        <div class="div_nstatements" style="float:left; width:75px;height:20px;">0</div>
    </div>

    <!--div>
        <button id="viewallstatements106" style="float:left;width:125px;height:30px;">Numerical</button>
        <button id="viewallstatements120" style="float:left;width:130px;height:30px;">All Statements</button>
    </div-->

    <div style="clear:both;"></div>

    <!-- In the Prolog source, but not in the current version of AKT5.
    <div id="viewallstatements1010" class="label" style="left:297px;top:202px;width:40px;height:25px;">with at least </div>
    <select id="viewallstatements805" style="left:335px;top:205px;width:40px;height:20px;160px;">[]</select>
    <div id="viewallstatements1011" class="label" style="left:378px;top:210px;width:60px;height:25px;">condition(s)</div>
    -->

    <!--fieldset style="float:left;margin-top:10px;">
        <legend>Diagram Selection Type</legend>
        <button id="viewallstatements110" style="width:95px;height:30px;">All Statements</button>
        <button id="viewallstatements113" style="width:60px;height:30px;">Causes</button>
        <button id="viewallstatements114" style="width:60px;height:30px;">Effects</button>
        <button id="viewallstatements111" style="width:65px;height:30px;">Navigate</button>
    </fieldset>

    <button id="viewallstatements112" style="float:right;margin-right:20px;margin-top:20px;width:110px;height:30px;">Print Statements</button-->

    <div style="clear:both;"></div>

</div>     <!-- End of content div -->
`;

