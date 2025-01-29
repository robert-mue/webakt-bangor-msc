AKT.widgets.image_details = {};


AKT.widgets.image_details.settings = {width:'400px',height:'440px'};


AKT.widgets.image_details.setup = function (widget) {
};


AKT.widgets.image_details.display = function (widget) {
    console.log(widget.options);
    var kbId = widget.options.kbId;
    var kb = AKT.kbs[kbId];
    var image = widget.options.image; 
    console.debug(widget.options);

    var widgetContent = $(widget.element).find('.content');

    // SETUP
    // The use of 'private' properties is a temporary hack...
    if (image) {
        console.log(image);
        $(widgetContent).find('.div_id').text(image._id);
        $(widgetContent).find('.div_url').text(image._url);
        $(widgetContent).find('.div_caption').text(image._caption);
        $(widgetContent).find('.img_image').attr('src',image._url);


    } else {         // TODO: Fix this later...
        $(widgetContent).find('.div_name').text('');
        $(widgetContent).find('.div_location').text('');
        $(widgetContent).find('.div_year').text('');
        $(widgetContent).find('.div_suffix').text('');
        $(widgetContent).find('.div_interviewer').text('');
        $(widgetContent).find('.div_interviewee').text('');
        $(widgetContent).find('.input_day').val('');
        $(widgetContent).find('.input_month').val('');
    }


    $(widgetContent).find('.button_load').on('click', function (event) {
        var url = $(widgetContent).find('.div_url').text();
        $(widgetContent).find('.img_image').attr('src',url);
        console.log('clicked on image-load',url);
    });


    $(widgetContent).find('.button_save').on('click', function (event) {
        console.log('clicked on image-save');
    });


};


AKT.widgets.image_details.html = `
<div class="content" style="border:none;padding:15px;">
    <fieldset style="float:left;">
        <div style="float:left;width:70px;">ID</div>
        <div class="div_id" contenteditable style="float:left;overflow:hidden;height:20px;width:200px;background:white;border:solid 1px black;padding-left:5px;"></div><br/>

        <div style="float:left;width:70px;margin-top:7px;">URL</div>
        <div class="div_url" contenteditable style="float:left; word-wrap:break-word; overflow:auto; height:70px; width:250px; background:white; border:solid 1px black;padding-left:5px;margin-top:7px;"></div><br/>

        <div style="float:left;width:70px;margin-top:7px;">Caption</div>
        <div class="div_caption" contenteditable style="float:left;overflow:auto;height:120px;width:250px;background:white;border:solid 1px black;padding-left:5px;margin-top:7px;"></div><br/>
    </fieldset>

    <img class="img_image" crossorigin="anonymous" style="float:left;width:300px;height:300px;margin:10px;border:solid 1px black"></img>

    <div style="clear:both;"></div>

    <button class="button_save" disabled style="float:right;height:25px;width:40px;margin-right:20px;margin-bottom:20px;">Save</button>
    <button class="button_load" disabled style="float:right;height:25px;width:40px;margin-right:20px;margin-bottom:20px;">Load</button>


</div>     <!-- End of content div -->
`;



