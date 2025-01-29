AKT.widgets.statement_details = {};


AKT.widgets.statement_details.setup = function (widget) {

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

    $(widget.element).find('.div_keywords > button').css({'padding-left':'3px','padding-right':'3px'});

    const kbId = widget.options.kbId;
    const kb = AKT.kbs[kbId];

    const divFormalMain = $(widget.element).find('.div_formal_main');
    const divFormalIf = $(widget.element).find('.div_formal_if');
    const divNaturalMain = $(widget.element).find('.div_natural_main');
    const divNaturalIf = $(widget.element).find('.div_natural_if');

    if (widget.options.statement) {     // This is skipped if it's a New statement.
        let statement = widget.options.statement;

        // Extract the main and conditional (if any) parts of the statement.
        var formalParts = statement.splitAtIf(statement.formal);
        var englishParts = statement.splitAtIf(statement.english);

        // Add line-wrapping break-points after commas (the HTML <wbr> tag).
        let regex = /,/g;
        let formalMainHtml = formalParts[0].replace(regex,',<wbr>');
        let formalIfHtml = formalParts[1].replace(regex,',<wbr>');

        // Now insert the various bits into their respective HTML elements.
        $(widget.element).find('.div_kb_id').text(kbId);    
        $(widget.element).find('.div_statement_id').text(statement.id);    // Should be ID

        $(divFormalMain).html(formalMainHtml);  
        $(divFormalIf).html(formalIfHtml);  

        $(divNaturalMain).text(englishParts[0]);  
        $(divNaturalIf).text(englishParts[1]);  

    } else {
       var json = ["att_value",["part","a","b"],"c","d"];
       //AKT.walkThruJson(json);
        var formal = AKT.convert_json_to_formal1(json);
        console.debug('^^^ ',formal);

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


    $(widget.element).find('.button_check_syntax').on('click', function() {
        console.debug('Clicked on Check Syntax');
        var kbId = widget.options.kbId;
        var kb = AKT.kbs[kbId];

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

        const regex = /<\/?\w[^>]*>/g;
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
            $(divNaturalMain).text(naturalMain);  
            $(divNaturalIf).text(naturalIf);  
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


    $(widget.element).find('.button_translate').on('click', function() {
        console.debug('Clicked on Translate');
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
        //console.debug(kb.sentences);
    });


    $(widget.element).find('.button_save').on('click', function() {
        console.debug('Clicked on Save');
        var kbId = widget.options.kbId;
        var kb = AKT.kbs[kbId];
        var statement = {};
        statement.formal = $(widget.element).find('.textarea_formal').val();
        console.debug(statement);
        kb.sentences.push(statement);
        console.debug(kb.sentences);
    });



    $(widget.element).find('.div_keywords > button').on('click', function() {
        console.debug($(this).text());
        var formalSoFar = $(widget.element).find('.div_formal_main').text();
        var formalPlus = formalSoFar + $(this).text();
        $(widget.element).find('.div_formal_main').text(formalPlus);
    });

};




AKT.widgets.statement_details.html = `
<div class="content" style="border:none;padding:10px;">

    <div style="float:left;">Knowledge Base: </div>
    <div class="div_kb_id" style="float:left;font-weight:bold;margin-left:4px;"></div>
    <div style="float:left;margin-left:100px;">Statement No:</div>
    <div class="div_statement_id" style="float:left;font-weight:bold;margin-left:4px;"></div>

    <fieldset>
        <div style="float:left;">Source  /<br/>Derivation</div>
        <select class="select_sources" style="float:left; clear:right;width:470px;height:20px;background:white;">[]</select>
        <button class="button_sources" style="width:90px;height:20px;margin-left:30px;margin-top:10px;">Sources</button>
        <button class="button_derivation" style="width:90px;height:20px;margin-left:30px;margin-top:10px;">Derivation</button>
        <button class="button_knowledge_categories" style="width:150px;height:20px;margin-left:30px;margin-top:10px;">Knowledge Categories</button>
    </fieldset>

    <div style="clear:both;" />

    <div style="float:left;padding:5px;">
        <fieldset>
            <legend>Formal Language Statement :</legend>
            <div class="div_keywords">
                <button>att_value</button>
                <button>action</button>
                <button>part</button>
                <button>process</button>
                <button>causes1way</button>
                <button>causes2way</button>
            </div>
            <div class="div_formal_main" contenteditable style="word-wrap:break-word;white-space:normal;font-size:13px;padding:1px;width:420px;height:35px;background:white;"></div>
            <div style="width:30px;height:20px;">IF :</div>
            <div class="div_formal_if" contenteditable style="font-size:13px;padding:1px;width:420px;height:35px;background:white;"></div>
        </fieldset>

        <fieldset>
            <legend>Natural Language:</legend>
            <div class="div_natural_main" style="font-size:13px;padding:1px;width:420px;height:35px;background:#eaeaea;"></div>
            <div style="width:30px;height:20px;background:none">IF :</div>
            <div class="div_natural_if" style="font-size:13px;padding:1px;width:420px;height:35px;background:#eaeaea;"></div>
        </fieldset>
    </div>

    <div style="float:left;width:100px;text-align:center;padding:10px;">
        <button class="button_check_syntax" style="width:70px;height:40px;margin:5px;">Check Syntax</button><br/>
        <button class="button_translate" style="width:70px;height:25px;margin:5px;">Translate</button><br/>
        <button class="button_wizard" style="width:70px;height:25px;margin:5px;">Wizard</button>
        <button class="button_formal_terms" style="width:70px;height:40px;margin:5px;">Formal Terms</button><br/>
        <button class="button_memo" style="width:70px;height:25px;margin:5px;">Memo</button>
        <button class="button_save" style="width:70px;height:25px;margin:5px;">Save</button><br/>
    </div>

</div>     <!-- End of content div -->
`;



