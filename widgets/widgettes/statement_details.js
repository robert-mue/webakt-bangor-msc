AKT.widgets.statement_details = {};


AKT.widgets.statement_details.setup = function (widget) {

    $(widget.element).find('.button_check_syntax').on('click', function() {
        console.log('Clicked on Check Syntax');
        event.stopPropagation();
        var kbId = widget.options.kbId;
        var kb = AKT.kbs[kbId];

     /*
        var statement = widget.options.statement;

        const regex = /<\/?\w[^>]*>/g;
        var formalMainHtml = $(divFormalMain).html();
        var formalMain = formalMainHtml.replace(regex, '');

        try {
            var result = statementParser.parse(formalMain);
            $(widget.element).find('.div_formal_main_flag').css({background:'#50ff50'});
            console.log(result);
            console.log(statement);
        }
        catch(error) {
            $(widget.element).find('.div_formal_main_flag').css({background:'red'});
            console.log('name:',error.name, '\nmessage:',error.message, '\nfound:',error.found, '\nlocation:',error.location.start.offset);
        }
    */
        return;


        // I am allowing for the fact that the formal text field might contain any
        // number of spans - not just at the start and end.    E.g. for highlighting
        // different grammatical elements (object, process etc).   And indeed other tags,
        // e.g. <wbr>.  So we can't
        // simply extract the statement from inside the outer span, but rather
        // have to strip out all the <span style="..."> and </span> strings.  That's what we
        // do in the neat regular expression below, which says: 
        // "find a '<', possibly follwed by a '/' (which has to be escaped with 
        // a '\'), followed by 'span', followed by one or more of any character except
        // a '>'; and repeat (g) until you've gone through the whole string".
        // I have now generalised the regex so that it removes any tags, since 
        // the HTML now also contains <wbr> tags(break-points for word wrapping).

        //const regex = /<\/?\w[^>]*>/g;
        var formalMainHtml = $(divFormalMain).html();
        var formalMain = formalMainHtml.replace(regex, '');

        var formalIfHtml = $(divFormalIf).html();
        var formalIf = formalIfHtml.replace(regex, '');

        if (formalIf === 'conditional part'|| formalIf === '') {
            formalIf = '';
            var formal = formalMain;
        } else {
            var formal = formalMain+' if '+formalIf;
        }

        $(this).css({background:'#a0ffa0'});
        var resultMain = checkSyntax(formalMain,'main',this);
        if (formalIf !== '') {
            var resultIf = checkSyntax(formalIf,'if',this);
        } else {
            resultIf = {status:'ok'};
        }

        if (resultMain.status === 'error' || resultIf.status === 'error') {
            $(widget.element).find('.div_natural_main').empty();
            $(widget.element).find('.div_natural_if').empty();
        } else {
            var json = AKT.convert_formal_to_json(formal);
            var natural = AKT.convert_json_to_english(json);
            const naturalParts = natural.split(' if ');
            if (naturalParts.length === 1){
                var naturalMain = naturalParts[0];
                var naturalIf = '';
            } else {
                naturalMain = naturalParts[0];
                naturalIf = naturalParts[1];
            }
            const divNaturalMain = $(widget.element).find('.div_natural_main');
            const divNaturalIf = $(widget.element).find('.div_natural_if');
            $(divNaturalMain).html(naturalMain);  
            $(divNaturalIf).html(naturalIf);  
        }


        function checkSyntax(formal,bit,element) {
            var json = AKT.convert_formal_to_json(formal);
            if (typeof json === 'object') {
                AKT.analyseJson(json);
                $(widget.element).find('.div_formal_'+bit).css({'background-color':'#a0ffa0'});  
                return {status:'ok',json:json,message:'Check syntax for '+bit+' part of sentence is OK'};
            } else {
                $(element).css({background:'#ffa0a0'});
                $(widget.element).find('.div_formal_'+bit).css({'background-color':'#ffa0a0'});  
                return {status:'error',json:null,message:'Check syntax for '+bit+' part of sentence failed'};
            }
        }
    });

    AKT.state.current_widget = widget;
    $(widget.element).find('.button_template').on('click', function() {
        event.stopPropagation();
        AKT.recordEvent({
            element:widget.element,
            finds:['.button_template'],
            event:'click',
            message:'Clicked the Template button in the statement_details widget'});
        $('#div_node_template_dialog').css({display:'block'});
        $('#div_node_template_dialog').node_template('option',{
            mode:'statement'   
        });
    });



    $(widget.element).find('.button_translate').on('click', function() {
        console.log('Clicked on Translate');
        event.stopPropagation();
        var kbId = widget.options.kbId;
        var kb = AKT.kbs[kbId];
        var statement = {};
        var formalMain = $(widget.element).find('.div_formal_main').text();
        var formalIf = $(divFormalIf).text();
        if (formalIf === '' || formalIf === 'conditional part') {
            var formalIf = '';
            var formal = formalMain;
        } else {
            var formal = formalMain+'if '+formalIf;
        }
        var json = AKT.convert_formal_to_json(formal);
        var natural = AKT.convert_json_to_english(json);
        const bits = natural.split(' if ');
        $(widget.element).find('.textarea_natural_main').val(bits[0]);  
        $(widget.element).find('.textarea_natural_if').val(bits[1]);  
       //$(widget.element).find('.textarea_natural_if').val(natural_if);  
        //kb.sentences.push(formal);
        //console.log(kb.sentences);
    });


    // Formal terms button
    $(widget.element).find('.button_formal_terms').on('click', function() {
        console.log('Clicked on Formal Terms button');
        event.stopPropagation();
        var kbId = widget.options.kbId;
        var kb = AKT.kbs[kbId];

        var eventShiftKey = event ? event.shiftKey : null;

        var panel = AKT.panelise({
            widget_name:'formal_terms',
            position:{left:'20px',top:'20px'},
            size:{width:'410px',height:'375px'},
            shift_key: event.shiftKey,
            options:{kbId:kbId, filters:{term_type:'all', use:'all'},statement:widget.options.statement}
        });
    });


    // ============================================================================ Save
    $(widget.element).find('.button_save').on('click', function() {
        console.log('Clicked on Save');
        console.log(widget.options);
        event.stopPropagation();

        AKT.recordEvent({
            file:'statements.js',
            function:'AKT.widgets.statement_details.setup()',
            event:'click',
            element:widget.element,
            finds:['.button_save'],
            values:[
                {value:$(widget.element).find('.div_formal_main').text(), find:'.div_formal_main', type:'div'},
                {value:$(widget.element).find('.div_formal_if').text(),   find:'.div_formal_if',   type:'div'}
            ],
            message:'Clicked on .button_save in statement_details.js.'
        });

        // This code is for the case when a user has edited (or my have edited) the statement details.
        // See commented-out section below for when a user has created a new statement.

        var kbId = widget.options.kbId;
        var kb = AKT.KBs[kbId];

        var formalMain = $(widget.element).find('.div_formal_main').text();
        var formalIf = $(widget.element).find('.div_formal_if').text();
        if (formalIf === 'conditional part') {
            var formal = formalMain;
        } else {
            formal = formalMain + ' if ' + formalIf;
        }

        console.log(formalMain,' IF ',formalIf,' ... ',formal,':::');
        if (widget.options.mode === 'new') {
            var statement = new Statement({kb:kb,formal:formal});
            console.log('new',statement);
            kb._statements[statement._id] = statement;
            // formalTerms has structure {a:['object'],b:['attribute'],c:['value']} for statement att_value(a,b,c)
            var formalTerms = statement.classifyFormalTerms();
            console.log(formalTerms);
            for (var id in formalTerms) {
                var formalTerm = new FormalTerm({id:id,type:formalTerms[id][0],kb:kb,synonyms:[],description:''});
                kb._formalTerms[id] = formalTerm;
            }
            console.log(statement);
            statement._json = statement.generateJsonFromFormal(formal);
            statement._english = statement.generateEnglish();
            AKT.trigger('new_statement_created_event',{kb:kb,statement:statement});

        } else if (widget.options.mode === 'edit') {
            statement = widget.options.statement;
            statement._formal = formal;
            statement._json = statement.generateJsonFromFormal(formal);
            statement._english = statement.generateEnglish();
            console.log(statement);
            console.log(kb._statements);
            AKT.trigger('statement_changed_event',{kb:kb,statement:statement});
        }


/* TODO: Somehow, this code is for a new statement, not an existing one which may (or may not) have been edited.
   Totally commented out now, while testing the event-recording-and-playback mechanism, but will have to
   re-instate for (a) when you edit a statement, and (b) when you create a new one.
   Note that 
        var formal = $(widget.element).find('.div_formal_main').text();
   returns [object Object] when there is no text in the formal field!!!

        var kbId = widget.options.kbId;
        console.log(kbId);
        var kb = AKT.KBs[kbId];
        var formal = $(widget.element).find('.div_formal_main').text();
        console.log(formal);
        var statement = new Statement({kb:kb,formal:formal});
        // formalTerms has structure {a:['object'],b:['attribute'],c:['value']} for statement att_value(a,b,c)
        var formalTerms = statement.classifyFormalTerms();
        console.log(formalTerms);
        for (var id in formalTerms) {
            var formalTerm = new FormalTerm({id:id,type:formalTerms[id][0],kb:kb,synonyms:[],description:''});
            kb._formalTerms[id] = formalTerm;
        }
        console.log(statement);
        statement._english = statement.generateEnglish();
        kb.addStatement(statement);
*/
    });



    $(widget.element).find('.div_keywords > button').on('click', function() {
        event.stopPropagation();
        console.log($(this).text());
        var formalSoFar = $(widget.element).find('.div_formal_main').text();
        var formalPlus = formalSoFar + $(this).text();
        $(widget.element).find('.div_formal_main').text(formalPlus);
    });


    $(widget.element).find('.button_source_details').on('click', function (event) {   // Source details button
        console.log('BUTTON: Clicked on sources Details button');
        event.stopPropagation();

        var kbId = widget.options.kbId;
        var kb = AKT.KBs[kbId];

        var statement = widget.options.statement;

        console.log(kb);
        var id = $(widget.element).find('.select_sources').val();
        var source = kb._sources[id];
        console.log(kb,statement,id,source);

        var eventShiftKey = event ? event.shiftKey : null;

        var panel = AKT.panelise({
            widget_name:'source_details',
            position:{left:'650px',top:'20px'},
            size:{width:'400px',height:'300px'},
            shift_key: event.shiftKey,
            options:{kbId:kbId, source:source}
        });

    });


    $(widget.element).find('.button_add_source').on('click', function (event) {   // Source details button
        console.log('BUTTON: Clicked on Add source button');
        event.stopPropagation();

        var kbId = widget.options.kbId;
        var kb = AKT.KBs[kbId];

        var eventShiftKey = event ? event.shiftKey : null;

        var panel = AKT.panelise({
            widget_name:'sources',
            position:{left:'20px',top:'20px'},
            size:{width:'470px',height:'390px'},
            shift_key: event.shiftKey,
            options:{kbId:kbId}
        });
    });


    $(widget.element).find('.button_remove_source').on('click', function (event) {   // Source details button
        console.log('BUTTON: Clicked on Remove source button');
        event.stopPropagation();

        var kbId = widget.options.kbId;
        var kb = AKT.KBs[kbId];

        var statement = widget.options.statement;

        console.log(kb);
        var id = $(widget.element).find('.select_sources').val();
        var source = kb._sources[id];
        console.log(kb,statement,id,source);

        var eventShiftKey = event ? event.shiftKey : null;

        var panel = AKT.panelise({
            widget_name:'source_details',
            position:{left:'20px',top:'20px'},
            size:{width:'470px',height:'390px'},
            shift_key: event.shiftKey,
            options:{kbId:kbId, source:source}
        });

    });


    $(widget.element).find('.div_formal_main').on('input', function (event) {
        const divFormalMain = $(widget.element).find('.div_formal_main');

        const regex = /<\/?\w[^>]*>/g;
        var formalMainHtml = $(divFormalMain).html();
        var formalMain = formalMainHtml.replace(regex, '');

        console.log(formalMainHtml,formalMain);

        try {
            var result = statementParser.parse(formalMain);
            $(widget.element).find('.div_formal_main_flag').css({background:'#50ff50'});
            console.log(result);
        }
        catch(error) {
            $(widget.element).find('.div_formal_main_flag').css({background:'red'});
            console.log('name:',error.name, '\nmessage:',error.message, '\nfound:',error.found, '\nlocation:',error.location.start.offset);
        }
    });

};


/*  
As of 30 Sept 2021, I have made the switch from the primary version of a statement
being the formal (Prolog) one, to it being the JSON one.   The formal version,
which is the one the user can edit or enter, if generated from the JSON, as is the
natural-language version.   

The justification for this is to keep it identical to the way that statements are
stored in an external file (which is fully sytactically-correct JSON), and
directly accessible for processing by JavaScript, rather than having to be converted
to JSON (or, to be precise, an object literal) before any procdessing can be done.

Now, the only formal-to-JSON conversion that needs to be done is when processing the
statements entered or edited by the user.
*/


AKT.widgets.statement_details.display = function (widget) {

    console.log('statement_detail options:/n',widget.options);

    $(widget.element).find('.div_keywords > button').css({'padding-left':'3px','padding-right':'3px'});

    var kbId = widget.options.kbId;
    var kb = AKT.KBs[kbId];

    const divFormalMain = $(widget.element).find('.div_formal_main');
    const divFormalIf = $(widget.element).find('.div_formal_if');
    const divNaturalMain = $(widget.element).find('.div_natural_main');
    const divNaturalIf = $(widget.element).find('.div_natural_if');

    if (widget.options.statement) {     // This is skipped if it's a New statement.
        let statement = widget.options.statement;

        var formalHtml = statement.generateFormalHtml();
        var englishHtml = statement.generateEnglishHtml();

        formalHtml = formalHtml.replace('if','<b>if</b><br/>');
        englishHtml = englishHtml.replace('if','<b>if</b><br/>');

        // Add line-wrapping break-points (the HTML <wbr> tag) after commas in the formal version.
        let regex = /,/g;
        formalHtml = formalHtml.replace(regex,',<wbr>');

        // Now insert the various bits into their respective HTML elements.
        $(widget.element).find('.div_kb_id').text(kbId);    
        $(widget.element).find('.div_statement_id').text(statement._id); 

        $(widget.element).find('.div_formal').html(formalHtml);  
        $(widget.element).find('.div_english').html(englishHtml);  

        $('.formal_term_action').css({color:'orange'});
        $('.formal_term_process').css({color:'brown'});
        $('.formal_term_object').css({color:'red'});
        $('.formal_term_part').css({color:'purple'});
        $('.formal_term_attribute').css({color:'blue'});
        $('.formal_term_value').css({color:'green'});

        AKT.loadOptions(widget.element, 'select_sources', statement.sources);

        $(widget.element).find('.formal_term').on('click', function (event) {    // The Details button
            console.debug('BUTTON: Clicked on a formal term in the statement.');
            event.stopPropagation();

            var formalTermId = $(this).text();
            console.log($(this),formalTermId);
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
                    options:{kbId:kbId, mode:'view', formal_term:formalTerm}
                });
            } else {
                alert('Please first select a formal term from the listbox.');
            }
        });

    } else {
       var json = ["att_value",["part","a","b"],"c","d"];
       //AKT.walkThruJson(json);
        var formal = AKT.convert_json_to_formal1(json);
        console.log('^^^ ',formal);

        // For entering a New statement
        // I have retained AKT5's separate boxes for the main and conditional parts
        // of a statement.   Since both are handled identically, I've put the code
        // into a function which is caled twice, once for each part.
        // The second argument is the "placeholder" (tech speak for the grey prompt
        // that you sometimes see in input boxes).

        // I have tried published solutions to use the HTML placeholder attribute,
        // instead of my hacked solution, for inside a <div>, but I can't get it to work.
        // See e.g. https://stackoverflow.com/questions/20726174/placeholder-for-contenteditable-div
        handleFormalDiv(divFormalMain,'main part');
        handleFormalDiv(divFormalIf,'conditional part');

        function handleFormalDiv(divFormal, placeholder) {
            $(divFormal).text(placeholder);    
            $(divFormal).css({'color':'#808080','font-size':'13px'});   

            $(divFormal).on('click', function(e) {
                if ($(divFormal).text() === placeholder) {
                    $(divFormal).text('');
                    $(divFormal).css({'color':'black','background-color':'yellow'});    
                }
            });
        }
    }


};




AKT.widgets.statement_details.html = `
<div class="content" style="border:none;padding:10px;">

    <div style="float:left;">Knowledge Base: </div>
    <div class="div_kb_id" style="float:left;font-weight:bold;margin-left:4px;"></div>
    <div style="float:left;margin-left:100px;">Statement ID:</div>
    <div class="div_statement_id" style="float:left;font-weight:bold;margin-left:4px;"></div>

    <div style="clear:both;" />

    <div style="float:left;padding:5px;">
        <fieldset>
            <legend>Formal Language Statement :</legend>
            <div class="div_keywords" style="display:none;">
                <button>att_value</button>
                <button>action</button>
                <button>part</button>
                <button>process</button>
                <button>causes1way</button>
                <button>causes2way</button>
            </div>
            <div style="padding:1px;">
                <div class="div_formal" contenteditable style="float:left;word-wrap:break-word;white-space:normal;font-size:13px;width:410px;height:70px;background:white;"></div>
                <div class="div_formal_main_flag" style="float:left;width:10px;height:35px;background:white;"></div>
                <div style="clear:both;"></div>
            </div>
        </fieldset>

        <fieldset>
            <legend>English:</legend>
            <div class="div_english" style="font-size:13px;padding:1px;width:420px;height:70px;background:#eaeaea;"></div>
        </fieldset>
    </div>

    <div style="float:left;width:100px;text-align:center;padding:10px;">
        <button class="button_check_syntax" style="width:70px;height:40px;margin:5px;">Check Syntax</button><br/>
        <button class="button_translate" disabled style="width:70px;height:25px;margin:5px;">Translate</button><br/>
        <button class="button_template" style="width:70px;height:25px;margin:5px;">Template</button>
        <button class="button_formal_terms" style="width:70px;height:40px;margin:5px;">Formal Terms</button><br/>
        <button class="button_memo" disabled style="width:70px;height:25px;margin:5px;">Memo</button>
        <button class="button_save inwidget_recording" style="width:70px;height:25px;margin:5px;">Save</button><br/>
    </div>

    <div style="clear:both;" />

    <fieldset style="float:left;">
        <div style="float:left;">Source  /<br/>Derivation</div>
        <select class="select_sources" size="5" style="float:left; clear:right;width:220px;background:white;">[]</select>
        <div style="float:left;width:120px;">
            <button class="button_source_details" style="width:100px;height:20px;margin-left:20px;margin-top:0px;">Source details</button>
            <button class="button_add_source" style="width:100px;height:20px;margin-left:20px;margin-top:4px;">Add source</button>
            <button class="button_remove_source" style="width:100px;height:20px;margin-left:20px;margin-top:4px;">Remove source</button>
        </div>
    </fieldset>


</div>     <!-- End of content div -->
`;



