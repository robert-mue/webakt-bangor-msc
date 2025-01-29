AKT.widgets.source_details = {};


AKT.widgets.source_details.setup = function (widget) {

};


AKT.widgets.source_details.display = function (widget) {
    var kbId = widget.options.kbId;
    var kb = AKT.kbs[kbId];
    var source = widget.options.source; 

    var widgetContent = $(widget.element).find('.content');

    // SETUP
    // The use of 'private' properties is a temporary hack...
    if (source) {
        $(widgetContent).find('.div_name').text(source._name);
        $(widgetContent).find('.div_location').text(source._location);
        $(widgetContent).find('.div_year').text(source._year);
        $(widgetContent).find('.div_suffix').text(source._suffix);
        $(widgetContent).find('.div_interviewer').text(source._interviewer);
        $(widgetContent).find('.div_interviewee').text(source._interviewee);
        $(widgetContent).find('.select_sex').val(source._sex);
        $(widgetContent).find('.input_day').val(source._day);
        $(widgetContent).find('.input_month').val(source._month);

    } else {         //sourceIndex = null - i.e. it's a new sorce
        $(widgetContent).find('.div_name').text('');
        $(widgetContent).find('.div_location').text('');
        $(widgetContent).find('.div_year').text('');
        $(widgetContent).find('.div_suffix').text('');
        $(widgetContent).find('.div_interviewer').text('');
        $(widgetContent).find('.div_interviewee').text('');
        $(widgetContent).find('.input_day').val('');
        $(widgetContent).find('.input_month').val('');
    }

    // TODO: Doesn't show selected options! - i.e. values for current source
    $('#sourcedetails500').empty();
    $.each(kb.sourceUserLabels, function(labelId,possibleValues) {
        var label = $('<label style="display:inline-block;width:120px;margin-top:10px;">'+labelId+'</label>');
        var select = $('<select style="width:150px;background:white;"></select>');
        $.each(possibleValues, function(i,val) {
            var option = $('<option value="'+val+'">'+val+'</option>');
            $(select).append(option);
        });
        $('#sourcedetails500').append(label).append(select).append('<br/>');
    });
};


AKT.widgets.source_details.html = `
<div class="content" style="border:none;padding:15px;">
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
        <button style="width:65px;height:25px;margin:5px;">Save</button><br/>
        <button style="width:65px;height:25px;margin:5px;">Memo</button>
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
    <div id="sourcedetails500" style="float:left;margin-top:20px;"></div>
    
    <div style="clear:both;"></div>

    <fieldset style="float:left; margin-top:20px;">
        <legend>DATE</legend>

        <label style="display:inline-block;" for="">Day</label>
        <input class="input_day" style="width:20px;" for=""></input>

        <label style="display:inline-block;margin-left:10px;" for="">Month</label>
        <input class="input_month" style="width:60px;" for=""></input><br/>
    </fieldset>


</div>     <!-- End of content div -->
`;



