// Images
// TODO: change 'source' to 'image' wherever 'source' occurs.
// TODO: change HTML element IDs to meaningfully-named classes.

AKT.widgets.images = {};

AKT.widgets.images.settings = {width:'500px',height:'300px'};


AKT.widgets.images.setup = function (widget) {
    var widgetContent = $(widget.element).find('.content');

    var widgetSettings = $('<div></div>');
    $(widget.element).append(widgetSettings);

    var kbSelectElement = AKT.makeReprocessSelector(widget.element, widget.widgetName,
        'Knowledge base', AKT.getKbIds(), AKT.state.current_kb, 'kbId');
    $(widgetContent).prepend(kbSelectElement);

};


AKT.widgets.images.display = function (widget) {

    var kbId = widget.options.kbId;
    var kb = AKT.KBs[kbId];

    var widgetContent = $(widget.element).find('.content');

    var images = kb.findImages();
    var nImages = Object.keys(images).length;

    //AKT.loadSelectOptions(widgetContent, 'select_images', images, ['id','id']);


    // EVENT HANDLERS
    $(widgetContent).find('.button_details').on('click', function (event) {
        console.debug(widget.options);
        var kbId = widget.options.kbId;
        var kb = AKT.KBs[kbId];
        console.debug('BUTTON: Clicked on image Details button');
        event.stopPropagation();

        //var id = $(widgetContent).find('.select_images').val();
        var id = widget.options.current_id;
        console.debug(id);
        var image = kb._images[id];   // The object, not the image itself.
        console.debug(id);

        var panel = new Panel('dialog_Generic', 
            event.shiftKey, 
            {left:'400px',top:'20px',width:'500px',height:'440px'}, 
            {widget_name:'image_details', kbId:kbId, image:image});
       
        //$('#dialog_SourceDetails').dialog_SourceDetails();
    });


    // This also uses the image_details widgelet, but with no 'image' option
    // whenit is opened.   
    $(widgetContent).find('.button_new').on('click', function (event) {
        var kbId = widget.options.kbId;
        var kb = AKT.KBs[kbId];
        console.log('BUTTON: Clicked on image New button');
        event.stopPropagation();

        var panel = new Panel('dialog_Generic', 
            event.shiftKey, 
            {left:'400px',top:'20px',width:'470px',height:'440px'}, 
            {widget_name:'image_details', kbId:kbId});   // Note: no 'image' option.
       
        //$('#dialog_SourceDetails').dialog_SourceDetails();
    });


    $(widget.element).draggable({containment:'#workspace',handle:".titlebar"});
    $(widget.element).css({display:'block'});

    for (var id in kb._images) {
        var image = kb._images[id];
        var caption = image._caption
        var divImage = $('<div class="div_image" data-id="'+id+'" style="float:left; border:solid 4px #d0d0d0;margin:1px;" title="'+caption+'"></div>');
        var imgImage = $('<img class="img_image" crossorigin="anonymous" style="width:150px; height:150px;border:solid 1px black"></img>');
        var divId = $('<div style=width:150px;height:14px;>'+id+'</div>');
        var divLabel = $('<div style=width:150px;height:48px;line-height:12px;>'+caption.substr(0,65)+'...</div>');
        $(divImage).append(imgImage).append(divId).append(divLabel);
        $(widget.element).find('.div_images').append(divImage);
        //var url = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR33JS988Kp1SL184AFRpm1uVCV7p2s4d1zew&usqp=CAU';
        //var url ='https://live.staticflickr.com/65535/51133666863_4fce15b5aa_z.jpg';
        var url = image._url;
        $(imgImage).attr('src',url);

        $(divImage).on('click', function (event) {
            console.log($(this));
            event.stopPropagation();
            $(widget.element).find('.div_image').css({border:'solid 4px #d0d0d0'});
            $(this).css({border:'solid 4px blue'});
            widget.options.current_id = $(this).data('id');
            console.log(widget.options);
        });
    }

};


AKT.widgets.images.html = `
<div class="content" style="padding:6px;border:none;">

    <div style="margin-top:7px;margin-left:0x;">
        <button class="button_details" style="float:left;width:60px;height:30px;">Details</button>
        <button class="button_new" disabled style="float:left;margin-left:10px;width:60px;height:30px;">New</button>
        <button class="button_delete" disabled style="float:right;width:60px;height:30px;">Delete</button>
        <div style="clear:both;"></div>
    </div>


    <div class="div_images" style="width:510px;height:500px; margin-top:10px;border:solid 1px black; overflow-y:auto;"></div>
`;




