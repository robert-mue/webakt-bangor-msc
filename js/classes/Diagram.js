class Diagram {
    
    constructor(id,language,spec) {
        if (id) {
            this._id = id;
        } else {
            this._id = Math.round(10000*Math.random());
        }
        this._joint = {nodes:{},links:{}};
        if (language === 'systo') {
            if (spec) {
                this._systo.meta = spec.meta;
                this._systo.nodes = spec.nodes;
                this._systo.arcs = spec.arcs;
            } else {
                this._systo = {meta:{},nodes:{},arcs:{}};
            }
        } else if (language === 'joint') {
            this._joint.nodes = spec.nodes;
            this._joint.links = spec.links;
        }
    }


    // As of 16 Feb, we create a graph (in Systo notation) for the *whole* KB (in AKT.Kb()) when the KB is 
    // first loaded, rather than creating it for each diagram.   Then, when we need to create
    // a diagram, we simply get the subset of nodes and arcs from the full-KB graph.
    makeSubgraph = function (searchExpression) {
        // kb.getStatements(filtering by causal and searchExpression)
        
        var kbId = AKT.state.current_kb;
        var kb = AKT.KBs[kbId];

        var systo = {nodes:{},arcs:{}};  // This is the subgraph, for this diagram.

        var statements = kb.findStatements({att_value:false,comparison:false,topic:true,topic_value:searchExpression});
        for (var id in statements) {
            var arc = kb._systo.arcs[id];
            if (arc) {
                systo.arcs[id] = arc;
                systo.nodes[arc.start_node_id] = arc.start_node;
                systo.nodes[arc.end_node_id] = arc.end_node;
            }
        }
        console.log('diagram systo: ',systo);

        this._systo = systo;
        this._joint = this.convertSystoToJoint();
        console.log(this);
    }

    convertCausalToSysto = function (searchExpression) {
        // kb.getStatements(filtering by causal and searchExpression)
        
        var kbId = AKT.state.current_kb;
        var kb = AKT.KBs[kbId];
        var arcs = {};
        var systo = this._systo;
        var statements = kb.findStatements({att_value:false,comparison:false,topic:true,topic_value:searchExpression});
        for (var id in statements) {
            // Put this as a method in Statement class.
            var json = statements[id].json;
            var result = processStatement(json);
            if (result && typeof result.start_node_id === 'string' && typeof result.end_node_id === 'string') {            
                systo.arcs[id] = result;
                //console.log('\n',id,JSON.stringify(json),result);
            }
        }
        console.log('systo.arcs: ',systo.arcs);

        for (var id in systo.arcs) {
            var arc = systo.arcs[id];
            // We automatically get rid of duplicates, since there is only 1 instance for each node key.
            // OK, so we are unnecessarily duplicating some work, but it doesn't matter...).
            systo.nodes[arc.start_node_id] = {type:'object', label:arc.start_node_id.replace(/_/g,'\n'),
                centrex:Math.round(800*Math.random()), centrey:Math.round(400*Math.random())};
            systo.nodes[arc.end_node_id] = {type:'object', label:arc.end_node_id.replace(/_/g,'\n'),
                centrex:Math.round(800*Math.random()), centrey:Math.round(400*Math.random())};
        }
        this._systo = systo;
        this._joint = this.convertSystoToJoint();
        kb._diagrams.acheampong_from_causal = this._joint;
        console.log(this);
                

        function processStatement(json) {
            //console.log(json);
            if (json[0] !== 'if') {
                var result = processMain(json);
            } else {
                result = processMain(json[1]);
            }
            return result;
        }

        function processMain(json) {
            if (json[0] === 'causes1way') {
                var startNodeId = processCausalPart(json[1]);
                var endNodeId = processCausalPart(json[2]);
                return {start_node_id:startNodeId,end_node_id:endNodeId};
            } else if (json[0] === 'causes2way') {  // Separate, since might handle bi-directional aspect sometime...
                var startNodeId = processCausalPart(json[1]);
                var endNodeId = processCausalPart(json[2]);
                return {start_node_id:startNodeId,end_node_id:endNodeId};
            } else {
                return null;
            }
        }

        function processCausalPart(json) {
            if (typeof json === 'string') {
                return json;
            } else if (json[0] === 'att_value') {
                var arg1 = processArg1(json[1]);
                var attribute = json[2];
                return arg1+'_'+attribute;
            } else if (json[0] === 'process') {
                var arg1 = processArg1(json[1]);
                if (json[2]) {
                    var attribute = json[2];
                    return arg1+'_'+attribute;
                } else {
                    return arg1;
                }
            } else if (json[0] === 'action') {
                var arg1 = processArg1(json[1]);
                var attribute = json[2];
                return arg1+'_'+attribute;
            }
        }

        // Obviously, unnecessary duplication, since different predicates are handled
        // using the same code, allowing for 1 to 3 arguments.  Left as it is in case
        // someone decides to handle each of the 4 cases differently.

        function processArg1(json) {
            if (typeof json === 'string') {
                return json;   // It's a simple object
            } else if (json[0] === 'part') {
                return json[1]+'_'+json[2];
            } else if (json[0] === 'process') {
                if (json.length === 2) {
                    return processArg1(json[1]);
                } else if (json.length === 3) {
                    return processArg1(json[1])+'_'+json[2];
                } else if (json.length === 4) {
                    return processArg1(json[1])+'_'+json[2]+'_'+json[3];
                }
            } else if (json[0] === 'action') {
                if (json.length === 2) {
                    return json[1];
                } else if (json.length === 3) {
                    return json[1]+'_'+json[2];
                } else if (json.length === 4) {
                    return json[1]+'_'+json[2]+'_'+json[3];
                }
            }
        }
    }


    convertSystoToCausal = function () {

    }


    convertSystoToSpringy = function () {
        var springy = {nodes:[],edges:[]};
        for (nodeId in this._systo.nodes) {
            //var systoNode = this._systo.nodes[id];
            springy.nodes.push(nodeId);
        }
        for (arcId in this._systo.arcs) {
            //var systoNode = this._systo.nodes[id];
            springy.arcs.push(arcId);
        }

        // Still trying to decide if conversion methods change Diagram instance state!
        this._springy = springy;
        return springy;
    }


    // This is not really a conversion, since it is only used to get systoNode.centrex/centrey
    // values to populate the systoNode instance.

    convertSpringyToSysto = function () {
        var systo = this._systo;
        var springy = this._springy;
        for (var i=0; i<springy.node.length; i++) {
            systo.centrex = springy.nodes[i].position.x;
            systo.centrey = springy.nodes[i].position.y;
        }
        
        // Still trying to decide if conversion methods change Diagram instance state!
        this._systo = systo;
        return systo;

    }


    convertJointToSysto = function () {
        var joint = this._joint;

        var systo = {};
        systo.meta = {
            id: this._id,
            name: 'no_name',
            language: 'systo',
            author: 'Robert Muetzelfeldt',
            title: 'no_title',
            description: 'no_description'
        };

        systo.nodes = {};
        $.each(joint.nodes, function(i,jointNode) {
            var systoNodeId = jointNode.attrs.label.text.replace(/\n/g,"_").replace(/__/g,"_");
            var systoNode = {
                type: 'object',
                label: jointNode.attrs.label.text,
                centrex: jointNode.position.x,
                centrey: jointNode.position.y
            };
            systo.nodes[systoNodeId] = systoNode;
        });

        systo.arcs = {};
        $.each(joint.links, function(i,jointLink) {
            var startNodeId = getNodeIdFromJointNodeId(joint.nodes,jointLink.source.id);
            var endNodeId = getNodeIdFromJointNodeId(joint.nodes,jointLink.target.id);
            var systoArc = {
                type: jointLink.mytype,
                start_node_id: startNodeId.replace(/\n/g,"_").replace(/__/g,"_"),
                end_node_id: endNodeId.replace(/\n/g,"_").replace(/__/g,"_")
            };
            var temp = startNodeId + '_TO_' + endNodeId;
            var systoArcId = temp.replace(/\n/g,"_").replace(/__/g,"_");
            systo.arcs[systoArcId] = systoArc;
        });

        this._systo = systo;
        console.log(JSON.stringify(this._systo));

        function getNodeIdFromJointNodeId(jointNodes,jointNodeId) {
            for (var i=0; i<jointNodes.length; i++) {
                var jointNode = jointNodes[i];
                if (jointNode.id === jointNodeId) {
                    var result = jointNode.attrs.label.text;
                    return result;
                }
            }
        }
    }

    convertSystoToJoint = function () {
        
        var systo = this._systo;
/*
        var systox = this._systox;
        for (var nodeId in systox.nodes) {
            var nodex = systox.nodes[nodeId];
            var node = systo.nodes[nodeId];
            console.log(nodeId,'\n',nodex.centrex,nodex.centrey,'\n',node.centrex,node.centrey);
        }
        for (var arcId in systox.arcs) {
            var arcx = systox.arcs[arcId];
            var arc = systo.arcs[arcId];
            console.log(arcId,'\n',arcx.start_node_id,arcx.end_node_id,'\n',arc.start_node_id,arc.end_node_id);
        }
*/

        var joint = {};

        joint.nodes = [];
        for (var systoNodeId in systo.nodes) {
            var systoNode = systo.nodes[systoNodeId];
            var jointNode = jointNodeTemplate(systoNode.type);
            jointNode.id = systoNodeId;
            jointNode.attrs.label.text = systoNode.label.replace(/_/g,'\n');
            jointNode.position = {x:systoNode.centrex,y:systoNode.centrey};
            joint.nodes.push(jointNode);
        }

        joint.links = [];  // "links" in JointJS, "arcs" in Systo
        for (var systoArcId in systo.arcs) {
            var systoArc = systo.arcs[systoArcId];
            var jointLink = jointLinkTemplate('causes');
            jointLink.id = systoArcId;
            jointLink.source = {id:systoArc.start_node_id};
            jointLink.target = {id:systoArc.end_node_id};
            joint.links.push(jointLink);
        }
        this.joint = joint;   // TODO: change to this._joint when tested!
        return joint;

        function jointNodeTemplate(type) {
            var templates = {};

            templates.object = {
                type:'standard.Rectangle',
                attrs:{
                    body:{
                        refWidth:'100%', 
                        refHeight:'100%', 
                        strokeWidth:2, 
                        stroke:'brown', 
                        fill:'#FFFFFF'
                    },
                    label:{
                        textVerticalAnchor:'top', 
                        textAnchor:'left', 
                        refX:4, 
                        refY:3, 
                        fontSize:8, 
                        fill:'#333333', 
                        style:{
                            stroke:'black',
                            strokeWidth:0.3
                        }
                    },
                    text:{}
                },
                size:{
                    width:50,
                    height:35
                },
                angle:0,
                z:1,
                mytype: systoNode.type
            };

            templates.process = {
                type:'standard.Ellipse',
                attrs:{
                    body:{
                        refCx:'50%',
                        refCy:'50%',
                        refRx:'50%',
                        refRy:'50%',
                        strokeWidth:2,
                        stroke:'#00ff00',
                        fill:'white'
                    },
                    label:{
                        textVerticalAnchor:'middle',
                        textAnchor:'middle',
                        refX:'50%',
                        refY:'50%',
                        fontSize:10,
                        fill:'#333333'
                    },
                    text:{}
                },
                size:{
                    width:65,
                    height:45
                },
                angle:0,
                z:17
            };

            templates.action = {
                type:'examples.CustomRectangle',
                attrs:{
                    body:{
                        rx:10,
                        ry:10,
                        strokeWidth:2,
                        fill:'white',
                        stroke:'blue',
                        refWidth:'100%',
                        refHeight:'100%'
                    },
                    label:{
                        textAnchor:'left',
                        refX:10,
                        fill:'black',
                        fontSize:10,
                        textVerticalAnchor:'middle',
                        refY:'50%'
                    },
                    text:{}
                },
                position:{
                    x:468,
                    y:378
                },
                size:{
                    width:60,
                    height:35
                },
                angle:0,
                z:18
            };
            return templates[type];
        }

        function jointLinkTemplate(type) {
            var templates = {};

            templates.causes = {
                attrs:{
                    line:{
                        connection:true,
                        stroke:'#dd0000',
                        strokeWidth:2,
                        strokeLinejoin:'round',
                        targetMarker: {
                            type:'path',
                            d:'M 12 -6 0 0 12 6 Z',
                            fill:'#dd0000',
                            stroke:'none'
                        }
                    },
                    wrapper:{
                        connection:true,
                        strokeWidth:10,
                        strokeLinejoin:'round'
                    }
                },
                along:0.5,
                smooth:true,
                z:-1,
                mytype:'causes1way',
            };
            return templates[type];
        }

    }


// ================================================================================================
// Springy

/* This is what a springyGraphJSON looks like...
springyGraphJSON = {
  "nodes": ["mark", "higgs", "other", "etc"],
  "edges": [
    ["mark", "higgs"],
    ["mark", "etc"],
    ["mark", "other"]
  ]
};
*/

    graphLayoutSpringy = function (widget) {

        alert('Please close this popup window, then wait for the diagram to appear.\nThis could take anything from a few seconds to 30 seconds or more, depending on the complexity of the diagram and the speed of the computer you are using.');
        var self = this;

        var springyGraphJson = {nodes:[],edges:[]};
        for (var nodeId in self._systo.nodes) {
            springyGraphJson.nodes.push(nodeId);
        }
        for (var arcId in self._systo.arcs) {
            var arc = self._systo.arcs[arcId];
            springyGraphJson.edges.push([arc.start_node_id,arc.end_node_id]);
        }
        console.log(springyGraphJson);
        var springyGraph = new Springy.Graph();
        springyGraph.loadJSON(springyGraphJson);

        var layout = new Springy.Layout.ForceDirected(
          springyGraph,
          50.0, // Spring stiffness
          400.0, // Node repulsion
          0.5, // Damping
          1 // Threshold used to determine render stop (default is 0.01)
        );

        var renderer = new Springy.Renderer(
          layout,
          function clear() {
          },
          function drawEdge(edge, p1, p2) {
          },
          function drawNode(node, p) {
            node.p = p;
          },
          function done() {
            console.log(springyGraph.nodes);
            var systo = self._systo;
            var xmin = 0;
            var xmax = 0;
            var ymin = 0;
            var ymax = 0;
            for (var i=0; i<springyGraph.nodes.length; i++) {
                xmin = springyGraph.nodes[i].p.x < xmin ? springyGraph.nodes[i].p.x : xmin;
                xmax = springyGraph.nodes[i].p.x > xmax ? springyGraph.nodes[i].p.x : xmax;
                ymin = springyGraph.nodes[i].p.y < ymin ? springyGraph.nodes[i].p.y : ymin;
                ymax = springyGraph.nodes[i].p.y > ymax ? springyGraph.nodes[i].p.y : xmax;
            }
            var xscale = 1200/(xmax-xmin);
            var yscale = 500/(ymax-ymin);
            console.log('scaling: ',xmin,xmax,xscale,' : ',ymin,ymax,yscale);
            if (xscale > 25) xscale = 25;
            if (yscale > 20) yscale = 20;
            for (var i=0; i<springyGraph.nodes.length; i++) {
                var systoNodeId = springyGraph.nodes[i].id;
                systo.nodes[systoNodeId].centrex = Math.round(xscale*(springyGraph.nodes[i].p.x-xmin));
                systo.nodes[systoNodeId].centrey = Math.round(yscale*(springyGraph.nodes[i].p.y-ymin));
                console.log(systo.nodes[systoNodeId].centrex,systo.nodes[systoNodeId].centrey);
            }
            console.log('Layout completed');
            self._systo = systo;
            $(widget.element).dialog_Generic('option', 'nodisplay', false);

            return systo;

            
            
/*
            for (var i=0; i<springyGraph.nodes.length; i++) {
                var springyNode = springyGraph.nodes[i];
                systo.nodes[springyNode].centrex = Math.round(40*springyNode.p.x+500);
                systoNode.centrey = Math.round(40*springyNode.p.y+500);
            }
            var graph = new joint.dia.Graph();
            var paper = new joint.dia.Paper({
                el: $('#paper'),
                width: 900,
                height: 600,
                model: graph,
                //defaultConnectionPoint: { name: 'anchor' }
                linkPinning:false   // This is essential for displaying arrowheads when diagram loaded!
            });
            var jointGraph = AKT.makeJointGraph(this._systo);
            var nodes = jointGraph.nodes;
            for (var i=0; i<nodes.length; i++) {
                var node = new joint.shapes.standard.Rectangle(nodes[i]);
                console.debug(node);
                node.addTo(graph);
            }
            var links = jointGraph.links;
            for (var i=0; i<links.length; i++) {
                var link = new joint.shapes.standard.Link(links[i]);
                link.set('akt_id',aktGraph.arcs[i].akt_id);
                console.debug(link);
                //link.set('mytype',mytype);
                //link.set('vertices', [calculateCurveVertexPosition(along, source, target)]);
                link.addTo(graph);
            }
            AKT.saveDiagramToLocalStorage(jointGraph, 'l2')
*/
          },
          function start() {
            AKT.state.layout_counter = 0;
          },
          function frame() {
            AKT.state.layout_counter += 1;
            if (AKT.state.layout_counter % 50 == 0) console.debug(AKT.state.layout_counter);
          }
        );
        renderer.start();
    }


// Cola
/* This is what a cola graph object-literal looks like...
    graph = {
    	nodes: [
	    	{name:'a'},
	    	{name:'b'},
	    	{name:'c'},
	    	{name:'d'},
            .....
	    ],
    	links: [
	    	{source:1, target:2},
    		{source:0, target:1},
            {source:0, target:2},
            {source:2, target:16},
    		{source:1, target:17},
            ...
   	    ]
    };
*/
    graphLayoutCola = function () {
        var self = this;
        var width = 960,
            height = 500;

        var graph = {nodes:[],links:[]};
        var inode = 0;
        var nodeLookup = {};
        for (var nodeId in self._systo.nodes) {
            nodeLookup[nodeId] = inode;
            graph.nodes.push({name:nodeId});
        }
        for (var arcId in self._systo.arcs) {
            var arc = self._systo.arcs[arcId];
            graph.links.push({source:nodeLookup[arc.start_node_id], target:nodeLookup[arc.end_node_id]});
        }

        var cola = AKT.cola.d3adaptor(d3)
            .linkDistance(100)
            .handleDisconnected(true)
            .size([width, height]);

        var svg = d3.select("body").append("svg")
            .attr("width", width)
            .attr("height", height);

        var graphxxx = {
        	nodes: [
	        	{name:'a'},
	        	{name:'b'},
	        	{name:'c'},
	        	{name:'d'},
	        	{name:'e'},
	        	{name:'f'},
	        	{name:'g'},
                {name:'h'},
                {name:'i'},
                {name:'h'},
	        	{name:'i'},

                {name:'j'},
                {name:'k'},
                {name:'l'},
                {name:'m'},
                {name:'n'},
                {name:'o'},
                {name:'p'},


	        ],
        	links: [
	        	{source:1, target:2},
        		{source:0, target:1},
                {source:0, target:2},
                {source:2, target:16},
        		{source:1, target:17},
                {source:16, target:15},
                {source:17, target:15},
                {source:14, target:15},
                {source:14, target:16},
                {source:14, target:16},
                {source:1, target:15},

        		{source:4, target:5},
        		{source:3, target:4},
        		{source:3, target:5},
                {source:13, target:3},
                {source:13, target:5},

                {source:8, target:9},
                {source:9, target:10},
                {source:8, target:10},
                {source:10, target:11},
                {source:11, target:12},
        		{source:12, target:10},

                {source:6, target:7},
        	]
        };

        // packing respects node width and height
        graph.nodes.forEach(function (v) { v.width = 50, v.height = 35 })

        cola
            .nodes(graph.nodes)
            .links(graph.links)
            .avoidOverlaps(true)
            .convergenceThreshold(1e-9)
            .handleDisconnected(true)
            .start(30, 0, 10); // need to obtain an initial layout for the node packing to work with by specifying 30 iterations here
        console.log(graph);
        var systo = self._systo;
        var xmin = 0;
        var xmax = 0;
        var ymin = 0;
        var ymax = 0;
        for (var i=0; i<graph.nodes.length; i++) {
            xmin = graph.nodes[i].x < xmin ? graph.nodes[i].x : xmin;
            xmax = graph.nodes[i].x > xmax ? graph.nodes[i].x : xmax;
            ymin = graph.nodes[i].y < ymin ? graph.nodes[i].y : ymin;
            ymax = graph.nodes[i].y > ymax ? graph.nodes[i].y : xmax;
        }
        var xscale = 800/(xmax-xmin);
        var yscale = 800/(ymax-ymin);
        console.log(xmin,xmax,xscale,ymin,ymax,yscale);
        for (var i=0; i<graph.nodes.length; i++) {
            var systoNodeId = graph.nodes[i].name;
            systo.nodes[systoNodeId].centrex = Math.round(xscale*(graph.nodes[i].x-xmin));
            systo.nodes[systoNodeId].centrey = Math.round(yscale*(graph.nodes[i].y-ymin));
            console.log(graph.nodes[i].x, graph.nodes[i].y, systo.nodes[systoNodeId].centrex, systo.nodes[systoNodeId].centrey);
        }
        console.log('fallow_length: ',systo.nodes.fallow_length.centrex,systo.nodes.fallow_length.centrey);
        self._systo = systo;
        return systo;



        var link = svg.selectAll(".link")
            .data(graph.links)
            .enter().append("line")
            .attr("class", "link")
            .style("stroke-width", 3);

        var node = svg.selectAll(".node")
            .data(graph.nodes)
          .enter().append("circle")
            .attr("class", "node")
            .attr("r", 45)
            //.style("fill", function (d) { return color(d.group); })
            .call(cola.drag);

        node.append("title")
            .text(function (d) { return d.name; });

        cola.on("tick", function () {
            link.attr("x1", function (d) { return d.source.x; })
                .attr("y1", function (d) { return d.source.y; })
                .attr("x2", function (d) { return d.target.x; })
                .attr("y2", function (d) { return d.target.y; });

            node.attr("cx", function (d) { return d.x; })
                .attr("cy", function (d) { return d.y; });
            cola.stop();
        });

    }

}
