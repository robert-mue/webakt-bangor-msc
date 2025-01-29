AKT.widgets.formal_term_details = {};


AKT.widgets.formal_term_details.setup = function (widget) {

    var kbId = widget.options.kbId;
    var kb = AKT.KBs[kbId];

    console.log('--- +++ object',widget.options);

    // TODO: fix this inconsistency; and add in type checking, error message etc
    if (widget.options.formal_term) { // The formal term object
        var formalTerm = widget.options.formal_term; 
    } else {   // The formal term id
        var formalTerm = kb._formalTerms[widget.options.term]; 
    }

    // ----------------------------------------------------------------------
    // Usr interaction event handlers

    $(widget.element).find('.button_statements').on('click', function() {
        event.stopPropagation();
        console.log('Clicked on Statements button');
        var kbId = widget.options.kbId;
        var kb = AKT.kbs[kbId];

        var eventShiftKey = event ? event.shiftKey : null;

        var panel = AKT.panelise({
            widget_name:'statements',
            position:{left:'200px',top:'20px'},
            size:{width:'550px',height:'540px'},
            shift_key: event.shiftKey,
            options:{kbId:kbId, filters:{formal_term:true,formal_term_value:formalTerm._id}}
        });

        AKT.recordEvent({
            file:'formal_term_details.js',
            function:'AKT.widgets.formal_term_details.setup()',
            element:widget.element,
            finds:['.button_statements'],
            event:'click',
            value: formalTerm._id,
            message:'Clicked on the Statements button in the formal_term_details panel.'
        });

    });


    $(widget.element).find('.button_in_hierarchy').on('click', function() {
        event.stopPropagation();
        console.debug('Clicked on In hierarchy button');
        var kbId = widget.options.kbId;
        var kb = AKT.KBs[kbId];

        var nodeId = widget.options.item_id;
        var hierarchies = kb._objectHierarchies;

        var hierarchyId = null;
        $.each(hierarchies, function(id,hierarchy) {
            var hier = hierarchies[id];
            var nodes = hier.getAllDescendants(hier._root);
            if (nodes.includes(nodeId)) {
                console.log('yes!',nodeId,'is in',hier._id);
                hierarchyId = hier._id;
            } else {
                console.log('no!',nodeId,'is not in',hier._id);
            }
        });

        hierarchy = hierarchies[hierarchyId];
        console.log('hierarchy:',hierarchy);

        var eventShiftKey = event ? event.shiftKey : null;

        var panel = AKT.panelise({
            widget_name:'hierarchy_details',
            position:{left:'20px',top:'20px'},
            size:{width:'450px',height:'540px'},
            shift_key: event.shiftKey,
            options:{kbId:kbId, tree_type:'object', hierarchy:hierarchy, item_id:formalTerm._id}
        });

        AKT.recordEvent({
            file:'formal_term_details.js',
            function:'AKT.widgets.formal_term_details.setup()',
            element:widget.element,
            finds:['.button_in_hierarchy'],
            event:'click',
            value: formalTerm._id,
            message:'Clicked on the In Hierarchy button in the formal_term_details panel.'
        });

    });

    // Doesn't actually save!   TODO: Fix this.
    $(widget.element).find('.button_save').on('click', function() {
        event.stopPropagation();
        console.debug('Clicked on Save button');
        var kbId = widget.options.kbId;
        var kb = AKT.kbs[kbId];

        formalTerm._description = $(widget.element).find('.textarea_definition').val();
        formalTerm._memo = $(widget.element).find('.textarea_memo').val();

        AKT.recordEvent({
            file:'formal_term_details.js',
            function:'AKT.widgets.formal_term_details.setup()',
            element:widget.element,
            finds:['.button_save'],
            event:'click',
            value: formalTerm._id,
            message:'Clicked on the Save button in the formal_term_details panel.'
        });
    });
};



AKT.widgets.formal_term_details.display = function (widget) {
    console.log('formal_term_details options:/n',widget.options);
    var kbId = widget.options.kbId;
    var kb = AKT.KBs[kbId];

    // TODO: fix this inconsistency; and add in type checking, error message etc
    if (widget.options.formal_term) { // The formal term object
        var formalTerm = widget.options.formal_term; 
    } else {   // The formal term id
        var formalTerm = kb._formalTerms[widget.options.term]; 
    }

    if (formalTerm.type === 'object') {
        $(widget.element).find('.object_only').css({display:'block'});
        var tree = AKT.makeTree(kbId,'subobjects');
        var superobjects = AKT.getAllAncestors(tree,formalTerm.id);
        var subobjects = AKT.getAllDescendants(tree,formalTerm.id);
        AKT.loadOptions(widget.element, 'select_superobjects', superobjects);
        AKT.loadOptions(widget.element, 'select_subobjects', subobjects);

    } else {
        $(widget.element).find('.object_only').css({display:'none'});
    }

    $(widget.element).find('.textarea_term').val(formalTerm._id);
    $(widget.element).find('.textarea_type').val(formalTerm._type);
    $(widget.element).find('.textarea_definition').val(formalTerm._description);
    $(widget.element).find('.textarea_memo').val(formalTerm._memo);
    //AKT.loadOptions(widget.element, 'select_synonyms', formalTerm.synonyms, true);
    AKT.loadTable(widget.element, 'table_synonyms', formalTerm.synonyms, true);   // Loads rows into a one-column table,
            // one <tr<td>...</td></tr> for each instance of the 3rd argument.

    if (formalTerm.id === "nyanya") {
        $(widget.element).find('.div_image').append('<img style="width:250px; height:250px;" SRC="images/momordica_charantia.gif">');
    } else if (formalTerm.id === "cocoyam") {
        $(widget.element).find('.div_image').append('<img style="width:250px; height:250px;" SRC="images/Bakweri_cocoyam_farmer_from_Cameroon.jpg">');
    } else if (formalTerm.id === "esre") {
        $(widget.element).find('.div_image').append('<img style="width:250px; height:250px;" SRC="images/Panicum_maximum_reduced.jpg">');
    } else {
        AKT5.show('<img style="float:right; margin:10px; width:200px; height:200px; background:white;" SRC="no_image.gif">');
    }

};


AKT.widgets.formal_term_details.html = `
<div class="content" style="border:none; padding:15px;">
    <div>Note: the name and type of a formal term cannot be changed.</div>
    <div>
        <div style="float:left;width:80px;height:20px;">Formal Term</div>
        <textarea class="textarea_term" disabled style="font-weight:bold; float:left; width:170px; height:20px; resize:horizontal;"></textarea>

        <div style="float:left;width:40px;height:20px;margin-left:40px;">Type</div>
        <textarea class="textarea_type" disabled style="font-weight:bold; float:left; width:80px; height: 20px;"></textarea><br/>

        <div style="clear:both;"></div>
    </div>

    <div style="margin-top:15px;">

        <div class="object_only">
            <div style="float:left;width:60px;height:20px;">Part of :</div>
            <select class="select_superobjects" size=3 style="float:left;width:140px; background:white"></select>

            <div style="float:left;width:45px;height:20px;margin-left:15px;">Parts:</div>
            <select class="select_subobjects" size=3 style="float:left;width:140px; background:white"></select>

            <div style="clear:both;"></div>
        </div>

        <div style="clear:both;"></div>
    </div>

    <div >
        <div style="float:left;">
            <div style="margin-top:10px;">
                <div style="width:70px;height:20px;">Definition: </div>
                <textarea class="textarea_definition" style="width:180px;height:65px;"></textarea>
            </div>

            <div style="margin-top:10px;">
                <div style="width:70px;height:20px;">Synonym(s):</div>
                <!--select class="select_synonyms" size=4 style="width:180px;background:white">[]</select-->
                <div style="width:180px;height:65px;background:white;border:solid 1px black;margin:0px;">
                    <table class="table_synonyms" style="margin:2px;"></table>
                </div>

                <div style="display:none;margin-top:0px;">
                    <button class="button_add" style="margin:0px;width:50px;height:30px;">Add</button><br/>
                    <button class="button_delete" style="margin-top:6px;width:50px;height:30px;">Delete</button>
                </div>
            </div>

            <div style="margin-top:10px;">
                <div style="width:70px;height:20px;">Memo: </div>
                <textarea class="textarea_memo" style="width:180px;height:65px;"></textarea>
            </div>
        </div>

        <div class="div_image" style="float:left;width:252px;height:252px;margin:7px;margin-top:30px;background:white;border:solid 1px black;"></div>

        <div style="clear:both;"></div>
    </div>

    <div style="margin-bottom:8px;">
        <button class="button_statements" style="float:left;width:80px;height:25px;margin-left:10px;" title="Shows the statements that contain this formal term.">Statements</button>
        <button class="button_in_hierarchy" style="float:left;width:80px;height:25px;margin-left:10px;" title="If this term is an object, shows where it occurs in its object hierarchy." >In Hierarchy</button>
        <button class="button_save" style="float:right;width:60px;height:25px;margin-left:10px;" title="Updates this entry in the knowledge base.">Save</button>
    </div>
    
    <div style="clear:both;"></div>

</div>     <!-- End of content div -->
`;



