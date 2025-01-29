AKT.widgets.formal_terms = {};


AKT.widgets.formal_terms.settings = {width:'400px',height:'260px'};


AKT.widgets.formal_terms.setup = function (widget) {

    var kbId = widget.options.kbId;
    var kb = AKT.KBs[kbId];

    var widgetSettings = $('<div></div>');
    $(widget.element).find('.content').prepend(widgetSettings);

    var selectElement = AKT.makeReprocessSelector(widget.element, widget.widgetName,
        'Knowledge base', AKT.getKbIds(), AKT.state.current_kb, 'kbId','kb');
    $(widgetSettings).append(selectElement);

    var selectElement = AKT.makeReprocessSelector(
        widget.element, 
        widget.widgetName,
        'Formal term type', 
        ['all','action','attribute','comparison','link','object','process','value'], 
        'all',                 // Default value.
        'term_type',           // Name of the widget option that is assigned the listbox (<select>) option.
        'formal_term_type');   // Class name for the listbox (<select>) element.
    $(widgetSettings).append(selectElement);

    //var selectElement = AKT.makeReprocessSelector(widget.element, widget.widgetName,
    //    'Use in formal definitions', ['all','Formal Statements','Formal Conditions','Object Hierarchies'], 'all','use');
    //$(widgetSettings).append(selectElement);

    var options = widget.options;    
    if (options.term_type) {
        var term_type_filter = options.term_type;
    } else {
        term_type_filter = 'all';
    }
    formalTerms = kb.findFormalTerms({term_type:term_type_filter});


    // -----------------------------------------------------------------------
    // User interaction event handlers

    $(widget.element).find('.button_view').on('click', function (event) {    // The Details button
        console.debug('BUTTON: Clicked on formal_term View button');
        event.stopPropagation();

        var formalTermId = $(widget.element).find('.tr_listbox[data-selected="yes"]').data('key');
        if (formalTermId) {
            var formalTerm = kb._formalTerms[formalTermId];

            AKT.recordEvent({
                file:'formal_terms.js',
                function:'AKT.widgets.formal_terms.setup()',
                element:widget.element,
                finds:['.button_view'],
                event:'click',
                value: formalTermId,
                message:'Clicked on .button_view in formal_terms.js.'});

            var panel = AKT.panelise({
                widget_name:'formal_term_details',
                position:{left:'650px',top:'20px'},
                size:{width:'580px',height:'450px'},
                shift_key: event.shiftKey,
                options:{kbId:kbId, mode:'view', formal_term:formalTerm, item_id:formalTerm._id}
            });
        } else {
            alert('Please first select a formal term from the listbox.');
        }
    });


    $(widget.element).find('.button_edit').on('click', function (event) {    // The Details button
        console.debug('BUTTON: Clicked on formal_term Edit button');
        event.stopPropagation();

        var formalTermId = $(widget.element).find('.tr_listbox[data-selected="yes"]').data('key');
        if (formalTermId) {
            var formalTerm = kb._formalTerms[formalTermId];

            AKT.recordEvent({
                file:'formal_terms.js',
                function:'AKT.widgets.formal_terms.setup()',
                element:widget.element,
                finds:['.button_edit'],
                event:'click',
                value: formalTermId,
                message:'Clicked on .button_edit in formal_terms.js.'});

            var panel = AKT.panelise({
                widget_name:'formal_term_details',
                position:{left:'650px',top:'20px'},
                size:{width:'580px',height:'450px'},
                shift_key: event.shiftKey,
                options:{kbId:kbId, mode:'edit', formal_term:formalTerm}
            });
        } else {
            alert('Please first select a formal term from the listbox.');
        }
    });


    $(widget.element).find('.button_new').on('click', function (event) {    // The New button
        console.debug('BUTTON: Clicked on formal_term New button');
        event.stopPropagation();
        var kbId = widget.options.kbId;
        alert('I am sorry, but I cannot currently let you create a new formal term here.\nNew formal terms can only be created by being identified in a statement.\nThis is to stop creating orphan formal terms, i.e. terms which are not actually used in statements.');
    });


    $(widget.element).find('.button_delete').on('click', function (event) {    // The Delete button
        console.debug('BUTTON: Clicked on formal_term Delete button');
        event.stopPropagation();
        var kbId = widget.options.kbId;
        alert('I am sorry, but I cannot currently let you delete a formal term.\nThis would invalidate all the statements that contain that term.\n');
    });


    $(widget.element).find('.button_statements').on('click', function (event) {    // The Statements button
        console.debug('BUTTON: Clicked on formal_term Statements button');
        event.stopPropagation();
        var kbId = widget.options.kbId;
        var termType = widget.options.term_type;
        var formalTermId = $(widget.element).find('.select_formalterms').val();

        var eventShiftKey = event ? event.shiftKey : null;

        var panel = AKT.panelise({
            widget_name:'statements',
            position:{left:'400px',top:'20px'},
            size:{width:'600px',height:'500px'},
            shift_key: event.shiftKey,
            options:{kbId:kbId, simple_filter_word:formalTermId}
        });

        AKT.recordEvent({
            file:'formal_terms.js',
            function:'AKT.widgets.formal_terms.setup()',
            element:widget.element,
            finds:['.button_statements'],
            event:'click',
            value: formalTermId,
            message:'Clicked on the Statements button in the formal_terms panel.'
        });
    });


    $(widget.element).find('.legend_formal_term_type').on('click', function (event) {    // Ghost click target for tutorial
        console.log('BUTTON: Clicked on legend_formal_term_type');
        //$(widget.element).find('.select_formalterms option[value="esre"]').attr('selected',true);
/*
        event.stopPropagation();
        var kbId = widget.options.kbId;
        var termType = widget.options.term_type;
        var termName = $(widget.element).find('.select_formalterms').val();

*/
    });

};


AKT.widgets.formal_terms.display = function (widget) {
    console.debug(widget.options);

    var widgetContent = $(widget.element).find('.content');

    var kbId = widget.options.kbId;
    var kb = AKT.KBs[kbId];

    var options = widget.options;    
    if (options.statement) {   //Gets formal terms for one single statement
        var statement = options.statement; 
        var formalTerms = statement.findFormalTerms();  

    } else {  // Gets formal terms for the *whole knowledge base*, filtered
        if (options.term_type) {
            var term_type_filter = options.term_type;
        } else {
            term_type_filter = 'all';
        }
        //if (options.use) {
        //    var use_filter = options.use;
        //} else {
        //    var use_filter = 'all';
        //}
        formalTerms = kb.findFormalTerms({term_type:term_type_filter});
    }

    var extendedFormalTermStrings = [];
    for (var id in formalTerms) {
        if (formalTerms[id]._synonyms.length === 0) {
            extendedFormalTermStrings.push(id);
        } else {
            synonymsString = JSON.stringify(formalTerms[id]._synonyms);
            extendedFormalTermStrings.push(id+': '+synonymsString+'');
        }
    }        
    var nFormalTerms = Object.keys(formalTerms).length;

    //AKT.loadSelectOptions(widgetContent, 'select_formalterms', formalTerms, ['id','id']);

    AKT.myListbox({
        widget_element:    widget.element,
        div_element_class: 'mylistbox_formalterms',
        item_type:         'object',        // It's actually a formal term of type 'object'!   
                                            // Need to work out how to handle this issue.
        items:             formalTerms,
        property_names:    ['_id', '_type'],
        include_key:       false
    });

    $(widgetContent).find('.div_nsources').text(nFormalTerms);

   //$(widgetElement).draggable({containment:'#workspace',handle:".titlebar"});
    //$(widgetElement).css({display:'block'});

};


AKT.widgets.formal_terms.html = `
<div class="content" style="border:none; padding-left:15px;padding-right:15px;">


    <fieldset style="float:left;">
        <legend for="formalterms400">Formal Terms in selected definition : </legend>
        <div class="mylistbox_formalterms" style="width:250px; height:250px; overflow:auto; background:white"></select>
    </fieldset>

    <div style="float:left;margin-left:20px;margin-top:20px;">
        <button class="button_view" style="width:65px;height:30px;">View</button><br/>
        <button class="button_edit" style="width:65px;height:30px;">Edit</button><br/>
        <button class="button_new" style="width:65px;height:30px;">New</button><br/>
        <button class="button_delete" style="width:65px;height:30px;">Delete</button>
    </div>

    <div style="clear:both;"></div>

    <div style="display:none;margin-top:12px;">
        <div class="label" style="float:left;">Number of terms:</div>
        <div class="number" style="float:left;margin-left:10px;"></div>
    </div>
</div>     <!-- End of content div -->
`;



