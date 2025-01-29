AKT.widgets.node_template = {};


AKT.widgets.node_template.setup = function (widget) {

    // Note: We have to include the template input event handlers here, since otherwise 
    // they won't be registered after cloning .template elements.
    function createTemplateEventHandlers() {
        $(".input").mousedown(function() {
            handleInputEvent(this);
        });

        $(".input").keyup(function() {
            handleInputEvent(this);
        });

        function handleInputEvent(self) {
            $(self).parent().parent().find('.template').css({display:'none'});
            $(self).parent().css({display:'block'});
            var inputVal = $(self).val();
            var type = $(self).attr('list');
            var options = '';
            for (var i=0; i<memory[type].length; i++) {
                if (memory[type][i].startsWith(inputVal)) {
                    options += '<option value="' + memory[type][i] + '" />';
                }
            }
            document.getElementById(type).innerHTML = options;
        }
    }

// ************************************** Show statements
    $('#show_statement').on('click', function() {
        var statementType = $("input[name='statement_type_option']:checked").val();
        console.debug(statementType);
        var statements = $('#main_div').find('.template').filter(function() {
                return this.style.display == 'block';
            });
        var allEntries = [];
        var allNames = [];
        $.each(statements, function(i,statement) {
            allEntries[i] = [];
            allNames[i] = $(statement).attr('name');
            console.debug('**--- ',allNames);
            var k = 0;
            $.each(statement.children, function(j,element) {
                if (element.localName === 'input') {
                    allEntries[i][k] = $(element).val();
                    k += 1;
                }
            });
        });

        if (statementType === 'attval') {
            var formal = getFormalAttValue(allNames[0],allEntries[0]);
            var listed = getListedAttValue(allNames[0],allEntries[0]);

        } else if (statementType === 'causes') {
            var causesType = $("input[name='causes_options']:checked").val();

            var formalCause = getFormalAttValue(allNames[0],allEntries[0]);
            var formalEffect = getFormalAttValue(allNames[1],allEntries[1]);
            formal = formalCause + ' ' + causesType + ' ' + formalEffect;
            console.debug('formal: '+formal);

            var listedCause = getListedAttValue(allNames[0],allEntries[0]);
            var listedEffect = getListedAttValue(allNames[1],allEntries[1]);
            listed = '["' + causesType + '",' + listedCause + ',' + listedEffect+']';

        } else {
            alert('Internal error - not your fault!\nUnrecognised statementType in "show_statement" click handler.');
        }
        $('#result').append('<div><b>Formal: </b>'+formal+'</div>');
        $('#result').append('<div><b>Listed: </b>'+listed+'</div>');
        var nestedList = JSON.parse(listed);
        console.debug('[[[ ]]]',nestedList);
        var english = translate(nestedList);
        $('#result').append('<div><b>English: </b>'+english+'</div>');

    });

// --------------------------------------------------- End of event handlers

    // Formal (original AKT5 Prolog) syntax
    function getFormalAttValue(type,entries) {
        console.debug(type, entries);
        switch (type) {
            case 'attval_object1' :
                var formal = 'att_value('+getFormalObjectPart(entries,0,1)+
                ', '+entries[2]+', '+entries[3]+')';
                break;
                
            case 'attval_process1' :
                formal ='att_value(process('+entries[0]+'),'+entries[1]+
                        ', '+entries[2]+')';
                break;
                
            case 'attval_process2' :
                formal ='att_value(process('+getFormalObjectPart(entries,0,1)+
                        ', '+entries[2]+'),'+entries[3]+', '+entries[4]+')';
                break;
                
            case 'attval_process3' :
                formal ='att_value(process('+getFormalObjectPart(entries,0,1)+
                        ', '+entries[2]+'),'+getFormalObjectPart(entries,3,4)+', '+entries[5]+', '+entries[6]+')';
                break;
                
            case 'attval_action1' :
                formal = 'att_value(action('+entries[0]+', '+getFormalObjectPart(entries,1,2)+
                '),'+entries[3]+', '+entries[4]+')';
                break;
                
            case 'attval_action2' :
                formal = 'att_value(action('+entries[0]+', '+getFormalObjectPart(entries,1,2)+
                ', '+getFormalObjectPart(entries,3,4)+'),'+entries[5]+', '+entries[6]+')';
                break;
                
            case 'process1' :
                formal = 'process('+entries[0]+')';
                break;
                
            case 'process2' :
                formal = 'process('+getFormalObjectPart(entries,0,1)+
                        ', '+entries[2]+')';
                break;
                
            case 'process3' :
                formal = 'process('+getFormalObjectPart(entries,0,1)+
                        ', '+entries[2]+','+getFormalObjectPart(entries,3,4)+')';
                break;
                
            case 'action1' :
                formal = 'action('+entries[0]+', '+getFormalObjectPart(entries,1,2)+')';
                break;
                
            case 'action2' :
                formal = 'action('+entries[0]+', '+getFormalObjectPart(entries,1,2)+
                ', '+getFormalObjectPart(entries,3,4)+')';
                break;
                
            case 'object1' :
                formal = 'object('+getFormalObjectPart(entries,0,1)+')';
                break;

            default:
                alert('ERROR - not your fault - unrecognised type: '+type+' for '+JSON.stringify(entries));
                formal = type+'...'+JSON.stringify(entries);
        }
        return formal;
    }

    function getFormalObjectPart(entries,i,j) {
        if (entries[j] === '') {
            return entries[i];     // Just a plain object atom
        } else {
            return 'part('+entries[i]+', '+entries[j]+')';   // part(Object,Part)
        }
    }

    // New (webAKT nested-list) syntax
    function getListedAttValue(type,entries) {
        switch (type) {
            case 'attval_object1' :
                var listed = '["att_value",'+getListObjectPart(entries,0,1)+
                ', "'+entries[2]+'", "'+entries[3]+'"]';
                break;
                
            case 'attval_process1' :
                listed = '["att_value",["process", "'+entries[0]+'"], "'+entries[1]+
                        '", "'+entries[2]+'"]';
                break;
                
            case 'attval_process2' :
                listed = '["att_value",["process",'+getListObjectPart(entries,0,1)+
                        ', "'+entries[2]+'"], "'+entries[3]+'", "'+entries[4]+'"]';
                break;
                
            case 'attval_process3' :
                listed = '["att_value",["process",'+getListObjectPart(entries,0,1)+
                        ', "'+entries[2]+'"],'+getListObjectPart(entries,3,4)+', "'+entries[5]+'", "'+entries[6]+'"]';
                break;
                
            case 'attal_action1' :
                listed = '["att_value",["action", "'+entries[0]+'",'+getListObjectPart(entries,1,2)+
                '], "'+entries[3]+'", "'+entries[4]+'"]';
                break;
                
            case 'attval_action2' :
                listed = '["att_value",["action", "'+entries[0]+'",'+getListObjectPart(entries,1,2)+
                ','+getListObjectPart(entries,3,4)+'], "'+entries[5]+'", "'+entries[6]+'"]';
                break;
                
            case 'process1' :
                listed = '["process","'+entries[0]+'"]';
                break;
                
            case 'process2' :
                listed = '["process",'+getListObjectPart(entries,0,1)+
                        ', "'+entries[2]+'"]';
                break;
                
            case 'process3' :
                listed = '["process",'+getListObjectPart(entries,0,1)+
                        ', "'+entries[2]+'"],'+getListObjectPart(entries,3,4)+']';
                break;
                
            case 'action1' :
                listed = '["action", "'+entries[0]+'",'+getListObjectPart(entries,1,2)+']';
                break;
                
            case 'action2' :
                listed = 'action", "'+entries[0]+'",'+getListObjectPart(entries,1,2)+
                ','+getListObjectPart(entries,3,4)+']';
                break;
                
            case 'object1' :
                listed = 'object("'+getListObjectPart(entries,1,2)+')';
                break;

            default:
                alert('ERROR - not your fault - unrecognised type: '+type+' for '+JSON.stringify(entries));
                formal = type+'...'+JSON.stringify(entries);
        }
        return listed;
    }

    function getListObjectPart(entries,i,j) {
        if (entries[j] === '') {
            return '"' + entries[i] + '"';     // Just a plain object atom
        } else {
            return '["part", "'+entries[i]+'", "'+entries[j]+'"]';   // part(Object,Part)
        }
    }

};


AKT.widgets.node_template.display = function (widget) {

};


AKT.widgets.node_template.html = `
<div id="body_div" style="padding-left:10px;padding-right:10px;padding-top:0px;padding-bottom:5px;">

    <!-- ===========================================================-->

            <div style="height:100px;">

                <!-- cause options -->
                <div id="cause_options" style="float:left; margin-left:10px;">
                    <div><b>Node type:</b></div>
                    <input type="radio" id="cause_attval_option" name="cause_options" value="">
                    <label for="choice_option">an attribute of:</label><br>
                    <input type="radio" class="cause_option" id="cause_process_option" name="cause_options" value="process">
                    <label for="choice_option">a process</label><br>
                    <input type="radio" class="cause_option" id="cause_action_option" name="cause_options" value="action">
                    <label for="choice_option">an action</label><br>
                    <input type="radio" class="cause_option" id="cause_object_option" name="cause_options" value="object">
                    <label for="choice_option">an object</label><br>
                </div>

                <div id="cause_attval_options" style="float:left; margin-left:0px;">
                    <div><b>.</b></div>
                    <input type="radio" class="cause_attval_option" id="cause_attval_object_option" name="cause_attval_options" value="attval_object">
                    <label for="choice_option">an object</label><br>
                    <input type="radio" class="cause_attval_option" id="cause_attval_process_option" name="cause_attval_options" value="attval_process">
                    <label for="choice_option">a process</label><br>
                    <input type="radio" class="cause_attval_option" id="cause_attval_action_option" name="cause_attval_options" value="attval_action">
                    <label for="choice_option">an action</label><br>
                </div>


            <!-- Template zone -->
            <div id="templates_div" style="clear:both; margin-top:20px;">
                <div id="causes_cause" style="margin-bottom:20px;"></div>
            </div>


<!-- ------------------------------------------------------------------------------------ -->
    <div id="templates" style="display:none">

        <div class="template attval_object_template" name="attval_object1">
            <input class="input object object_input1"       list="objects"    placeholder="Object" /><input class="input part part_input1"           list="parts"      placeholder="Part (optional)" />
            <input class="input attribute attribute_input1" list="attributes" placeholder="Attribute" />
        </div>

        <div class="template attval_process_template" name="attval_process1">
            <input class="input process process_input2"     list="processes"  placeholder="Process" />
            <input class="input attribute attribute_input2" list="attributes" placeholder="Attribute" />
        </div>

        <div class="template attval_process_template" name="attval_process2">
            <input class="input object object_input3"       list="objects"    placeholder="Object" /><input class="input part part_input3"           list="parts"      placeholder="Part (optional)" />
            <input class="input process process_input3"     list="processes"  placeholder="Process" />
            <input class="input attribute attribute_input3" list="attributes" placeholder="Attribute" />
        </div>

        <div class="template attval_process_template" name="attval_process3">
            <input class="input object object_input4a"      list="objects"    placeholder="Object" /><input class="input part part_input4a"          list="parts"      placeholder="Part (optional)" />
            <input class="input process process_input4"     list="processes"  placeholder="Process" />
            <input class="input object object_input4b"      list="objects"    placeholder="Object" /><input class="input part part_input4b"          list="parts"      placeholder="Part (optional)" />
            <input class="input attribute attribute_input4" list="attributes" placeholder="Attribute" />
        </div>

        <div class="template attval_action_template" name="attval_action1">
            <input class="input action action_input5"       list="actions"    placeholder="Action" />
            <input class="input object object_input5"       list="objects"    placeholder="Object" /><input class="input part part_input5"           list="parts"      placeholder="Part (optional)" />
            <input class="input attribute attribute_input5" list="attributes" placeholder="Attribute" />
        </div>

        <div class="template attval_action_template" name="attval_action2">
            <input class="input action action_input6"       list="actions"    placeholder="Action" />
            <input class="input object object_input6a"      list="objects"    placeholder="Object" /><input class="input part part_input6a"          list="parts"      placeholder="Part (optional)" />
            <input class="input object object_input6b"      list="objects"    placeholder="Object" /><input class="input part part_input6b"          list="parts"      placeholder="Part (optional)" />
            <input class="input attribute attribute_input6" list="attributes" placeholder="Attribute" />
        </div>

        <div class="template process_template" name="process1">
            <input class="input process process_input2"     list="processes"  placeholder="Process" />
        </div>

        <div class="template process_template" name="process2">
            <input class="input object object_input3"       list="objects"    placeholder="Object" /><input class="input part part_input3"           list="parts"      placeholder="Part (optional)" />
            <input class="input process process_input3"     list="processes"  placeholder="Process" />
        </div>

        <div class="template process_template" name="process3">
            <input class="input object object_input4a"      list="objects"    placeholder="Object" /><input class="input part part_input4a"          list="parts"      placeholder="Part (optional)" />
            <input class="input process process_input4"     list="processes"  placeholder="Process" />
            <input class="input object object_input4b"      list="objects"    placeholder="Object" /><input class="input part part_input4b"          list="parts"      placeholder="Part (optional)" />
        </div>

        <div class="template action_template" name="action1">
            <input class="input action action_input5"       list="actions"    placeholder="Action" />
            <input class="input object object_input5"       list="objects"    placeholder="Object" /><input class="input part part_input5"           list="parts"      placeholder="Part (optional)" />
        </div>

        <div class="template action_template" name="action2">
            <input class="input action action_input6"       list="actions"    placeholder="Action" />
            <input class="input object object_input6a"      list="objects"    placeholder="Object" /><input class="input part part_input6a"          list="parts"      placeholder="Part (optional)" />
            <input class="input object object_input6b"      list="objects"    placeholder="Object" /><input class="input part part_input6b"          list="parts"      placeholder="Part (optional)" />
        </div>

        <div class="template object_template" name="object1">   
            <input class="input object object_input1"       list="objects"    placeholder="Object" /><input class="input part part_input1"           list="parts"      placeholder="Part (optional)" />
        </div>

    </div>   <!-- End of <div id="templates"> -->

</div>

`;



