AKT.widgets.source_details = {};


AKT.widgets.source_details.setup = function (widget) {

    $(widget.element).find('.button_statements').on('click', function() {
        event.stopPropagation();
        var kbId = widget.options.kbId;
        var kb = AKT.kbs[kbId];

        console.log(widget.options);

        var source = widget.options.source;

        var eventShiftKey = event ? event.shiftKey : null;

        var panel = AKT.panelise({
            widget_name:'statements',
            position:{left:'650px',top:'20px'},
            size:{width:'580px',height:'550px'},
            shift_key: event.shiftKey,
            options:{kbId:kbId, filters:{source:true, source_value:source._id}}
        });
    });


    $(widget.element).find('.button_save').on('click', function() {
        event.stopPropagation();
        console.log('save',widget.options);
        //var kbId = widget.options.kbId;
        var kbId = AKT.state.current_kb;
        var kb = AKT.KBs[kbId];
        console.log(kbId,kb);

        if (widget.options.mode ==='new') {
            var name = $(widget.element).find('.div_name').text();
            var location = $(widget.element).find('.div_location').text();
            var year = $(widget.element).find('.div_year').text();
            var suffix = $(widget.element).find('.div_suffix').text();
            var id = name+'_'+location+'_'+year+suffix;
            var source = new Source({id:id,name:name,location:location,year:year,suffix:suffix});
            kb['_'+id] = source;
        } else {
            var source = widget.options.source;
            name = source._name;
            location = source._location;
            year = source._year;
            suffix = source._suffix;
            id = source._id;
        }
        var interviewer = $(widget.element).find('.div_interviewer').text();
        var interviewee = $(widget.element).find('.div_interviewee').text();
        var sex = $(widget.element).find('.select_sex').val();
        var month = $(widget.element).find('.input_month').val();
        var day = $(widget.element).find('.input_day').val();

        $(widget.element).find('.div_id').text(id);

        // Update the Source instance.
/*
        source._id =          id;
        source._name =        name;
        source._location =    location;
        source._year =        year;
        source._suffix =      suffix;
*/
        source._interviewer = interviewer;
        source._interviewee = interviewee;
        source._sex =         sex;
        source._month =       month;
        source._day =         day;
        kb._sources[id] = source;

        console.log(kb,source);

        var tempSource = {
            id: id,
            name: name,
            location: location,
            year: year,
            suffix: suffix,
            interviewer: interviewer,
            interviewee: interviewee,
            sex: sex,
            month: month,
            day: day
        };
        localStorage.setItem('latest_source',JSON.stringify(tempSource));

        AKT.recordEvent({
            file:'source_details.js',
            function:'AKT.widgets.source_details.setup()',
            element:widget.element,
            finds:['.button_save'],
            event:'click',
            values:[
                {value:name,        find:'.div_name',        type:'div'},
                {value:location,    find:'.div_location',    type:'div'},
                {value:year,        find:'.div_year',        type:'div'},
                {value:suffix,      find:'.div_suffix',      type:'div'},
                {value:interviewer, find:'.div_interviewer', type:'div'},
                {value:interviewee, find:'.div_interviewee', type:'div'},
                {value:sex,         find:'.div_sex',         type:'div'},
                {value:month,       find:'.input_month',     type:'input'},
                {value:day,         find:'.input_day',       type:'input'},
            ],
            message:'Clicked on the Save button in the source_details panel.'
        });
    });

/*
    $(widget.element).find('.button_save').on('click', function() {
        console.log('Clicked on Save');
        console.log(widget.options);

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

        var kbId = widget.options.kbId;
        var kb = AKT.KBs[kbId];

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
            statement._json = this.generateJsonFromFormal(formal);
            statement._english = statement.generateEnglish();
            AKT.trigger('new_statement_created_event',{kb:kb,statement:statement});

        } else if (widget.options.mode === 'details') {   // Temporary - no changes made in details mode. Should be in edit.
            statement = widget.options.source;
            statement._formal = formal;
            statement._json = statement.generateJsonFromFormal(formal);
            statement._english = statement.generateEnglish();
            console.log(statement);
            console.log(kb._statements);
            AKT.trigger('statement_changed_event',{kb:kb,statement:statement});

        } else if (widget.options.mode === 'edit') {
            statement = widget.options.statement;
            statement._formal = formal;
            statement._json = statement.generateJsonFromFormal(formal);
            statement._english = statement.generateEnglish();
            console.log(statement);
            console.log(kb._statements);
            AKT.trigger('statement_changed_event',{kb:kb,statement:statement});
        }

    });
*/

};


// ===============================================================================

AKT.widgets.source_details.display = function (widget) {
    var kbId = widget.options.kbId;
    var kb = AKT.KBs[kbId];
    console.log(widget.options,AKT.state,kb);
    var source = widget.options.source; 
    console.log(source);

    if (source) {
        $(widget.element).find('.div_id').text(source._id);
        $(widget.element).find('.div_name').text(source._name);
        $(widget.element).find('.div_location').text(source._location);
        $(widget.element).find('.div_year').text(source._year);
        $(widget.element).find('.div_suffix').text(source._suffix);
        $(widget.element).find('.div_interviewer').text(source._interviewer);
        $(widget.element).find('.div_interviewee').text(source._interviewee);
        $(widget.element).find('.select_sex').val(source._sex);
        $(widget.element).find('.input_day').val(source._day);
        $(widget.element).find('.input_month').val(source._month);

    } else {         //sourceIndex = null - i.e. it's a new source
        if (localStorage.getItem('latest_source')) {
            var tempSource = JSON.parse(localStorage.getItem('latest_source'));
            console.log(123,tempSource);
            //$(widget.element).find('.div_id').text('Will be derived from Source data');
            $(widget.element).find('.div_name').text(tempSource.name);
            $(widget.element).find('.div_location').text(tempSource.location);
            $(widget.element).find('.div_year').text(tempSource.year);
            $(widget.element).find('.div_suffix').text(tempSource.suffix);
            $(widget.element).find('.div_interviewer').text(tempSource.interviewer);
            $(widget.element).find('.div_interviewee').text(tempSource.interviewee);
            $(widget.element).find('.div_sex').text(tempSource.sex);
            $(widget.element).find('.input_day').val(tempSource.day);
            $(widget.element).find('.input_month').val(tempSource.month);
        } else {
            $(widget.element).find('.div_id').text('Will be derived from Source data');
            $(widget.element).find('.div_location').text('');
            $(widget.element).find('.div_year').text('');
            $(widget.element).find('.div_suffix').text('');
            $(widget.element).find('.div_interviewer').text('');
            $(widget.element).find('.div_interviewee').text('');
            $(widget.element).find('.div_sex').text('');
            $(widget.element).find('.input_day').val('');
            $(widget.element).find('.input_month').val('');
        }
    }

    // TODO: Doesn't show selected options! - i.e. values for current source
    $('#div_user_user_labels').empty();
/*
    $.each(kb._source_user_labels, function(labelId,possibleValues) {
        var label = $('<label style="display:inline-block;width:120px;margin-top:10px;">'+labelId+'</label>');
        var select = $('<select style="width:150px;background:white;"></select>');
        $.each(possibleValues, function(i,val) {
            var option = $('<option value="'+val+'">'+val+'</option>');
            $(select).append(option);
        });
        $('#div_user_user_labels').append(label).append(select).append('<br/>');
    });
*/
    // TODO: Get KB amended so above code works.   Need to list value set for each label.
    var select = $('<select style="width:150px;background:white;"></select>');
    $.each(kb._source_user_labels, function(i,label) {
        var option = $('<option value="'+label+'">'+label+'</option>');
        $(select).append(option);
    });
    $('#div_user_user_labels').append('<br/>').append(select).append('<br/>');

};


AKT.widgets.source_details.html = `
<div class="content" style="border:none;padding:15px;">

    <div>
        <div style="float:left;">ID:</div>
        <div class="div_id" style="float:left; font-weight:bold; color:#909090; margin-left:5px;"></div>
    </div>

    <div style="clear:both;"></div>

    <fieldset style="float:left;">
        <legend>SOURCE</legend>

        <div style="float:left;width:70px;">Name:</div>
        <div class="div_name" contenteditable style="float:left;overflow:hidden;height:18px;width:120px;background:white;border:solid 1px black;padding-left:5px;"></div><br/>

        <div style="float:left;width:70px;margin-top:7px;">Location::</div>
        <div class="div_location" contenteditable style="float:left;overflow:hidden;height:18px;width:120px;background:white;border:solid 1px black;padding-left:5px;margin-top:7px;"></div><br/>

        <div style="float:left;width:70px;margin-top:7px;">Year:</div>
        <div class="div_year" contenteditable style="float:left;overflow:hidden;height:18px;width:70px;background:white;border:solid 1px black;padding-left:5px;margin-top:7px;"></div><br/>

        <div style="float:left;width:70px;margin-top:7px;">Year suffix:</div>
        <div class="div_suffix" contenteditable style="float:left;overflow:hidden;height:18px;width:30px;background:white;border:solid 1px black;padding-left:5px;margin-top:7px;"></div><br/>
    </fieldset>

    <div style="float:left;margin-left:15px;padding:top:15px;">
        <button class="button_save" style="width:65px;height:25px;margin:5px;">Save</button><br/>
        <button class="button_memo" disabled style="width:65px;height:25px;margin:5px;">Memo</button>
    </div>

    <div style="float:left;clear:left;margin-top:9px;">
        <div style="float:left;display:inline-block;width:70px;">Interviewer</div>
        <div class="div_interviewer" contenteditable style="float:left;overflow:hidden;height:18px;width:200px;background:white;border:solid 1px black;padding-left:5px;"></div><br/>

        <div style="float:left;display:inline-block;width:70px;margin-top:7px;">Interviewee</div>
        <div class="div_interviewee" contenteditable style="float:left;overflow:hidden;height:18px;width:200px;background:white;border:solid 1px black;padding-left:5px;margin-top:7px;"></div>
    </div>

    <div style="float:left;margin-left:15px;margin-top:8px;">
        <label for="">Gender</label><br/>
        <select id="" style="background:white;">
            <option value="male">M</option>
            <option value="female">F</option>
            <option value="male">male</option>
            <option value="female">female</option>
            <option value="mixed">mixed</option>
            <option value="na">na</option>
        </select>
    </div>

    <!-- container for user labels -->
    <div id="div_user_user_labels" style="float:left;margin-top:20px;"></div>
    
    <div style="clear:both;"></div>

    <fieldset style="float:left; margin-top:20px;">
        <legend>DATE</legend>

        <label style="display:inline-block;" for="">Day</label>
        <input class="input_day" style="width:25px;" for=""></input>

        <label style="display:inline-block;margin-left:10px;" for="">Month</label>
        <input class="input_month" style="width:60px;" for=""></input><br/>
    </fieldset>

    <div style="float:left;">
        <button class="button_statements" style="width:100px;height:35px;">Statements</button>
    </div>


</div>     <!-- End of content div -->
`;



