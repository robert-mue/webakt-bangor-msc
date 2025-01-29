AKT.widgets.tools = {};


AKT.widgets.tools.setup = function (widget) {

};


AKT.widgets.tools.display = function (widget) {

    AKT.state.current_code = arguments.callee.toString();
    console.debug('Starting akt.dialog_Macros: display()');
    var kbId = AKT.state.current_kb;
    var kb = AKT.kbs[kbId];

    if (widget.options.show_titlebar) {
        var widgetTitlebar = $('<div class="titlebar">dialog_Macros<input type="button" value="X" class="dialog_close_button"/></div>');  
        $(widget.element).append(widgetTitlebar);
        $('.dialog_close_button').css({background:'yellow'});
        $('.dialog_close_button').on('click', function () {
            var id = $(this).parent().parent()[0].id;
            $('#'+id).css({display:"none"});
        });
    }

    // SETUP
    $(widget.element).find('.listbox_tools').empty();
    // Note how easy it is to get the widgets (*not* the widget instances).
    // It's picking it up from the .akt object, at the start of each widget's code:
    //     $.widget('akt.statements_summary', {...
    // If we wanted to, we could get e.g. a title or the widget description, from
    // widgets[widgetId].metadata.
    // I prefer the actual name (e.g. "statements_summary"), rather than a prettified version of it
    // (e.g. Statements summary", or worse, "Summary of statements". since that would make it harder
    // to find its code etc.
    //var widgets = window.jQuery.akt;   // In fact, just using an array of widgetIds...
    var widgets = {
        statements_summary:{description:'Generates a table showing, for each of att_value, causal and comparison types of statement, the number of non-conditional and conditional statements, and the totals.'}, 
        hierarchic_objects_usage:{description:'Produces a table showing the occurrence of the same object (formal term) within the various object hierarchies in the knowledge base.'},
        species_report:{description:'Produces a comprehensive report on a user-chosen species (generally, an object-type of formal term.'},
        node_template:{description:'Used for defining nodes in diagrams.'}
    }
    for (var widgetId in widgets) {
        var option = $('<option value="'+widgetId+'">'+widgetId+'</option>');
        $(widget.element).find('.listbox_tools').append(option);
    }

    // EVENT HANDLERS
    $(widget.element).find('.button_run').on('click', function(event) {   // Run button
        console.log('BUTTON: Clicked on tools (macros) Run button');
        event.stopPropagation();

        console.log('##',AKT.state.current_tool);
        var widgetPanelId = AKT.createWidgetPanel(AKT.state.current_tool);
        $('#'+widgetPanelId)[AKT.state.current_tool]({});

        AKT.incrementZindex("webakt1:$(.macros102).on(click)/"+AKT.state.current_tool);
        $('#'+widgetPanelId).css({"z-index":AKT.state.zindex});
     
    });

    $(widget.element).find('.button_details').on('click', function(event) {   // Code button
        console.log(AKT.state.current_code);
    });


    $(widget.element).find('.listbox_tools').on('change', function (event, value) {
        event.stopPropagation();
        if (this.value === '') {
            var toolId = value;
        } else {
            toolId = this.value;
        }
        console.log(value,this.value,toolId,AKT.state.current_tool);
        AKT.state.current_tool = toolId;
        var toolWidget = widgets[toolId];
        if (toolWidget && toolWidget.description) {
            $(widget.element).find('.textarea_description').val(toolWidget.description);
        } else {
            $(widget.element).find('.textarea_description').val('No description available');
        }
    });

    $(widget.element).draggable({containment:'#workspace',handle:".titlebar"});
    $(widget.element).css({display:'block'});
};


AKT.widgets.tools.html = `
<div class="content" style="border:none;padding:15px;">

    <div style="float:left;">
        <fieldset style="float:left;">
            <legend>List of tools</legend>
            <select class="listbox_tools" size=15 style="width:300px; background:white; overflow-y:auto;">[]</select>
        </fieldset>

        <div style="float:left;">
            <fieldset>
                <legend>Tool Options</legend>

                <button class="button_description" style="display:none;width:75px;height:30px;">Description</button><br/>
                <button class="button_details" disabled style="width:75px;height:30px;">Details</button><br/>
                <button class="button_run" style="width:75px;height:30px;">Run</button><br/>
            </fieldset>
        </div>
    </div>

    <div style="clear:both;"></div>

    <fieldset>
        <legend>Description</legend>
        <textarea class="textarea_description" style="width:400px;height:100px; overflow-y:auto;"></textarea>
    </fieldset>

    <div style="clear:both;"></div>

</div>     <!-- End of content div -->
`;



