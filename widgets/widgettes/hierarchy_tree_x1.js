AKT.widgets.hierarchy_tree = {};


AKT.widgets.hierarchy_tree.setup = function (widget) {
        var widgetSettings = $('<div></div>');
        $(widget.element).append(widgetSettings);

        var kbSelectElement = AKT.makeReprocessSelector(widget.element, widget.widgetName,
            'Knowledge base', AKT.getKbIds(), AKT.state.current_kb, 'kbId');
        $(widgetSettings).append(kbSelectElement);

};


AKT.widgets.hierarchy_tree.display = function (widget) {
    console.log('hierarchy_tree options:',widget.options);
    var kbId = widget.options.kbId;
    var KB1 = AKT.KBs[kbId];

    var widgetContent = $(widget.element).find('.content');

    var treeType = widget.options.tree_type;
    if (treeType === 'object') {
        var hierarchies = KB1._objectHierarchies;
    } else {
        var hierarchies = KB1._topicHierarchies;
    }
    console.log(hierarchies);

    $.jstree.defaults.core.themes.icons = false;
    var jsTrees = {};
    var divHierarchies = $(widgetContent).find('.divHierarchies');
    $.each(hierarchies, function(id,hierarchy) {
        var divLabel = $('<div class="divHierarchyLabel" style="font-weight:bold;font-size:13px;height:14px;margin-top:3px;">'+id+'</div>');
        var divHierarchy = $('<div id="hierarchy_'+id+'" class="divHierarchy" style="display:none;margin-bottom:3px;"></div>');
        var UlTree = hierarchies[id].makeUlTree();
        $(divHierarchy).append(UlTree);
        $(divHierarchies).append(divLabel);
        $(divHierarchies).append(divHierarchy);

        jsTrees[id] = $('hierarchy_'+id).jstree();
        $(jsTrees[id]).on('changed.jstree', function (e, data) {
            var i, j, r = [];
            for(i = 0, j = data.selected.length; i < j; i++) {
              r.push(data.instance.get_node(data.selected[i]).text);
            }
            //$('#event_result').html('Selected: ' + r.join(', '));
            console.log(data,r);
        });
    });
    console.log(jsTrees);
    console.log(jsTrees['crop']);
// 5 Jan 2022 This works!  Revert to this if code below between ---- doesn't work.
/*
    $.jstree.defaults.core.themes.icons = false;
    $(widgetContent).find('.divHierarchy')
      .on('changed.jstree', function (e, data) {
        var i, j, r = [];
        for(i = 0, j = data.selected.length; i < j; i++) {
          r.push(data.instance.get_node(data.selected[i]).text);
        }
        //$('#event_result').html('Selected: ' + r.join(', '));
        console.debug('=== ',data,r);
      })
      .jstree();
*/
// ---------------------------------------------------------------------
/*
    $.jstree.defaults.core.themes.icons = false;
    var jsTrees = $(widgetContent).find('.divHierarchy').jstree();
    $(jsTrees).on('changed.jstree', function (e, data) {
        var i, j, r = [];
        for(i = 0, j = data.selected.length; i < j; i++) {
          r.push(data.instance.get_node(data.selected[i]).text);
        }
        //$('#event_result').html('Selected: ' + r.join(', '));
        console.log(data,r);
    });

    console.log(jsTrees);
    console.log(jsTrees[0]);
    for (var k in jsTrees[0]) {
        if (typeof k === 'object') {
            console.log(k);
        }
    }
//	$(jsTrees[0]).select_all();
*/
// ---------------------------------------------------------------------
/*
	var instance = $(widgetContent).find('.divHierarchy').jstree(true);
    console.log(instance);
	instance.deselect_all();
	instance.select_node('j1_3');

// Failed to be able to work with jsTrees array auto-generated from the .divHierarchy class.
// So now trying to build up n explicit trees, where n is the number of hierarachies.


*/
    $('.level1').css({"font-weight":"normal", color:"#700000", "font-size":"12px", "margin-top":"0px", "line-height":"12px","min-height":"12px;"});
    $('.level2').css({"font-weight":"normal", color:"black", "font-size":"12px", "margin-top":"0px", "line-height":"12px","min-height":"12px;"});
    $('.level3').css({"font-weight":"normal", "font-size":"12px", "margin-top":"0px", "min-height":"12px;"});
    $('.level4').css({"font-weight":"normal"});
    $('.level5').css({"font-weight":"normal"});

    $(widgetContent).find('.divHierarchyLabel').on('click', function(event) {
        event.stopPropagation();
        if ($(this).next().css('display') === 'none') {
            $(this).next().css('display','block');
        } else {
            $(this).next().css('display','none');
        }
    });

    $(widgetContent).find('.button_details').on('click', function (event) {    // The Details button
        console.debug('BUTTON: Clicked on sources Details button');

        event.stopPropagation();
        var kbId = AKT.state.current_kb;
        var element = $(widgetContent).find('.jstree-clicked');
        var itemText = element[element.length-1].lastChild.data;
        console.log('itemText: ',itemText);

        var type = widget.options.tree_type;
        if (type === 'object') {
            var panel = new Panel('dialog_Generic', 
                event.shiftKey, 
                {left:'580px',top:'20px',width:'350px',height:'450px'}, 
                {kbId:AKT.state.current_kb, widget_name:'formal_term_details', term:itemText});
        } else if (type === 'topic') {
            var panel = new Panel('dialog_Generic', 
                event.shiftKey, 
                {left:'580px',top:'20px',width:'350px',height:'450px'}, 
                {kbId:AKT.state.current_kb, widget_name:'topic_details', topic:itemText});
        }
    });

};



AKT.widgets.hierarchy_tree.html = `
<div class="content" style="border:none;padding:15px;">

    <fieldset style="float:left;">
        <legend style="font-size:13px;"> Hierarchies </legend>
        <div class="divHierarchies" style="float:left;margin-top:0px;width:200px;max-height:350px;overflow-y:overlay;"></div>
    </fieldset>

    <fieldset style="float:right; width:80px; margin-right:20px;">
        <button class="button_new" style="width:70px; margin:5px;">New</button>
        <button class="button_delete" style="width:70px; margin:5px;">Delete</button>
        <button class="button_detach" style="width:70px; margin:5px;">Detach</button>
        <button class="button_details" style="width:70px; margin:5px;">Details</button>
        <button class="button_save_as_new_kb" style="width:70px; margin:5px;">Save as new KB</button>
        <button class="button_show_statements" style="width:70px; margin:5px;">Show statements</button>
        <button class="button_memo" style="width:70px; margin:5px;">Memo</button>
    </fieldset>

    <div style="clear:both;"></div>
</div>     <!-- End of content div -->
`;



