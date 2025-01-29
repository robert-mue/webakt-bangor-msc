AKT.menus = [
    {id:'file', caption:'File', status:'live', submenu:[
        {id:'file_newkb', caption:'New KB', status:'live'},
        {id:'file_openkb', caption:'Open KB', status:'file'},
        {id:'file_savekb', caption:'Save KB', status:'file'},
        {id:'file_separator1', caption:'==============', status:'inactive'},
        {id:'file_playback', caption:'Playback', status:'live'},
        {id:'file_user', caption:'User name', status:'live'}]},

    {id:'kb', caption:'KB', status:'live', submenu:[
        {id:'kb_dummy', caption:'', status:'inactive',
            comment:'For some weird reason, this is needed to get the submenus for kb_selectkb to open up!'},
        {id:'kb_selectkb', caption:'Select KB >', status:'active', submenu:[
            {id:'kb_selectkb_atwima', caption:'Atwima', status:'live'},
            {id:'kb_selectkb_ego', caption:'Ego', status:'live'}]},
        {id:'kb_separator1', caption:'==============', status:'inactive'},
        {id:'kb_metadata', caption:'Metadata', status:'live'},
        {id:'kb_statements', caption:'Statements', status:'live'},
        {id:'kb_formalterms', caption:'Formal terms', status:'live'},
        {id:'kb_objecthierarchies', caption:'Object hierarchies', status:'live'},
        {id:'kb_topics', caption:'Topics', status:'live'},
        {id:'kb_topichierarchies', caption:'Topic hierarchies', status:'live'},
        {id:'kb_sources', caption:'Sources', status:'live'},
        {id:'kb_images', caption:'Images', status:'live'},
        {id:'kb_separator2', caption:'==============', status:'inactive'},
        {id:'kb_booleansearch', caption:'Boolean Search', status:'live'},
        {id:'kb_separator1', caption:'==============', status:'inactive'},
        {id:'kb_filejson', caption:'View JSON', status:'live'}
    ]},

    {id:'diagram', caption:'Diagram', status:'live', submenu:[
        {id:'diagram_newdiagram', caption:'New diagram', status:'live'},
        {id:'diagram_fromtopic', caption:'Diagram from Topic', status:'live'},
        {id:'diagram_hidediagram', caption:'Hide Diagrams', status:'inactive'},
        '-----',
        {id:'diagram_copydiagram', caption:'Copy Diagram', status:'inactive'},
        '-----',
        {id:'diagram_savediagramasnewkb', caption:'Save diagram as new KB', status:'inactive'},
        '-----',
        {id:'diagram_deletediagram', caption:'Delete Diagram', status:'inactive'},
        {id:'diagram_delete_all_diagrams', caption:'Delete All Diagrams', status:'inactive'},
        '-----',
        {id:'diagram_fonts', caption:'Fonts', status:'inactive'}]},

    {id:'tools', caption:'Tools', status:'live', submenu:[
        {id:'tools_useatool', caption:'Use a Tool', status:'live'},
        {id:'tools_toolmontage', caption:'Tool Montage', status:'inactive'},
        {id:'tools_loadtoolfile', caption:'Load Tool File', status:'inactive'},
        {id:'tools_makeatool', caption:'Make a Tool >', status:'inactive', submenu:[
            {id:'tools_makeatool_newtoolfile', caption:'New Tool File...', status:'inactive'},
            {id:'tools_makeatool_opentoolfile', caption:'Open Tool File... >', status:'inactive'}]},
        {id:'tools_closetoolfile', caption:'Close Tool File...', status:'inactive'},
        '-----',
        {id:'tools_selecttooloutputmode', caption:'Select Tool Output Mode', status:'inactive'},
        '-----',
        {id:'tools_toollist', caption:'Tool List', status:'inactive'},
        '-----',
        {id:'tools_fonts', caption:'Fonts', status:'inactive'}]},

    {id:'maps', caption:'Map', status:'active', submenu:[]},

    {id:'help', caption:'Help', status:'active', submenu:[
        {id:'help_help', caption:'Help', status:'inactive'},
        {id:'help_aide', caption:'Aide', status:'inactive'},
        {id:'help_ayuda', caption:'Ayuda', status:'inactive'},
        '-----',
        {id:'help_aktwebsite', caption:'AKT web site', status:'inactive'},
        '-----',
        {id:'help_aboutakt', caption:'About AKT...', status:'inactive'}]}];







