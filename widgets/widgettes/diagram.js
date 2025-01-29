// 3 April 2022
// This is a merger of the original diagram.js (used for drawing diagrams; kept as diagram_frozen2.js), and the diagram.js
// which was used for displaying automatically-generated graph layouts for diagrams generated
// from causal links for a chosen topic (kept as diagram_layout_only_for_class.js).

// 28 April 2022
// Extracted code for putting up the "node template" dialog, to make it into a separate widget (node_template.js - 
// a widget, not a widgette).   



AKT.widgets.diagram = {};


AKT.widgets.diagram.setup = function (widget) {
    console.log('Starting akt.diagram: setup()');

    $('.dialog').draggable();

    $('#div_node_template_dialog').node_template({mode:'causal'});
    $('#div_node_template_dialog').css({display:'none'});


    $(widget.element).find('.diagram_button_left').css({width:'80px',padding:'2px'});
    $(widget.element).find('.diagram_button_right').css({width:'90px',padding:'3px'});

    $(widget.element).find('.table_attribute_cause_effect_values').css({
        'border-collapse':'collapse'});
    $(widget.element).find('.table_attribute_cause_effect_values tr').css({
        'border-collapse':'collapse'});
    $(widget.element).find('.table_attribute_cause_effect_values th').css({
        'border-collapse':'collapse', border:'solid 1px black', width:'70px', height:'20px'});
    $(widget.element).find('.table_attribute_cause_effect_values td').css({
        'border-collapse':'collapse',  'border':'solid 1px black', width:'70px', height:'20px'});

    var instance = "something_unique";  // .... the widget's UUID
    var kbId = widget.options.kbId;
    var kb = AKT.KBs[kbId];

    // Listbox with plain list of topics.
    var hierarchyId_filter = 'all';
    var topics = kb.findTopics({hierarchyId:hierarchyId_filter});
    AKT.loadSelectOptions(widget.element, 'listbox_topics', topics, ['_id','_id'],{title:'_search_term'});
    // End of topics listbox

    var graph = new joint.dia.Graph;
    AKT.state.current_graph = graph;
    // Change width and height here to create a bigger canvas, and cause the panel itself to size accordingly.
    //var paper = new joint.dia.Paper({ el: $(widget.element).find('.div_paper'), width: 1100, height: 600, gridSize: 1, model: graph, linkPinning:false });
    var paper = new joint.dia.Paper({ el: $(widget.element).find('.div_paper'), width: 700, height: 500, gridSize: 1, model: graph, linkPinning:false });
    paper.scale(1);

    $(widget.element).on( "resize", function(event, ui) {
        var width = $(widget.element).width()-250;   //For when left and right button blocks are displayed...
        height = $(widget.element).height()-100;
        //var width = $(widget.element).width()-0;
        //var height = $(widget.element).height()-50;
        console.log(width,height);
        $(widget.element).find('.div_paper').css({width:width+'px',height:height+'px'});
        paper.scaleContentToFit({ padding: 10 });
    });

    var m = {};
    AKT.state.mytype = 'pointer';
    var count = {object:0, attribute:0, process:0, action:0, causes1way:0, causes2way:0, link:0};
    var nodeReady = false;
    var flowPad = null;
    var influencePad = null;

    // Presentational attributes.
    var attrs = {
        elementDefault: {
            text: { fill: '#fff', style: { 'text-shadow': '1px 1px 1px #999', 'text-transform': 'capitalize' }},
            circle: { fill: '#feb663', stroke: 'white' }
        },
        elementSelected: {
            circle: { fill: '#9687fe' }
        },
        elementHighlighted: {
            circle: { fill: '#31d0c6' }
        },
        linkDefault: {
            '.connection': { stroke: '#6a6c8a', 'stroke-width': 1 }
        },
        linkDefaultDirected: {
            '.marker-target': { d: 'M 12 0 L 0 6 L 12 12 z' }
        },
        linkHighlighted: {
            '.connection': { stroke: '#33334e', 'stroke-width': 5 }
        },
        linkFlow: {
            '.marker-target': { d: 'M 12 0 L 0 6 L 12 12 z'},
            '.connection': { stroke: '#33334e', 'stroke-width': 5 }
        },
        linkInfluence: {
            '.marker-target': { d: 'M 12 0 L 0 6 L 12 12 z' }
        }
    };



    joint.shapes.standard.Rectangle.define('examples.CustomRectangle',
        {
            attrs: {
                body: {
                    rx: 10, // add a corner radius
                    ry: 10,
                    strokeWidth: 2,
                    fill: 'white',
                    stroke: 'blue'
                },
                label: {
                    textAnchor: 'left', // align text to left
                    refX: 10, // offset text from right edge of model bbox
                    fill: 'black',
                    fontSize: 10
                }
            }
        }, 
        {
            // inherit joint.shapes.standard.Rectangle.markup
        }, 
        {
            createRandom: function() {

                var rectangle = new this();

                var fill = '#' + ('000000' + Math.floor(Math.random() * 16777215).toString(16)).slice(-6);
                var stroke = '#' + ('000000' + Math.floor(Math.random() * 16777215).toString(16)).slice(-6);
                var strokeWidth = Math.floor(Math.random() * 6);
                var strokeDasharray = Math.floor(Math.random() * 6) + ' ' + Math.floor(Math.random() * 6);
                var radius = Math.floor(Math.random() * 21);

                rectangle.attr({
                    body: {
                        fill: fill,
                        stroke: stroke,
                        strokeWidth: strokeWidth,
                        strokeDasharray: strokeDasharray,
                        rx: radius,
                        ry: radius
                    },
                    label: { // ensure visibility on dark backgrounds
                        fill: 'black',
                        stroke: 'white',
                        strokeWidth: 1,
                        fontWeight: 'bold'
                    }
                });

                return rectangle;
            }
        }
    );


    // Store datalist option values in arrays, one for each syntactic element
    var syntacticElementTypes = ['actions', 'attributes','objects', 'parts', 'processes', 'values'];
    AKT.state.memory = {};
    $.each(syntacticElementTypes, function(i, type) {
        AKT.state.memory[type] = [];
        var list = $('#'+type).find('option');
        $.each(list, function(j,item) {
            AKT.state.memory[type].push(item.value);
        });
    });

    $('#cause_attval_options > input').attr('disabled','true');
    $('#effect_attval_options > input').attr('disabled','true');
    $('#cause_attval_options > label').css({color:'#808080'});
    $('#effect_attval_options > label').css({color:'#808080'});





// =========================  BUTTON EVENT HANDLERS  =======================================

    $('.diagram_save').on('click', function() {
        $('#save_diagram_local_storage').css({display:'block'});
    });

    $('.diagram_load').on('click', function() {
        graph.removeCells(graph.getElements());
        graph.removeLinks(graph.getLinks());
        $('#load_diagram_local_storage').css({display:'block'});
    });

    $('#save_diagram_local_storage_ok').on('click', function(event) {
        console.log('\n90. clicked on Save button');
        $('#save_diagram_local_storage').css({display:'none'});
        var title = $('#save_diagram_local_storage_title').val();
        saveDiagramToLocalStorage(graph, title);
    });

    $('#load_diagram_local_storage_ok').on('click', function(event,element) {
        $('#load_diagram_local_storage').css({display:'none'});
        var title = $('#load_diagram_local_storage_title').val();
        var diagramString = localStorage.getItem(title);
        var jointObject = JSON.parse(diagramString); 
        var nodes = jointObject.nodes;
        for (var i=0; i<nodes.length; i++) {
            var node = new joint.shapes.standard.Rectangle(nodes[i]);
            node.addTo(graph);
        }
        var links = jointObject.links;
        for (var i=0; i<links.length; i++) {
            console.log(links[i]);
            var link = new joint.shapes.standard.Link(links[i]);
            link.addTo(graph);
        }
    });


/*
        var objectName = $('#node_attribute_dialog_object_name').val();
        var partName = $('#node_attribute_dialog_objectpart_name').val();
        var attributeName = $('#node_attribute_dialog_attribute_name').val();
        var result = AKT.mywrap(objectName+' '+partName+' '+attributeName);
    
        // Three ways of representing the node's full name!
        // - as a newline-separated list (for display in the diagram);
        // - as an underscore-separated list (myLabel) (for display in the statement(s) it's in); and
        // - as an object (labelBits) (to capture its semantics).
        // Clearly, the last one (labelBits) should be the primary (only) one, with the other two being
        // generated as needed.   
        // Note that one cannot reliably go from the first two to the semantic bits of the node, since
        // the separator (newline or underscore) can occur in one bit of the label.
        // This still needs some work, since even the last option cannot really handle e.g. a process,
        // which can have 3 forms, for none, one or two objects.  Probably should use same JSON format
        // as in grammar for att_value(...).

        var jointNode = AKT.state.currentElement;
        jointNode.attr('label/text',result.wrappedString);
        jointNode.myLabel = objectName+'_'+partName+'_'+attributeName;
        jointNode.labelBits = {object:objectName,part:partName,attribute:attributeName};

        AKT.state.currentElement.resize(Math.max(60,4+7.2*result.nchars), Math.max(35,4+11*result.nlines));
        $('#node_attribute_dialog').css({display:'none'});
        saveDiagramToLocalStorage(graph, 'current');
    });
*/
    $(widget.element).find('.link_causes1way_dialog_ok').on('click', function() {
        for (var i=1; i<=3; i++) {
            var sourceValue = $(this).parent().parent().find('.cause_value_'+i+' input').val();
            var targetValue = $(this).parent().parent().find('.effect_value_'+i+' input').val();
            if (sourceValue && targetValue) {
                var sourceJson = JSON.parse(JSON.stringify(AKT.state.currentSourceNode.json));    // There has to be a better way.   Maybe
                var targetJson = JSON.parse(JSON.stringify(AKT.state.currentTargetNode.json));    // use a data-attribute, or a text field?
                // TODO: att_value must be treated separately for each of source and target nodes, since 
                // object/process/action don't have a value!
                sourceJson.push(sourceValue);
                targetJson.push(targetValue);
                var json = ['causes1way',sourceJson, targetJson];
                var statement = new Statement({id:'s100'+i,json:json});
                var formal = statement.generateFormal();
                var english = statement.generateEnglish();
                console.log(json);
                console.log(formal);
                var kbId = AKT.state.current_kb;
                var kb = AKT.KBs[kbId];
                kb._statements['s100'+i] = statement;
            }
        }
        $(this).parent().parent().css({display:'none'});
    });

    // Click an Add Node button
    $('.button_add_node').on('click', function(event,item) {
        var category = event.currentTarget.dataset.category;  // 'node' or 'link'
        var type = event.currentTarget.dataset.type;
        process_node_or_link_button(this, category, type);   // 'attribute', 'object', 'process' or 'action'
    });

    // Click an Add Link button
    $('.button_add_link').on('click', function(event,item) {
        var category = event.currentTarget.dataset.category;  // 'node' or 'link'
        var type = event.currentTarget.dataset.type;   // 'causes1way', 'causes2way' or 'link'
        console.log('===',category,type);
        process_node_or_link_button(this, category, type);
    });

    // Buttons in node and link creation dialogs
    $('.diagram_node_dialog').on('click', function() {
        $(this).css({display:'none'});
    });

    $('.diagram_link_dialog').on('click', function() {
        $(this).css({display:'none'});
    });


// =========================== LISTBOX HANDLERS  ==============================

    $(widget.element).find('.button_display').on('click', function() {
        event.stopPropagation();
        var kbId = widget.options.kbId;
        var kb = AKT.KBs[kbId];
        graph.clear();
        var topicId = $(widget.element).find('.listbox_topics').val();
        var diagram = new Diagram('acheampong_from_topic','systo');
        AKT.state.diagram_counter += 1;
        AKT.state.current_diagram = diagram;  // The object, not the ID

        console.log('topicId::: ',topicId);
        diagram.makeSubgraph(topicId);
        if (Object.keys(diagram._systo.arcs).length > 0) {
            console.log('\n## n nodes: ',Object.keys(diagram._systo.nodes).length);  // 41
            console.log('## n arcs:  ',Object.keys(diagram._systo.arcs).length);     // 33
            var i=0;
            for (var arcId in diagram._systo.arcs) {
                i += 1;
                var arc = diagram._systo.arcs[arcId];
            }
            var i=0;
            for (var nodeId in diagram._systo.nodes) {
                i += 1;
                var node = diagram._systo.nodes[nodeId];
            }
            diagram.graphLayoutSpringy(widget);
            $(widget.element).blur();
        } else {
            alert('There are no causal statements for the chosen topic.');
        }
    });


// ===========================  JOINT HANDLERS  ===============================

    paper.on('blank:pointerdblclick', function(evt, x, y) {
        evt.stopPropagation();
        var nodeTypes = {attribute:true, object:true, process:true, action:true};
        var mytype = AKT.state.mytype;
        console.log(':::',mytype);
        if (nodeTypes[mytype]) {
            var node = createNode(_.uniqueId('n'), {x:x, y:y}, mytype);
        }
        saveDiagramToLocalStorage(graph, 'current');
        $('.diagram_button_left').css({border:'solid 1px #808080', background:'#f0f0f0'});
        AKT.state.mytype = 'pointer';
        _.each(graph.getElements(), function(el) {
            el.removeAttr('body/magnet').removeAttr('text/pointer-events');
        });
    });

    //====================================================
    // From jointjs events tutorial
    paper.on('blank:pointerdblclickxxx', function() {
        resetAll(this);

        info.attr('body/visibility', 'hidden');
        info.attr('label/visibility', 'hidden');

        this.drawBackground({
            color: 'orange'
        })
    });


    paper.on('element:pointerdblclick', function(elementView) {
        AKT.state.currentElement = elementView.model;
    });


    paper.on('cell:pointerclickxxx', function(cellView) {
        var isElement = cellView.model.isElement();
        var type = cellView.model.type;
        var message = (isElement ? 'Element' : 'Link') + ' clicked';
    });


    paper.on({
        'element:contextmenu': onElementRightClick
    });

    function onElementRightClick(view) {
    }


    // -------------------------------------------------------------
    // NODE ("ELEMENT") EVENTS

    paper.on('cell:pointerdblclick', function(cellView) {
        var isElement = cellView.model.isElement();
        var type = cellView.model.type;
        var message = (isElement ? 'Element' : 'Link') + ' clicked';
        var nodeName = cellView.model.id;
    
        console.log('json: ',cellView.model.json);

        if (isElement) {
            $('#div_node_template_dialog').node_template('option',{
                mode:'node',   // Alternatives are statement types ('attval','cause','effect')
                node_type:type, 
                node_id:cellView.model.id, 
                node:cellView.model
            });
            $('#div_node_template_dialog').css({display:'block'});
        } else {
            // Not sure why this is here (rather than a link dblclick event...)?
            $('.diagram_link_dialog').css({display:'block'});
        }

        var kbId = widget.options.kbId;
        var kb = AKT.kbs[kbId];
    });




    // This is triggered when a link's source or target node is moved.
    // So it's also sort-of a link event as well.
    graph.on('change:source change:target', function (link, collection, opt) {
        var aktId = link.id;
        var sourceId = link.get('source').id;
        var source = graph.getCell(sourceId);
        mytype = AKT.state.mytype;

        var targetId = link.get('target').id;
        var target = graph.getCell(targetId);

        if (opt.ui && sourceId && targetId) {
            link.remove();
            createLink(aktId, sourceId, targetId, mytype);
        }
        saveDiagramToLocalStorage(graph, 'current');
    });

    paper.on('element:mouseenter', function(element) {
    });


    paper.on('e:mouseleave', function(element) {
    });


    paper.on('link:pointerdblclick', function(linkView) {
        linkView.model.attr({
            line:{
                stroke:'green',
                strokeWidth:3
            }
        });
        var sourceId = linkView.model.attributes.source.id;
        var source = graph.getCell(sourceId);
        AKT.state.currentSourceNode = source;
        source.attr({
            body:{
                stroke:'blue',
                strokeWidth:1
            }
        });
        var targetId = linkView.model.attributes.target.id;
        var target = graph.getCell(targetId);
        AKT.state.currentTargetNode = target;
        target.attr({
            body:{
                stroke:'blue',
                strokeWidth:1
            }
        });

        var kbId = AKT.state.current_kb;

        var dialog = $(widget.element).find('.link_causes1way_dialog');
        dialog.find('.span_source').text(source.makeNodeName(source.json)+': '+source.makeNodeFormal(source.json));
        dialog.find('.span_target').text(target.makeNodeName(target.json)+': '+target.makeNodeFormal(target.json));

        if (source.json[0] === 'att_value'){
            dialog.find('.table_attribute_cause_values').css({display:'block'});
        } else {
            dialog.find('.table_attribute_cause_values').css({display:'none'});
        }
        if (target.json[0] === 'att_value'){
            dialog.find('.table_attribute_effect_values').css({display:'block'});
        } else {
            dialog.find('.table_attribute_effect_values').css({display:'none'});
        }

        dialog.css({display:'block'});
    });



// ==================================  FUNCTIONS  ==================================

    // Create a link between a source element with id `s` and target element with id `t`.
    function createLink(aktId,sourceId, targetId, mytype) {
        console.log('createLink',mytype);

        var source = graph.getCell(sourceId);
        var target = graph.getCell(targetId);

        if (mytype === 'causes1way') {
            var along = 0.5;
            var link = new joint.shapes.standard.Link({
                akt_id: aktId,
                id: [sourceId,targetId].sort().join(),
                source: { id: sourceId },
                target: { id: targetId },
                along: along,
                smooth: true,
                z: -1,
                type:'causes1way',
                attrs: {
                    line: {
                        stroke: '#dd0000',
                        strokeWidth:2,
                        targetMarker: {
                            'fill': '#dd0000',
                            'stroke': 'none',
                            'type': 'path',
                            'd': 'M 12 -6 0 0 12 6 Z'
                        }
                    }
                }
            });
            link.addTo(graph);
            console.log('\n...');
            link.set('akt_id',aktId);
            link.set('mytype',mytype);
            console.log(link);
            link.set('vertices', [calculateCurveVertexPosition(along, source, target)]);

        } else if (mytype === 'causes2way') {
            var along = 0.5;
            var link = new joint.shapes.standard.Link({
                akt_id: aktId,
                id: [sourceId,targetId].sort().join(),
                source: { id: sourceId },
                target: { id: targetId },
                along: along,
                smooth: true,
                z: -1,
                type: 'causes2way',
                attrs: {
                    line: {
                        stroke: '#dd0000',
                        strokeWidth:3,
                        sourceMarker: {
                            'fill': '#dd0000',
                            'stroke': 'none',
                            'type': 'path',
                            //'d': 'M 5 -10 L -15 0 L 5 10 Z'
                            'd': 'M 12 -6 0 0 12 6 Z'
                        },
                        targetMarker: {
                            'fill': '#dd0000',
                            'stroke': 'none',
                            'type': 'path',
                            'd': 'M 12 -6 0 0 12 6 Z'
                        }
                    }
                }
            });
            link.addTo(graph);
            link.set('akt_id',aktId);
            link.set('mytype',mytype);
            link.set('vertices', [calculateCurveVertexPosition(along, source, target)]);

        } else if (mytype === 'link') {
            var along = 0.5;
            var link = new joint.shapes.standard.Link({
                id: [sourceId,targetId].sort().join(),
                source: { id: sourceId },
                target: { id: targetId },
                along: along,
                smooth: true,
                z: -1,
                type: 'link',
                attrs: {
                    line:{stroke:'blue'},
                    '.marker-target': { d: 'M 12 0 L 0 6 L 12 12 z'},
                    '.marker-source': { d: 'M 12 0 L 0 6 L 12 12 z'},
                    '.connection': { fill:'blue', stroke: 'blue', 'stroke-width': 3 },
                     sourceMarker: {
                            'fill': 'green',
                            'stroke': 'none',
                            //'d': 'M 5 -10 L -15 0 L 5 10 Z'
                            'd': 'M 10 -10 L -15 0 L 5 10 Z'
                      }

                }
            });
            link.addTo(graph);
            link.set('akt_id',aktId);
            link.set('mytype',mytype);
            link.set('vertices', [calculateCurveVertexPosition(along, source, target)]);
        }
        $('.diagram_button_left').css({border:'solid 1px #808080', background:'#f0f0f0'});
        AKT.state.mytype = 'pointer';
        _.each(graph.getElements(), function(el) {
            el.removeAttr('body/magnet').removeAttr('text/pointer-events');
        });
    }

    function calculateCurveVertexPosition(along, source, target) {
        var sx = source.attributes.position.x + 22;
        var sy = source.attributes.position.y + 17;
        var tx = target.attributes.position.x + 22;
        var ty = target.attributes.position.y + 17;
        var mx = (sx+tx)*along;
        var my = (sy+ty)*along;
        var hyp = Math.sqrt((tx-sx)**2 + (ty-sy)**2);
        return {x:mx-(ty-sy)*20/hyp, y:my+(tx-sx)*20/hyp};
    }


    // Create a node with `id` at the position `p`.
    function createNode(id, p, mytype) {
        console.log('createNode()',id,mytype);

        if (AKT.state.mytype === 'object') {  
            var node = new joint.shapes.standard.Rectangle();
            node.position(p.x-38, p.y-25);
            node.resize(70, 45);
            node.attr({
                body: {stroke: 'blue', strokeWidth: 2, fill:'yellow'},
                label: {
                    text: 'object',
                    textVerticalAnchor: 'top',
                    textAnchor: 'left',
                    refX: 4,
                    refY: 3,
                    fontSize:10,
                    style: { stroke: 'black', strokeWidth:0.3}
                }
            });
            node.type = 'object';
            node.status = 'no_name';
            node.addTo(graph);
            node.on('change:position', function(element, position) {
                console.log('-->> node change:position');
                updateMidnodes(element);
            });
            node.attr('body/magnet', true).attr('text/pointer-events', 'none');

        } else if (AKT.state.mytype === 'attribute') {  
            var node = new joint.shapes.standard.Rectangle();
            node.position(p.x-38, p.y-25);
            node.resize(70, 45);
            node.attr({
                body: {stroke: 'red', strokeWidth: 2, fill:'yellow'},
                label: {
                    text: 'attribute',
                    textVerticalAnchor: 'top',
                    textAnchor: 'left',
                    refX: 4,
                    refY: 3,
                    fontSize:10,
                    style: { stroke: 'black', strokeWidth:0.3}
                }
            });
            node.type = 'attribute';
            node.status = 'no_name';
            node.addTo(graph);
            node.on('change:position', function(element, position) {
                console.log('-->> node change:position');
                updateMidnodes(element);
            });
            node.attr('body/magnet', true).attr('text/pointer-events', 'none');

        } else if (AKT.state.mytype === 'process') {  
            var node = new joint.shapes.standard.Ellipse();
            node.position(p.x-46, p.y-30);
            node.resize(80, 50);
            node.attr({
                body: {fill: 'yellow',stroke:'#00ff00',strokeWidth:2},
                label: {text: 'process', fontSize:10, style: { stroke: 'black', strokeWidth:0.3}}
            });

            node.type = 'process';
            node.status = 'no_name';
            node.addTo(graph);
            node.on('change:position', function(element, position) {
                console.log('-->> node change:position');
                updateMidnodes(element);
            });
            node.attr('body/magnet', true).attr('text/pointer-events', 'none');

        } else if (AKT.state.mytype === 'action') {
            var node = new joint.shapes.examples.CustomRectangle();
            node.position(p.x-46, p.y-30);
            node.resize(80,40);
            node.attr({
                body: {fill: 'yellow',stroke:'blue',strokeWidth:2},
                label: {text:'action', fontSize:10, style: { stroke: 'black', strokeWidth:0.3}}
            });

            node.type = 'action';
            node.status = 'no_name';
            node.addTo(graph);
            node.on('change:position', function(element, position) {
                console.log('-->> node change:position');
                updateMidnodes(element);
            });
            node.attr('body/magnet', true).attr('text/pointer-events', 'none');
        }


        console.log('create',this);
        // This is the actual node name, consisting of its formal terms joined 
        // by underscores.


        // Functions added as methods to the JointJs Element class (for nodes),
        // to create various forms of names/labels for a node from the 
        // nodes JSON attribute.
        node.makeNodeName = function (json) {
            if (typeof json === 'string') {
                var array = [json];
            } else {
                var array = json.flat(99);
            }
            var label = '';
            var j = 0;
            for (var i=0; i<array.length; i++) {
                var a = array[i];
                if (a!=='att_value' && a!=='part' && a!=='process' && a!=='action') {
                    j += 1;
                    label += j===1 ? a : '_'+a;
                }
            }
            console.log('label:',label);
            console.log('------------------------------\n\n');
            return label;
        }

        // This is the label that appears inside the node in the diagram,
        // consisting of the formal terms joined by newlines (\n), so that
        // the ;abel fits inside the nodes box.
        node.makeNodeLabelWrapped = function (json) {
            var label1 = this.makeNodeName(json);
            var label2 = label1.replace(/_/g, ' ');
            return AKT.mywrap(label2);
        }

        // This is the formal Prolog-style syntax for the node, basically
        // AKT's formal grammar for att_value statements or the components
        // of causal statements, without the value part.
        // This is derived from Statement.generateFormal(), suitably cut down since
        // it's just for node JSON.
        node.makeNodeFormal = function (json) {
                
            formal = walk(json);
            return formal;

            function walk (part) {
                if (typeof part === "string") {  
                    return part;

                } else {   // Unnecessarily generalised, since max of 3 (I think) cases.
                    var result = part[0]+'(';
                    for (var i=1; i<part.length; i++) {
                        var comma = i<part.length-1?',':'';
                        result += walk(part[i])+comma;
                    }
                    result += ')';
                    return result;
                }
            }
        }

        return node;
    }

    // --------------------------------------------------------------------------------

    function process_node_or_link_button(button, group, type) {
        if (AKT.state.mytype === type) {
            $('.diagram_button_left').css({border:'solid 1px #808080', background:'#f0f0f0'});
            AKT.state.mytype = 'pointer';
            if (group === 'link') {
                _.each(graph.getElements(), function(el) {
                    el.removeAttr('body/magnet').removeAttr('text/pointer-events');
                });
            }
        } else {
            $('.diagram_button_left').css({border:'solid 1px #808080', background:'#f0f0f0'});
            $(button).css({border:'solid 1px #808080', background:'#88ff88'});
            AKT.state.mytype = type;
            console.log('====',group,type);
            if (group === 'link') {
                _.each(graph.getElements(), function(el) {
                    el.attr('body/magnet', true).attr('text/pointer-events', 'none');
                });
            }
        }
    }


    function makeId(mytype) {
        count[mytype] += 1;
        return mytype+count[mytype];
    }


    function resetAll(paper) {
        console.log('\n******* resetAll()');
        paper.drawBackground({
            color: 'white'
        })

        var elements = paper.model.getElements();
        for (var i = 0, ii = elements.length; i < ii; i++) {
            var currentElement = elements[i];
            currentElement.attr('body/stroke', 'black');
            currentElement.on('change', function () {
                console.log('xxx');
            });
        }

        var links = paper.model.getLinks();
        for (var j = 0, jj = links.length; j < jj; j++) {
            var currentLink = links[j];
            currentLink.attr('line/stroke', 'black');
            currentLink.label(0, {
                attrs: {
                    body: {
                        stroke: 'black'
                    }
                }
            })
        }
    }


    function saveDiagramToLocalStorage(graph, key) {
        console.log('\n102 function saveDiagramToLocalStorage',key);
        var jointObject = {nodes:[],links:[]};
        _.each(graph.getElements(), function(el) {
            jointObject.nodes.push(el.attributes);
        });
        _.each(graph.getLinks(), function(el) {
            jointObject.links.push(el.attributes);
        });
        console.log(jointObject);
        
        var diagramString = JSON.stringify(jointObject);
        localStorage.setItem(key, diagramString);
    }



    function updateMidnodes(element) {
        _.each(graph.getLinks(), function(link) {
            var sourceId = link.get('source').id;
            var targetId = link.get('target').id;
            if (element.id === sourceId || element.id === targetId) {
                // Calculate link mid-point (maybe JointJS geometry should be use instead?)
                var source = graph.getCell(sourceId);
                var target = graph.getCell(targetId);
                // Use actual width and height!
                var sx = source.attributes.position.x + 22;
                var sy = source.attributes.position.y + 17;
                var tx = target.attributes.position.x + 22;
                var ty = target.attributes.position.y + 17;

                // We need to re-calculate the link's vertex position (i.e.
                // the point that the curve goes through).    
                var along = link.attributes.along;
                var mx = (sx+tx)*along;
                var my = (sy+ty)*along;
                var hyp = Math.sqrt((tx-sx)**2 + (ty-sy)**2);
                link.set('vertices', [{x:mx-(ty-sy)*20/hyp, y:my+(tx-sx)*20/hyp}]);
            }
        });
    }


    console.log('End of setup');
};




AKT.widgets.diagram.display = function (widget) {
    console.log('\ndiagram:display() ',AKT.state);
    if (AKT.state.diagram_counter >= 1) {
        var diagram = AKT.state.current_diagram;  // The object, not the ID
        var graph = AKT.state.current_graph;  // The object, not the ID

        var jointObject = diagram.convertSystoToJoint();

        var nodes = jointObject.nodes;
        for (var i=0; i<nodes.length; i++) {
            var node = new joint.shapes.standard.Rectangle(nodes[i]);
                node.on('change:position', function(element, position) {
                    updateMidnodes(element);
                });
            node.addTo(graph);
        }
        var links = jointObject.links;
        for (var i=0; i<links.length; i++) {
            var link = new joint.shapes.standard.Link(links[i]);
            var source = graph.getCell(link.attributes.source.id);
            var target = graph.getCell(link.attributes.target.id);
            if (source && target) {   // TODO: temporary hack.  Need to see why some targets are undefined.
                link.set('vertices', [calculateCurveVertexPosition(0.5, source, target)]);
                link.addTo(graph);
            }
        }
    }


    function updateMidnodes(element) {
        _.each(graph.getLinks(), function(link) {
            var sourceId = link.get('source').id;
            var targetId = link.get('target').id;
            if (element.id === sourceId || element.id === targetId) {
                // Calculate link mid-point (maybe JointJS geometry should be use instead?)
                var source = graph.getCell(sourceId);
                var target = graph.getCell(targetId);
                // Use actual width and height!
                var sx = source.attributes.position.x + 22;
                var sy = source.attributes.position.y + 17;
                var tx = target.attributes.position.x + 22;
                var ty = target.attributes.position.y + 17;

                // We need to re-calculate the link's vertex position (i.e.
                // the point that the curve goes through).    
                var along = link.attributes.along;
                var mx = (sx+tx)*along;
                var my = (sy+ty)*along;
                var hyp = Math.sqrt((tx-sx)**2 + (ty-sy)**2);
                link.set('vertices', [{x:mx-(ty-sy)*20/hyp, y:my+(tx-sx)*20/hyp}]);
            }
        });
    }


    function calculateCurveVertexPosition(along, source, target) {
        var sx = source.attributes.position.x + 22;
        var sy = source.attributes.position.y + 17;
        var tx = target.attributes.position.x + 22;
        var ty = target.attributes.position.y + 17;
        var mx = (sx+tx)*along;
        var my = (sy+ty)*along;
        var hyp = Math.sqrt((tx-sx)**2 + (ty-sy)**2);
        return {x:mx-(ty-sy)*20/hyp, y:my+(tx-sx)*20/hyp};
    }



};


AKT.widgets.diagram.html = `
<div class="content" style="border:none;padding:5px;">

    <!-- ============== statement popup ================== -->
    <div class="popup" style="position:absolute; visibility:hidden; left:20px; top:50px; padding:4px; width:500px; border:solid 3px blue; background:#eeffee; z-index:10000;">Statement...</div>

    <!-- ============== top div ================= -->
    <div class="top_div" style="width:100%; background:#d4d0c8;"></div>
        <div style="float:left; margin-left:10%;">
            <input type="radio" id="all" name="view" value="all" checked>
            <label for="all">all</label>
            <input type="radio" id="causal" name="view" value="causal" style="margin-left:10px;">
            <label for="causal">causal</label>
            <input type="radio" id="link" name="view" value="link" style="margin-left:10px;">
            <label for="link">link</label>
        </div>
        <!--input type="button" style="float:left;margin-left:8%;" id="'+instance+'_copy_to_clipboard" value="Copy to Clipboard"-->
        <input type="button" style="float:left;margin-left:8%;" id="load_acheampong" value="Load acheampong">
        <input type="button" style="float:left;margin-left:8%;" id="show_acheampong" value="Show acheampong">
        <input type="button" style="float:left;margin-left:10px;" id="'+instance+'_save diagram_save" value="Save">
        <input type="button" style="float:left;margin-left:10px;" id="'+instance+'_load diagram_load" value="Load">
        <input type="button" onclick="layout();" style="float:left;margin-left:3%;" id="'+instance+'_menu" value="Menu">
    </div>

    <!-- ============== main div ================= -->
    <!-- The container for left_div, right_div and diagram_div -->
    <div class="main_div w3-row">

        <!-- ============== left div ================= -->
        <div class="left_div w3-col w3-left w3-container" style="margin-top:0px; padding:5px; width:110px;">
            <fieldset style="position:static;">
                <legend>Add node</legend>
                <input type="button" class="button_add_node button_add_attribute diagram_button_left node_attribute" data-category="node" data-type="attribute" value="Attribute"><br>
                <input type="button" class="button_add_node button_add_object diagram_button_left node_object" data-category="node" data-type="object" value="Object"><br>
                <input type="button" class="button_add_node button_add_process diagram_button_left node_process" data-category="node" data-type="process"  value="Process"><br>
                <input type="button" class="button_add_node button_add_action diagram_button_left node_action" data-category="node" data-type="action" value="Action"><br>
             </fieldset>

            <fieldset style="position:static;">
                <legend>Add link</legend>
                <input type="button" class="button_add_link button_add_causes1way diagram_button_left link_causes1way" data-category="link" data-type="causes1way" value="Causes1way" style="width:60px;"><br>
                <input type="button" class="button_add_link button_add_causes2way diagram_button_left link_causes2way" data-category="link" data-type="causes2way" value="Causes2way" style="width:60px;"><br>
                <input type="button" class="button_add_link button_add_link diagram_button_left link_link" data-category="link" data-type="link" value="Link" style="width:60px;"><br>
             </fieldset>

            <fieldset style="position:static;">
                <legend>Delete</legend>
                <input type="button" class="button_delete_node_or_link diagram_button_left" value="Node/Link" style="width:60px;"><br>
             </fieldset>

            <fieldset style="position:static;">
                <legend>Hide</legend>
                <input type="button" class="button_hide_node_or_link diagram_button_left" value="Node/Link" style="width:60px;"><br>
             </fieldset>'

            <fieldset style="position:static;">
                <legend>Show/Hide</legend>
                <input type="button" class="button_show_hide_label diagram_button_left" value="Label" style="width:60px;"><br>
             </fieldset>
        </div>    <!-- End of left div -->

        <!-- ============== right div ================= -->
        <div class="right_div w3-col w3-right w3-container" style="margin-top:0px; padding:5px; width:130px;">
            <fieldset style="position:static;">
                <legend>Zoom</legend>
                <input type="button" class="button_zoom_in diagram_button_right" value="Zoom in">
                <input type="button" class="button_zoom_out diagram_button_right" value="Zoom out">
                <input type="button" class="button_centre_zoom diagram_button_right" value="Centre Zoom">
             </fieldset>

            <fieldset style="position:static;">
                <legend>Label Mode</legend>
                <input type="button" class="button_label_mode_left" style="float:left;" value="&lt;">
                <input type="button" class="button_label_mode_right" style="float:left;" value="&gt;">
                <input type="button" class="button_label_mode_auto" style="float:left; width:40px;" value="Auto">
             </fieldset>

            <fieldset style="position:static;">
                <input type="button" class="button_refresh diagram_button_right" value="Refresh">
                <input type="button" class="button_show_paths diagram_button_right" value="Show Paths">
                <input type="button" class="button_print_window diagram_button_right" value="Print Window">
                <input type="button" class="button_statements diagram_button_right" value="Statements">
            </fieldset>

            <fieldset style="position:static;">
                <legend>Explore</legend>
                <input type="button" class="button_navigate diagram_button_right" value="Navigate">
                <input type="button" class="button_sources diagram_button_right" value="Sources">
                <input type="button" class="button_causes diagram_button_right" value="Causes">
                <input type="button" class="button_effects diagram_button_right" value="Effects">
                <input type="button" class="button_undo diagram_button_right" value="Undo">
             </fieldset>

            <fieldset style="position:static;">
                <legend>Select Diagram</legend>
                //'<label for="instance+'_select_diagram_left">&lt;</label>
                <input type="button" class="button_select_diagram_left" style="float:left; width:44px;" value="&lt;">
                <input type="button" class="button_select_diagram_right" style="float:left; width:44px;" value="&gt;">
             </fieldset>
        </div>

        <!-- =========== diagram div =================== -->
        <div id="paper" class="w3-rest w3-container div_paper" style="background:white; width:500px; height:500px;"></div>

    </div>  <!-- End of main_div, the w3.css container for left_div, right_div and diagram_div -->


    <!-- =========== DIALOGS ======================================================================= -->

    <!-- =========== link_causes1way_dialog ============ -->
    <div class="dialog always_on_top link_causes1way_dialog" style="display:none;position:absolute;border:solid 1px black; background:white; left:50px;top:80px;padding-bottom:10px;z-index:100000;">

        <div class="dialog_title" style="background:#ffa0a0;">
            <div class="dialog_id">link_causes1way_dialog</div>link_causes1way_dialog
        </div>

        <div class="dialog_body" style="border:none; padding:10px;">
            <div><span>Cause: </span><span class="span_source"></span></span></div>
            <div><span>Effect:</span><span class="span_target"></span></span></div>

            <div>
                <table class="table_attribute_cause_values" style="float:left;">
                    <tr>
                        <th>Cause attribute's value</td>
                    </tr>
                    <tr>
                        <td class="cause_value_1"><input type="text" style="background:white;"></input></td>
                    </tr>
                    <tr>
                        <td class="cause_value_2"><input type="text" style="background:white;"></input></td>
                    </tr>
                    <tr>
                        <td class="cause_value_3"><input type="text" style="background:white;"></input></td>
                    </tr>
                </table>
                <table class="table_attribute_effect_values" style="float:left;">
                    <tr>
                        <th>Effect attribute's value</td>
                    </tr>
                    <tr>
                        <td class="effect_value_1"><input type="text" style="background:white;"></input></td>
                    </tr>
                    <tr>
                        <td class="effect_value_2"><input type="text" style="background:white;"></input></td>
                    </tr>
                    <tr>
                        <td class="effect_value_3"><input type="text" style="background:white;"></input></td>
                    </tr>
                </table>
                <div style="clear:both;"></div>
            </div>

            <input type="button" class="link_causes1way_dialog_ok" style="float:right;" value="OK">
            <input type="button" class="link_causes1way_dialog_cancel" style="float:right;" value="Cancel">
        </div>
    </div>     <!-- End of dialog div -->



    <!-- ------------------------------------------------------------------------ -->
    <!-- Node template dialog (container element for the node_template.js widget) -->
    <!--div id="div_node_template_dialog" class="dialog always_on_top" style="display:none; position:absolute; border:solid 1px black; background:#d4d0c8;left:50px;top:80px;z-index:100000">
    </div-->


    <!-- =========== save_diagram_local_storage ============ -->
    <div id="save_diagram_local_storage" class="dialog always_on_top" style="display:none; position:absolute; border:solid 1px black; background:#d4d0c8;left:20px;top:40px;width:300px;height:185px;z-index:100000">

        <div class="dialog_title">
            <div class="dialog_id">save_diagram_local_storage</div>save_diagram_local_storage<input type="button" value="X" class="dialog_close_button"/>
        </div>

        <div class="dialog_body" style="border:none;background:#d4d0c8; padding:10px;height:162px;">
            <input type="text" style="float:right;" id="save_diagram_local_storage_title">
            <label for="save_diagram_local_storage_title" style="margin-right:5px;float:right;">Diagram title</label>
            <br/>
            <input type="button" id="save_diagram_local_storage_ok" style="float:right;" value="OK">
            <input type="button" id="save_diagram_local_storage_cancel" style="float:right;" value="Cancel">
        </div>
    </div>     <!-- End of dialog div -->


    <!-- =========== load_diagram_local_storage ============ -->
    <div id="load_diagram_local_storage" class="dialog always_on_top" style="display:none; position:absolute; border:solid 1px black; background:#d4d0c8;left:20px;top:40px;width:300px;height:185px;z-index:100000">

        <div class="dialog_title">
            <div class="dialog_id">load_diagram_local_storage</div>load_diagram_local_storage<input type="button" value="X" class="dialog_close_button"/>
        </div>

        <div class="dialog_body" style="border:none;background:#d4d0c8; padding:10px;height:162px;">
            <input type="text" style="float:right;" id="load_diagram_local_storage_title">
            <label for="load_diagram_local_storage_title" style="margin-right:5px;float:right;">Diagram title</label>
            <br/>
            <input type="button" id="load_diagram_local_storage_ok" style="float:right;" value="OK">
            <input type="button" id="load_diagram_local_storage_cancel" style="float:right;" value="Cancel">
        </div>
    </div>     <!-- End of dialog div -->



    <!-- =========== make_subdiagram ============ -->
    <div id="make_subdiagram" class="dialog always_on_top" style="display:none; position:absolute; border:solid 1px black; background:#d4d0c8;left:20px;top:40px;width:300px;height:185px;z-index:100000">

        <div class="dialog_title">
            <div class="dialog_id">make_subdiagram</div>make_subdiagram<input type="button" value="X" class="dialog_close_button"/>
        </div>

        <div class="dialog_body" style="border:none;background:#d4d0c8; padding:10px;height:162px;">
            <input type="text" style="float:right;" id="make_subdiagram_title">
            <label for="make_subdiagram_title" style="margin-right:5px;float:right;">Search expression</label>
            <br/>
            <input type="button" id="make_subdiagram_ok" style="float:right;" value="OK">
            <input type="button" id="make_subdiagram_cancel" style="float:right;" value="Cancel">
        </div>
    </div>     <!-- End of dialog div -->
</div>
`;


