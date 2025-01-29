class Panel {

    constructor(dialogId, shiftKey, size, options, calledFromPanelise) {
        if (!calledFromPanelise) {
            console.log('\n*** ATTENTION *** newPanel() not called from AKT.panelise()!  Widgette: ',options.widget_name);
        }
        console.log('new Panel() options: ',options);

        this._dialogId = dialogId;
        this._shiftKey = shiftKey;
        this._size = size;
        this._options = options;
        var self = this;

        AKT.state.panels_counter.total += 1;
        this._index = AKT.state.panels_counter;
        //var side = (this._index-1) % 2;    // 0 or 1
        var subname = options.widget_name;
        if (subname === 'hierarchies') {
            subname = options.tree_type+'_hierarchies';
        } else if (subname === 'hierarchy_details') {
            subname = options.tree_type+'_hierarchy_details';
        }

        if (subname.includes('_details')) {   // TODO: Fix this hack
            var side = 1;
            AKT.state.panels_counter.right += 1;
            var column_counter = AKT.state.panels_counter.right;
        } else {
            side = 0;
            AKT.state.panels_counter.left += 1;
            column_counter = AKT.state.panels_counter.left;
        }
        var offset = column_counter*10;  // both horizontal and vertical
        var left = side*600 + offset;
        var top = offset*2;

        var zindex = AKT.incrementZindex('Panel.js: constructor. dialogId:',panelId,'\nOptions:',options);

        //var settings = AKT.widgets[options.widget_name].settings;

/*
        if (!AKT.state.panel_counter[subname]) {
            AKT.state.panel_counter[subname] = 1;
            var panelId = subname + '_1';

            // Use this one if attempt (below) to autofit the panel's <div> around its elements fails.
            //$('#workspace').append('<div id="'+panelId+'" class="panel dialog" style="position:absolute;display:block;left:'+size.left+';top:'+size.top+';width:'+settings.width+';height:'+settings.height+';"></div>');

            var panelDiv = $('<div id="'+panelId+'" class="panel dialog" style="z-index:'+zindex+'; position:absolute; display:block; left:'+left+'px; top:'+top+'px;"></div>');
            $(panelDiv).resizable();
            $('#workspace').append(panelDiv);
            //$('#'+panelId)[dialogId]({visible:true, kbId:AKT.state.current_kb});


            // This is where widget instance is actually created.
            var widgetInstance = $('#'+panelId)[dialogId](options);
            var widge = $('#'+panelId)[dialogId]('instance');
            console.log(112,widgetInstance);
            console.log(114,$(widgetInstance));
            console.log(115,widge);

            $('#'+panelId).on('click',function() {
                var zindex = AKT.incrementZindex("menu_handlers.js: AKT.menuHandler.menu_kb_statements()");
                $(this).css('z-index',zindex);
            });
            $('#'+panelId).on('drag',function() {
                var zindex = AKT.incrementZindex("menu_handlers.js: AKT.menuHandler.menu_kb_statements()");
                $(this).css('z-index',zindex);
            });
            $('#'+panelId).on('start',function() {
                var zindex = AKT.incrementZindex("menu_handlers.js: AKT.menuHandler.menu_kb_statements()");
                $(this).css('z-index',zindex);
            });

        } else {
            AKT.state.panel_counter[subname] += 1;
            panelId = subname + '_' + AKT.state.panel_counter[subname];
            console.debug('panelId rest: ',panelId);
            //$('#workspace').append('<div id="'+panelId+'" class="panel dialog" style="position:absolute;display:block;left:75px;top:70px;width:580px;height:580px;"></div>');

            // Use this one if attempt (below) to autofit the panel's <div> around its elements fails.
            //$('#workspace').append('<div id="'+panelId+'" class="panel dialog" style="position:absolute;display:block;left:'+size.left+';top:'+size.top+';width:'+settings.width+';height:'+settings.height+';"></div>');

            var panelDiv = $('<div id="'+panelId+'" class="panel dialog" style="z-index:zindex; ; position:absolute; display:block; left:'+left+'px;top:'+top+'px;"></div>');
            $('#workspace').append(panelDiv);
            $('#'+panelId)[dialogId](options);
            $('#'+panelId).on('click',function() {
                var zindex = AKT.incrementZindex("menu_handlers.js: AKT.menuHandler.menu_kb_statements()");
                $(this).css('z-index',zindex);
            });
        }
*/

        if (!AKT.state.panel_counter[subname]) {
            AKT.state.panel_counter[subname] = 0;
        }
        AKT.state.panel_counter[subname] += 1;
        var panelId = subname + '_' + AKT.state.panel_counter[subname];
        AKT.state.panel_last_of_type[subname] = this;
        var panelIdDisplay = panelId;
        if (panelId.includes('_details')) {   // TODO: Fix this hack
            panelIdDisplay = panelId + ' ('+options.kbId+':'+options.item_id+')';
        } else {
            panelIdDisplay = panelId + ' ('+options.kbId+')';
        }
        // Use this one if attempt (below) to autofit the panel's <div> around its elements fails.
        //$('#workspace').append('<div id="'+panelId+'" class="panel dialog" style="position:absolute;display:block;left:'+size.left+';top:'+size.top+';width:'+settings.width+';height:'+settings.height+';"></div>');

        var panelDiv = $('<div id="'+panelId+'" class="panel dialog" style="z-index:'+zindex+'; position:absolute; display:block; left:'+left+'px; top:'+top+'px;"></div>');
        $(panelDiv).resizable();

        // So, what is happening here is that sometimes we need to somehow constrain the width of the panel.
        // The trigger example is for the statements widgette, which has an AKT.myListbox which we want to
        // expand width-wise when the user re-sizes the panel: we ise w3.css class="res" for this.   Without
        // any constraint, it makes the myListbox table very wide (>2000px).
        // We could pass in the optional initial width when we create the panel, but then we would have to do
        // that every time we create (for example) a statements panel.   So instead we have this hack...
        if (options.widget_name === 'statements') {
            $(panelDiv).css({width:'600px'});  
            $(panelDiv).resizable('option', 'handles', 'e,s');
            $(panelDiv).resizable('option', 'minHeight', 300);
        } else if (options.widget_name === 'sources') {
            $(panelDiv).css('width','600px');  
            $(panelDiv).resizable('option', 'handles', 'e,s');
            $(panelDiv).resizable('option', 'minHeight', 300);
        } else if (options.widget_name === 'metadata') {
            $(panelDiv).css('width','600px');  
            $(panelDiv).resizable('option', 'handles', 'e');
        }
        $('#workspace').append(panelDiv);

        // Make titlebar, including panel Close button.
        var titlebarDiv = $('<div class="w3-row titlebar" style="height:21px;padding:2px;border-bottom:solid 1px black;font-size:12px;"></div>');
        var closeButtonDiv = ('<div class="w3-right dialog_close_button" style="margin-right:5px;">X</div>');

        var panelLabel = panelId;
        var titleDiv = $('<div class="w3-rest" style="text-align:center;">'+panelIdDisplay+'</div>');
        $(titlebarDiv).append(closeButtonDiv).append(titleDiv);
        $(panelDiv).append(titlebarDiv);

/* Why doesn't this work?   Doesn't respond to mouse click
        $(widgetElement).append(titlebarDiv);
        $(closeButtonDiv).on('click', function () {
            console.log('click');
            $(widgetElement).css({display:"none"});
        });
*/

        //$('#'+panelId)[dialogId]({visible:true, kbId:AKT.state.current_kb});


        // This is where widget instance is actually created.
        var widgetInstance = $('#'+panelId)[dialogId](options);
        var widge = $('#'+panelId)[dialogId]('instance');
        console.log(112,widgetInstance);
        console.log(114,$(widgetInstance));
        console.log(115,widge);

        $('#'+panelId).on('click',function() {
        event.stopPropagation();
        var zindex = AKT.incrementZindex('Panel.js: click. dialogId:',panelId,'\nOptions:',options);
            $(this).css('z-index',zindex);
        });

        $('#'+panelId).on('mousedown',function() {
        event.stopPropagation();
        var zindex = AKT.incrementZindex('Panel.js: start. dialogId:',panelId,'\nOptions:',options);
            $(this).css('z-index',zindex);
        });

        $('buttonxxx').on('click', function (event) {
            console.log('EVENT: button-click ', $(panelDiv).attr('id'), event.target.classList[0]);
            var step1 = {
                eventType:'highlight',
                selector:'#'+$(panelDiv).attr('id')+' .'+event.target.classList[0]
            };
            var step2 = {
                eventType:'click',
                selector:'#'+$(panelDiv).attr('id')+' .'+event.target.classList[0]
            };
            AKT.eventRecord.push(step1);
            AKT.eventRecord.push(step2);
        });

        // Disabled while trying to sort out problem with editing table in diagram dialog
        $('trXXXX').on('click', function (event) {
            console.log('EVENT: tr-click ', $(panelDiv).attr('id'), event.target.classList[0],event);
            var step1 = {
                eventType:'highlight',
                selector:'#'+$(panelDiv).attr('id')+' .'+event.target.classList[0]
            };
            var step2 = {
                eventType:'click',
                selector:'#'+$(panelDiv).attr('id')+' .'+event.target.classList[0]
            };
            AKT.eventRecord.push(step1);
            AKT.eventRecord.push(step2);
        });

        $('selectXXX').on('change', function (event) {
            console.log('EVENT: select-change ', $(panelDiv).attr('id'), event.target.classList[0]);
            var step1 = {
                eventType:'highlight',
                selector:'#'+$(panelDiv).attr('id')+' .'+event.target.classList[0]
            };
            var step2 = {
                eventType:'click',
                selector:'#'+$(panelDiv).attr('id')+' .'+event.target.classList[0]
            };
            AKT.eventRecord.push(step1);
            AKT.eventRecord.push(step2);
        });

        // --------------------------------------------------------------------------
        // Dec 2022 Trying to revive doing event-recording in Panelise() !

        $('button:not(.inwidget_recording)').on('click', function (event) {
            var panelId = $(panelDiv).attr('id');
            var elementClass = event.target.classList[0];
            console.log('EVENT: button-click ', panelId, elementClass);

            AKT.recordEvent({
                element:widge.element,
                finds:['.'+elementClass],
                event:'click',
                message:'Clicked on button with class '+elementClass+' in statements.js.'
            });
        });


        $('select').on('change', function (event) {
            var panelId = $(panelDiv).attr('id');
            var elementClass = event.target.classList[0];
            var selectedOption = $(widge.element).find('.'+elementClass).find(":selected").val();
            console.log('EVENT: select-change ', panelId, elementClass, selectedOption);

            AKT.recordEvent({
                element:widge.element,
                finds:['.'+elementClass],   
                event:'select',
                value: selectedOption,
                message:'Clicked on option '+elementClass+' in statements.js.'
            });
        });


        $('input').on('change', function (event) {
            var panelId = $(panelDiv).attr('id');
            var elementClass = event.target.classList[0];
            var selectedOption = $(widge.element).find('.'+elementClass).val();
            var checked = $(widge.element).find('.'+elementClass).is(':checked');
            console.log('EVENT: input-change ', panelId, elementClass, selectedOption, checked);

            if ($("#isAgeSelected").is(':checked')) {
                var checkedxxx = true;
            } else {
                checkedxxx = false;
            }

            AKT.recordEvent({
                element:widge.element,
                finds:['.'+elementClass],   
                event:'checkbox',
                value: checked,
                message:'Clicked on the option '+elementClass+' in '+panelId+'.'
            });
        });


        this._id = panelId;
    }
}

        


