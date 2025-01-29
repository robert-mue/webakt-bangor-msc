AKT.widgets.hierarchy_tree = {};


AKT.widgets.hierarchy_tree.setup = function (widget) {
        var widgetSettings = $('<div></div>');
        $(widget.element).append(widgetSettings);

        var kbSelectElement = AKT.makeReprocessSelector(widget.element, widget.widgetName,
            'Knowledge base', AKT.getKbIds(), AKT.state.current_kb, 'kbId');
        $(widgetSettings).append(kbSelectElement);

};


AKT.widgets.hierarchy_tree.display = function (widget) {
    var kbId = widget.options.kbId;
    var KB1 = AKT.KBs[kbId];

    var widgetContent = $(widget.element).find('.content');

    var treeType = widget.options.tree_type;

    //var UlTree = KB1.makeUlTree(treeType);
    //$(widgetContent).find('.tree').append(UlTree);
    var hierarchiesDiv = $(widgetContent).find('.tree');
    console.log(hierarchiesDiv);
    var hierarchies = KB1._objectHierarchies;
    console.log(hierarchies);
    $.each(hierarchies, function(id,hierarchy) {
        console.log(id,hierarchy);
        var hierarchyDiv = $('<div class="hierarchyDiv"></div>');
        $(hierarchyDiv).append('<div>'+id+'</div>');
        var UlTree = hierarchy.makeUlTree();
        $(hierarchyDiv).append(UlTree);
        //$(widgetContent).find('.tree').append(UlTree);
        $(widgetContent).append(hierarchyDiv);
    });

    $.jstree.defaults.core.themes.icons = false;
    $(widgetContent).find('.tree')
      .on('changed.jstree', function (e, data) {
        var i, j, r = [];
        for(i = 0, j = data.selected.length; i < j; i++) {
          r.push(data.instance.get_node(data.selected[i]).text);
        }
        //$('#event_result').html('Selected: ' + r.join(', '));
        console.debug(data,r);
      })
      .jstree();


    $('.level1').css({"font-weight":"normal", color:"#700000", "font-size":"12px", "margin-top":"0px", "line-height":"12px","min-height":"12px;"});
    $('.level2').css({"font-weight":"normal", color:"black", "font-size":"12px", "margin-top":"0px", "line-height":"12px","min-height":"12px;"});
    $('.level3').css({"font-weight":"normal", "font-size":"12px", "margin-top":"0px", "min-height":"12px;"});
    $('.level4').css({"font-weight":"normal"});
    $('.level5').css({"font-weight":"normal"});

    $(widgetContent).find('.button_details').on('click', function (event) {    // The Details button
        console.debug('BUTTON: Clicked on sources Details button');

        event.stopPropagation();
        var kbId = AKT.state.current_kb;
        var element = $(widgetContent).find('.jstree-clicked');
        var itemText = element[0].lastChild.data;
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
    <div class="tree" style="float:left;margin-top:15px;width:200px;height:350px;overflow-y:overlay;"></div>
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



