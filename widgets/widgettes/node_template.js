AKT.widgets.node_template = {};


AKT.widgets.node_template.setup = function (widget) {

    var widgetContent = $(widget.element).find('.content');

    if (widget.options.show_titlebar) {
        var widgetTitlebar = $(
            '<div class="title-bar">'+
                '<div>node_template</div>'+
                '<input type="button" value="X" class="dialog_close_button"/>'+
            '</div>');
        $(widget.element).append(widgetTitlebar);
        $('.dialog_close_button').on('click', function () {
            var id = $(this).parent().parent()[0].id;
            $('#'+id).css({display:"none"});
        });
    }

    var widgetSettings = $('<div></div>');
    $(widget.element).append(widgetSettings);

    //var kbSelectElement = AKT.makeReprocessSelector(widget.element, widget.widgetName,
    //    'Knowledge base', AKT.getKbIds(), AKT.state.current_kb, 'kbId');
    //$(widgetSettings).append(kbSelectElement);

    //var widgetContent = $(baseHtml());
    //$(widget.element).append(widgetContent);

    $(widget.element).css({display:'block'});
    $(widget.element).draggable();

    var kbId = widget.options.kbId;
    var kb = AKT.KBs[kbId];

    var widgetContent = $(widget.element).find('.content');

    $(widget.element).find('.attval_options > input').attr('disabled',true);
    $(widget.element).find('.attval_options > label').css({color:'#808080'});
    $(widget.element).find('.line > ').css({'margin-bottom':'3px'});

// ===================================================================================
// Here we handle the radio buttons, for the different types of node
// They are in two groups.
// The first group is for the 4 top-level categories (attval, object, process or action).
// If the user choses attval, then the second group is enabled, for attval, process or action.

    $( ".nodetype_options" ).on('change',function(event) {
        var type = event.target.value;
        $('.template').css({display:'none'});

        console.log(type);

        // attval radio button selected
        if (type === 'attval') {
            $(widget.element).find('.attval_options > input').attr('disabled',false);
            $(widget.element).find('.attval_options > label').css({color:'black'});
            $('.attval').css({display:"block"});

        // object, process or action radio button selected
        } else {
            $(widget.element).find('.attval_options > input').attr('disabled',true);
            $(widget.element).find('.attval_options > label').css({color:'#808080'});
            $('.template').css({display:'none'});
            var templateClass = '.'+type+'_template';
            $(templateClass).css({display:'block'});
        }
    });


    // One of the attval radiobuttons (object, process or action) is selected.
    $( ".attval_options" ).on('change',function(event) {
        var attvalType = event.target.value;
        $('.template').css({display:'none'});
        var templateClass = '.'+attvalType+'_template';
        $(templateClass).css({display:'block'});
    });


    // -------------------------------------------------------------------------
    // BUTTONS
    $('#button_node_type_dialog_ok').on('click', function() {

        var nodeType = $(widget.element).find("input[name='node_types']:checked").val();
        var attvalType = $(widget.element).find("input[name='attval_types']:checked").val();

        if (nodeType === 'attval') {
            var currentTemplateClass = '.'+attvalType+'_template';
        } else {
            var currentTemplateClass = '.'+nodeType+'_template';
        }

        console.log(111,nodeType,attvalType,currentTemplateClass);

        // To save duplication, we try to pick up all possible fields here,
        // even if they are not present in some of the dialogs.
        var object1 = $(widget.element).find(currentTemplateClass).find('.object1').val();
        var part1 = $(widget.element).find(currentTemplateClass).find('.part1').val();
        var object2 = $(widget.element).find(currentTemplateClass).find('.object2').val();
        var part2 = $(widget.element).find(currentTemplateClass).find('.part2').val();
        var process = $(widget.element).find(currentTemplateClass).find('.process').val();
        var action = $(widget.element).find(currentTemplateClass).find('.action').val();
        var attribute = $(widget.element).find(currentTemplateClass).find('.attribute').val();

        var fullObject1 = getFullObject(object1,part1);
        var fullObject2 = getFullObject(object2,part2);

        console.log('object1,part1,object2,part2,process,action,attribute,fullObject1,fullObject2:\n',
            object1,part1,object2,part2,process,action,attribute,fullObject1,fullObject2);

        // attribute-object
        if (nodeType === 'attval') {
            if (attvalType === 'attval_object') {
                var json = ['att_value',fullObject1,attribute];

            // attribute-process
            } else if (attvalType === 'attval_process') {
                if (fullObject1) {
                    if (fullObject2) {
                        var json = ['att_value',['process',fullObject1,process,fullObject2],attribute];
                    } else {
                        json = ['att_value',['process',fullObject1,process],attribute];
                    }
                } else {
                    json = ['att_value',['process',process],attribute];
                }

            // attribute-action
            } else if (attvalType === 'attval_action') {
                if (fullObject1) {
                    if (fullObject2) {
                        var json = ['att_value',['action',action,fullObject1,fullObject2],attribute];
                    } else {
                        json = ['att_value',['action',action,fullObject1],attribute];
                    }
                } else {
                    json = ['att_value',['action',action],attribute];
                }
            }

        // object
        } else if (nodeType === 'object') {
            var json = fullObject1;

        // process
        } else if (nodeType === 'process') {
            if (fullObject1) {
                if (fullObject2) {
                    var json = ['process',fullObject1,process,fullObject2];
                } else {
                    json = ['process',fullObject1,process];
                }
            } else {
                json = ['process',process];
            }

        // action
        } else if (nodeType === 'action') {

            if (fullObject1) {
                if (fullObject2) {
                    var json = ['action',action,fullObject1,fullObject2];
                } else {
                    json = ['action',action,fullObject1];
                }
            } else {
                json = ['action',action];
            }
        }

        console.log(JSON.stringify(json));
        var jointNode = AKT.state.currentElement;
        jointNode.json = json;

        jointNode.label = jointNode.makeNodeName();
        jointNode.myLabel = jointNode.makeNodeLabelWrapped();
        jointNode.attr('label/text',jointNode.myLabel.wrappedString)
        jointNode.attr('body/fill','white')
        jointNode.makeNodeFormal();
        jointNode.status = 'named';
        console.log('***',jointNode);

        $('.template').find('.input').val('');

        function getFullObject(object,part) {
            if (part === '') {
                return object;
            } else {
                return ['part',object,part];
            }
        }
    });

// ===========================================================================================
    // Display attval sub-options
    $( "#cause_attval_option" ).on('change',function(event) {
        $('#cause_attval_options > input').removeAttr('disabled');
        $('#cause_attval_options > label').css({color:'black'});
    });

    $( "#effect_attval_option" ).on('change',function(event) {
        $('#effect_attval_options > input').removeAttr('disabled');
        $('#effect_attval_options > label').css({color:'black'});
    });

    // causes: cause
    $( ".cause_option" ).on('change',function(event) {
        if (event.target.value !== 'attval') {
            $('#cause_attval_options > input').removeAttr('selected');
            $('#cause_attval_options > input').attr('disabled','true');
            $('#cause_attval_options > label').css({color:'#808080'});
            $('#causes_cause').empty();
            var templateClass = event.target.value+'_template';
            $('.'+templateClass).clone().appendTo('#causes_cause');
            $('#causes_cause').find('input').css({display:'block'});
            createTemplateEventHandlers();
        }
    });

    $( ".cause_attval_option" ).on('change',function(event) {
        if (event.target.value) {
            $('#causes_cause').empty();
            var templateClass = event.target.value+'_template';
            $('.'+templateClass).clone().appendTo('#causes_cause');
            $('#causes_cause').find('input').css({display:'block'});
            createTemplateEventHandlers();
        }
    });

    // causes: effect
    $( ".effect_option" ).on('change',function(event) {
        if (event.target.value !== 'attval') {
            $('#effect_attval_options > input').removeAttr('selected');
            $('#effect_attval_options > input').attr('disabled','true');
            $('#effect_attval_options > label').css({color:'#808080'});
            $('#causes_effect').empty();
            var templateClass = event.target.value+'_template';
            $('.'+templateClass).clone().appendTo('#causes_effect');
            $('#causes_effect').find('input').css({display:'block'});
            createTemplateEventHandlers();
        }
    });

    $( ".effect_attval_option" ).on('change',function(event) {
        if (event.target.value) {
            $('#causes_effect').empty();
            var templateClass = event.target.value+'_template';
            $('.'+templateClass).clone().appendTo('#causes_effect');
            $('#causes_effect').find('input').css({display:'block'});
            createTemplateEventHandlers();
        }
    });


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
            for (var i=0; i<AKT.state.memory[type].length; i++) {
                if (AKT.state.memory[type][i].startsWith(inputVal)) {
                    options += '<option value="' + AKT.state.memory[type][i] + '" />';
                }
            }
            //document.getElementById(type).innerHTML = options;
        }
    }

// --------------------------------------------------- End of event handlers



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

    console.log('display...',widget.options);
};



AKT.widgets.node_template.html = `
<!--div id="body_div" style="padding-left:10px;padding-right:10px;padding-top:0px;padding-bottom:5px;"-->
<div class="content" style="border:none;padding:5px;">

    <!-- ===========================================================-->

    <div style="float:left;width:350px;height:300px;">

        <!-- nodetype options -->
        <div class="nodetype_options" style="float:left; margin-left:10px;">
            <div><b>Node type:</b></div>
            <input type="radio" class="attval_option" name="node_types" value="attval">
            <label>an attribute of:</label><br>
            <input type="radio" class="object_option" name="node_types" value="object">
            <label>an object</label><br>
            <input type="radio" class="process_option" name="node_types" value="process">
            <label>a process</label><br>
            <input type="radio" class="action_option" name="node_types" value="action">
            <label>an action</label><br>
        </div>

        <div class="attval_options" style="float:left; margin-left:0px;">
            <div><b>.</b></div>
            <input type="radio" class="attval_option attval_object_option" name="attval_types" value="attval_object">
            <label>an object</label><br>
            <input type="radio" class="attval_option attval_process_option" name="attval_types" value="attval_process">
            <label>a process</label><br>
            <input type="radio" class="attval_option attval_action_option" name="attval_types" value="attval_action">
            <label>an action</label><br>
        </div>

        <div style="clear:both;"></div>

<!-- ------------------------------------------------------------------------------------ -->
        <div class="templates">

            <div class="template attval_object_template" style="display:none;" name="attval_object">
                <div class="line">
                    <div style="float:left; width:60px;">Object</div>
                    <input class="object1"   list="objects"    style="float:left;"/>
                    <input class="part1"     list="parts"      placeholder="Part (optional)" style="float:left;"/>
                </div>
                <div style="clear:both"></div>
                <div class="line"> 
                    <div style="float:left; width:60px;">Attribute</div>
                    <input class="attribute" list="attributes" />
                </div>
            </div>

            <div class="template attval_process_template" style="display:none;" name="attval_process">
                <div class="line"> 
                    <div style="float:left; width:60px;">Object1</div>
                    <input class="object1"   list="objects"    placeholder="Optional"  style="float:left;"/>
                    <input class="part1"     list="parts"      placeholder="Part (optional)"  style="float:left;"/>
                </div>
                <div style="clear:both"></div>
                <div class="line"> 
                    <div style="float:left; width:60px;">Process</div>
                    <input class="process"   list="processes"  style="float:left;"/>
                </div>
                <div style="clear:both"></div>
                <div class="line"> 
                    <div style="float:left; width:60px;">Object2</div>
                    <input class="object2"   list="objects"    placeholder="Optional"  style="float:left;"/>
                    <input class="part2"     list="parts"      placeholder="Part (optional)"  style="float:left;"/>
                </div>
                <div style="clear:both"></div>
                <div class="line"> 
                    <div style="float:left; width:60px;">Attribute</div>
                    <input class="attribute" list="attributes" style="float:left;"/>
                </div>
            </div>

            <div class="template attval_action_template" style="display:none;" name="attval_action">
                <div class="line"> 
                    <div style="float:left; width:60px;">Action</div>
                    <input class="action"    list="actions" style="float:left;"/>
                </div>
                <div style="clear:both"></div>
                <div class="line"> 
                    <div style="float:left; width:60px;">Object1</div>
                    <input class="object1"   list="objects"    placeholder="Optional"  style="float:left;"/>
                    <input class="part1"     list="parts"      placeholder="Part (optional)"  style="float:left;"/>
                </div>
                <div style="clear:both"></div>
                <div class="line"> 
                    <div style="float:left; width:60px;">Object2</div>
                    <input class="object2"      list="objects"    placeholder="Optional"  style="float:left;"/>
                    <input class="part2"          list="parts"      placeholder="Part (optional)"  style="float:left;"/>
                </div>
                <div style="clear:both"></div>
                <div class="line"> 
                    <div style="float:left; width:60px;">Attribute</div>
                    <input class="attribute"  list="attributes" style="float:left;"/>
                </div>
            </div>

            <div class="template object_template" style="display:none;" name="object">   
                <div class="line"> 
                    <div style="float:left; width:60px;">Object</div>
                    <input class="object1"   list="objects"    style="float:left;"/>
                    <input class="part1"     list="parts"      placeholder="Part (optional)" style="float:left;" />
                </div>
                <div style="clear:both"></div>
            </div>

            <div class="template process_template" style="display:none;" name="process">
                <div class="line"> 
                    <div style="float:left; width:60px;">Object1</div>
                    <input class="object1"   list="objects"    placeholder="Optional"  style="float:left;"/>
                    <input class="part1"     list="parts"      placeholder="Part (optional)"  style="float:left;"/>
                </div>
                <div style="clear:both"></div>
                <div class="line"> 
                    <div style="float:left; width:60px;">Process</div>
                    <input class="process"   list="processes" />
                </div>
                <div style="clear:both"></div>
                <div class="line"> 
                    <div style="float:left; width:60px;">Object2</div>
                    <input class="object2"   list="objects"    placeholder="Optional"  style="float:left;"/>
                    <input class="part2"     list="parts"      placeholder="Part (optional)"  style="float:left;"/>
                </div>
            </div>

            <div class="template action_template" style="display:none;" name="action">
                <div class="line"> 
                    <div style="float:left; width:60px;">Action</div>
                    <input class="action"    list="actions"  style="float:left;"/>
                </div>
                <div style="clear:both"></div>
                <div class="line"> 
                    <div style="float:left; width:60px;">Object1</div>
                    <input class="object1"   list="objects"    placeholder="Optional"  style="float:left;"/>
                    <input class="part1"     list="parts"      placeholder="Part (optional)"  style="float:left;"/>
                </div>
                <div style="clear:both"></div>
                <div class="line"> 
                    <div style="float:left; width:60px;">Object2</div>
                    <input class="object2"   list="objects"    placeholder="Optional"  style="float:left;"/>
                    <input class="part2"     list="parts"      placeholder="Part (optional)"  style="float:left;"/>
                </div>
            </div>

        </div>   <!-- End of <div id="templates"> -->
    </div> 

    <div class="word_list" style="float:left; width:150px; height:300px; border:solid 1px #606060; background:white;">
    </div>

    <div style="clear:both;"></div>

    <input  id="button_node_type_dialog_ok" type="button" class="link_causes1way_dialog_ok" style="float:right;" value="OK">
    <input  id="button_node_type_dialog_cancel" type="button" class="link_causes1way_dialog_cancel" style="float:right;" value="Cancel">

</div>
`;

