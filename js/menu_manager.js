// Menu management
// menu_manager.js
// Robert Muetzelfeldt
// Re-organised into this file June 2021

// This holds generic code for webAKT's menu system.
// processMenus() is responsible from building up the menu HTML (nested <ul> and <li>
// elements) from the compact object defining the menu structure in menus.js.
// menusClickHandler processes clicks on any menu item, including calling
// specific menu commands (usually leaf items in the menu) held in menu_handlers.js.



AKT.processMenus = function () {
    var menus = AKT.menus;
    element = $('<nav class="menus-menubar"></nav>');
    menuHtml = AKT.processOneLevel(menus, element, 0);   
    $('#menus').prepend(menuHtml);

    $('#button_tutorial_play').on('click',function () {
        var secs = parseFloat($('#input_interval').val());
        secs = secs<0.1 ? 0.1 : secs;
        secs = secs>10  ? 10  : secs;
        var millisecs = Math.round(1000*secs);  // Timer works in 1000ths of a second
        var tutorialId = $('#listbox_tutorials').val();
        var rawSteps = AKT.tutorials[tutorialId];
        AKT.steps = [];
        for (var i=0; i<rawSteps.length; i++) {
            var step = rawSteps[i];
            if ($(checkbox_pause).is(':checked') || step.eventType !== 'pause') {
                AKT.steps.push(step);
            }
        }
        AKT.timer = setInterval(AKT.singleStep,millisecs);
    });

    $('#button_ui_test').on('click',function () {
        var secs = parseFloat($('#input_interval').val());
        secs = secs<0.1 ? 0.1 : secs;
        secs = secs>10  ? 10  : secs;
        var millisecs = Math.round(1000*secs);  // Timer works in 1000ths of a second
        var tutorialId = $('#listbox_tutorials').val();
        var rawSteps = AKT.tutorials[tutorialId];
        AKT.steps = [];
        for (var i=0; i<rawSteps.length; i++) {
            var step = rawSteps[i];
            if ($(checkbox_pause).is(':checked') || step.eventType !== 'pause') {
                AKT.steps.push(step);
            }
        }
        AKT.runTest();
    });

    $('#button_ui_store').on('click',function () {
        localStorage.setItem('event_records',JSON.stringify(AKT.event_records));
    });

/*  August 2022
     FILE SYSTEM ACCESS API
    https://web.dev/file-system-access/#deleting-files-and-folders-in-a-directory 
    Private: Steiner.Thomas [AT] gmail [DOT] com
    Work: tomac [AT] google [DOT] com 
    I emailed him and got a great response 11 Aug 2022
    See also: https://fjolt.com/article/javascript-new-file-system-api
    (though he mistakingly calls it the "File Access API")
    See also: https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API
    See also:https://css-tricks.com/getting-started-with-the-file-system-access-api/
*/

    // This handles the loading of a KB from a local file, using the File System Access API.
    let el1 = document.getElementById('menu_file_openkb');
    el1.addEventListener('click', async () => {
      const options = {
        types: [
          {
            description: 'AKT KB files',
            accept: {
              'text/json': ['.kb'],
            },
          },
        ],
      };
      [fileHandle] = await window.showOpenFilePicker(options);
      const file = await fileHandle.getFile();
      const contents = await file.text();

      var kbId = fileHandle.name;
      var kb = new Kb({name:kbId,kb_from_file:JSON.parse(contents)});
      kb._metadata.file = fileHandle.name;  // Same as kbId! - but could be different in future, perhaps.
      AKT.KBs[kbId] = kb;

      $('#menu_kb_selectkb').find('ul').append(
          '<li id="menu_kb_selectkb_'+kbId+'" class="menus-dropdown submenu leaf live" style="background:rgb(212,208,200);">'+
              '<a href="#" style="background: rgb(212, 208, 200); color: rgb(0, 0, 0);">'+kbId+'</a>'+
          '</li>');
      AKT.changeKb(kbId);

    });

    // This handles the saving of a KB to local file, using the File System Access API.
    let el2 = document.getElementById('menu_file_savekb');
    el2.addEventListener('click', async () => {

      var kbId = AKT.state.current_kb;
      var kb = AKT.KBs[kbId];

      var kbObjectToSave = kb.generateJsonFromKb();
      console.log(kbObjectToSave);
      var kbStringToSave = JSON.stringify(kbObjectToSave,null,4);

      const options = {
        suggestedName: 'untitled.kb',
        types: [
          {
            description: 'AKT KB files',
            accept: {
              'text/json': ['.kb'],
            },
          },
        ],
      };
      const fileHandle = await window.showSaveFilePicker(options);
      console.log('save filename:',fileHandle.name);
      // Do something with the file handle.
      const file = await fileHandle.getFile();
      // fileHandle is an instance of FileSystemFileHandle..
      // Create a FileSystemWritableFileStream to write to.
      const writable = await fileHandle.createWritable();
      // Write the contents of the file to the stream.
      const stringToSave = JSON.stringify(kbObjectToSave,null,4);
      await writable.write(stringToSave);
      // Close the file and write the contents to disk.
      await writable.close();
    });

};


AKT.processOneLevel = function (menus, element, level) {
    level += 1;
    if (level === 1) {
        var ul = $('<ul></ul>');
    } else {
        ul = $('<ul class="menus-dropdown-menu submenu"></ul>');
    }
    $(element).append(ul);
    for (var i=0; i<menus.length; i++) {
        var menu = menus[i];
        if (menu !== '-----') {
            if (level === 1) {
                //var li = $('<li id="menu_'+menu.id+'" class="menus-dropdown"><a href="#">'+menu.caption+'</a></li>');
                if (menu.status === 'inactive') {
                    var li = $('<li id="menu_'+menu.id+'" class="menus-dropdown inactive"><a href="#">'+menu.caption+'</a></li>');
                } else if (menu.status === 'live') {
                    var li = $('<li id="menu_'+menu.id+'" class="menus-dropdown live" style="margin-left:5px; background:#d4d0c8;"><a href="#">'+menu.caption+'</a></li>');
                } else {
                    var li = $('<li id="menu_'+menu.id+'" class="menus-dropdown active"><a href="#">'+menu.caption+'</a></li>');
                }
            } else {
                if (menu.submenu) {
                    //var li = $('<li id="menu_'+menu.id+'" class="menus-dropdown submenu"><a href="#">'+menu.caption+'</a></li>');
                    if (menu.status === 'inactive') {
                        var li = $('<li id="menu_'+menu.id+'" class="menus-dropdown submenu inactive"><a href="#">'+menu.caption+'</a></li>');
                    } else if (menu.status === 'live') {
                        var li = $('<li id="menu_'+menu.id+'" class="menus-dropdown submenu live" style="background:#d4d0c8;"><a href="#">'+menu.caption+'</a></li>');
                    } else if (menu.status === 'file') {
                        var li = $('<li id="menu_'+menu.id+'" class="menus-dropdown submenu live" style="background:yellow;"><a href="#">'+menu.caption+'</a></li>');
                    } else {
                        var li = $('<li id="menu_'+menu.id+'" class="menus-dropdown submenu active"><a href="#">'+menu.caption+'</a></li>');
                    }
                } else {
                    if (menu.status === 'inactive') {
                        var li = $('<li id="menu_'+menu.id+'" class="menus-dropdown submenu leaf inactive"><a href="#">'+menu.caption+'</a></li>');
                    } else if (menu.status === 'live') {
                        var li = $('<li id="menu_'+menu.id+'" class="menus-dropdown submenu leaf live" style="background:#d4d0c8;"><a href="#">'+menu.caption+'</a></li>');


                    } else if (menu.status === 'file') {
//                        var li = $('<li id="menu_'+menu.id+'" class="menus-dropdown submenu leaf live"><div style="margin-left:5px; height:16px;" onclick="document.getElementById(\'getFile\').click()">'+menu.caption+'</div><input type="file" id="getFile" style="display:none"></input></li>');
//                        var li = $('<li id="menu_'+menu.id+'" class="menus-dropdown submenu leaf live"><div style="margin-left:5px; height:16px;" onclick="document.getElementById(\'getFile\').click()">'+menu.caption+'</div><input type="file" id="getFile" style="display:none"></input></li>');
                        var li = $('<li id="menu_'+menu.id+'" class="menus-dropdown submenu leaf live"><div style="margin-left:5px; height:16px;">'+menu.caption+'</div><input type="file" id="getFile" style="display:none"></input></li>');



/*
 -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
  background: url('https://cdn1.iconfinder.com/data/icons/hawcons/32/698394-icon-130-cloud-upload-512.png') center center no-repeat #e4e4e4;
  border-radius: 20px;
  background-size: 60px 60px;
*/


                    } else {
                        var li = $('<li id="menu_'+menu.id+'" class="menus-dropdown submenu leaf active"><a href="#">'+menu.caption+'</a></li>');
                    }
                }

            }
            $(ul).append(li);
            //if (menu.submenu && menu.submenu.length>0) {
            if (menu.submenu) {
                AKT.processOneLevel(menu.submenu, li, level);
            }
        }
    }


    if (level === 1) {
        $(ul).append('<li><span style="padding-left:30px;font-weight:bold;">webAKT</span>&nbsp;&nbsp;&nbsp;<span>Current KB: </span><span id="current_kb_title" style="color:blue;font-weight:bold;">'+AKT.state.current_kb_title+'</span></li>');
    }

    // This is ugly.   It adds non-menu stuff (zooming, tutorial mechanism) to the menubar.
    // Added in hastily prior to Bangor Feb 2022 MSc practical.
    // Tutorial stuff should be moved to another menu, possibly File, or its own menu.
    if (level === 99) {    // Disabled, until it's resolved properly.
        $(ul).append('<button id="zoom_out" style="margin-left:30px;width:30px;font-weight:bold;">-</button>');
        $(ul).append('<button id="zoom_in" style="width:30px;font-weight:bold;">+</button>');
        $(ul).append('<button id="search" style="width:50px;margin-left:10px;" onclick="javascript:(function() {s = document.getSelection(); open(\'https://google.com/search?q=\'+s,\'Fred\',\'popup\').focus();})();">Search</button>');
        $(ul).append('<span style="margin-left:15px;margin-right:4px;">Tutorials</span>');
        $(ul).append('<select id="listbox_tutorials">'+
            '<option selected value="tour_metadata_and_statements">Tour 1&2: Metadata and statements</option>'+
            '<option value="tour_formal_terms">Tour 3: Formal terms</option>'+
            '<option value="tour_object_hierarchies">Tour 4: Object hierarchies</option>'+
            '<option value="tour_topics">Tour 5: Topics</option>'+
            '<option value="tour_topic_hierarchies">Tour 6: Topic hierarchies</option>'+
            '<option value="tour_sources">Tour 7: Sources</option>'+
            '<option value="tour_boolean_search">Tour 8: Boolean search</option>'+
            '</select>');
        $(ul).append('<button id="button_tutorial_play" style="margin-left:7px;width:30px;">Play</button>');
        $(ul).append('<span style="margin-left:15px;margin-right:4px;">Pause</span>');
        $(ul).append('<input type="checkbox" id="checkbox_pause" checked="false"></input>');
        $(ul).append('<span style="margin-left:15px;margin-right:4px;">Interval</span>');
        $(ul).append('<input type="text" id="input_interval" style="width:30px;padding-right:4px;text-align:right;" value="0.1"></input>');
        $(ul).append('<span style="margin-left:4px;">secs</span>');
        $(ul).append('<button id="button_ui_test" style="margin-left:7px;width:25px;">Test</button>');
        $(ul).append('<button id="button_ui_store" style="margin-left:7px;width:25px;">Store</button>');

    }
    return element;
};

      

AKT.menusClickHandler = function (div) {
    $(div).find('li.menus-dropdown > a').on('click',function(event){
        var menuItemId = $(this).parent().attr('id');
        console.log('MENU: Clicked on menu item: ',menuItemId,'\n',div,event);
        console.log($('#'+menuItemId).attr('class').split(/\s+/));
        //if ($(this).parent().hasClass('leaf')) {
        //    AKT.menuHandler[menuItemId]();
        //}

        AKT.recordEvent({
            file:'menu_manager.js',
            function:'AKT.menusClickHandler',
            element:$('#menus'),
            finds:['#'+menuItemId+' > a'],
            event:'click',
            message:'Clicked on a menubar menu header: '+menuItemId});

        if ($('#'+menuItemId).attr('class').split(/\s+/).includes('leaf')) {
            var step1 = {
                eventType:'highlight',
                selector:'#'+menuItemId+' > a'
            };
            var step2 = {
                eventType:'click',
                selector:'#'+menuItemId
            };
        } else {
            var step1 = {
                eventType:'highlight',
                selector:'#'+menuItemId+' > a'
            };
            var step2 = {
                eventType:'click',
                selector:'#'+menuItemId+' > a'
            };
        }
        AKT.eventRecord.push(step1);
        AKT.eventRecord.push(step2);

        if (AKT.menuHandler[menuItemId]) {
            if (AKT.state.playing_events && menuItemId === 'menu_file_newkb') {
                var value = AKT.event_records[2].value;  // TODO: remove this awful hack!  Get current record somehow.
                AKT.menuHandler[menuItemId](value); 
                $('.submenu').hide();
            } else {
                AKT.menuHandler[menuItemId](); 
                $('.submenu').hide();
            }
        }
        
        event.preventDefault()
        $(this).parent().find('ul').first().toggle(100);
        $(this).css({background:'#000090',color:'#d4d0c8'});
        $(this).parent().siblings().find('ul').hide();
        AKT.state.currentMenuItem = $(this).parent().find('ul');

        //Hide menu when clicked outside
        $(this).parent().find('ul').mouseleave(function(){  
            var thisUI = $(this);
            $('html, .panel, button, select').click(function(){
                thisUI.hide();
                $('html').unbind('click');
                //$('li.menus-dropdown > a').css({background:'#d0d0d0',color:'#707070'});
                var elements = $('li.menus-dropdown > a');
                $.each(elements, function(i,element) {
                    var parent = $(this).parent();
                    if (parent.hasClass('inactive')) {
                        $(this).css({background:'#d4d0c8',color:'#707070'});
                    } else if (parent.hasClass('active')) {
                        $(this).css({background:'#d4d0c8',color:'black'});
                    } else if (parent.hasClass('live')) {
                        $(this).css({background:'#d4d0c8',color:'black'});
                    } else if (parent.hasClass('file')) {
                        $(this).css({background:'#d4d0c8',color:'blue'});
                    } else {
                        $(this).css({background:'#d4d0c8',color:'black'});
                    }
                });
            });
        });  
/*
        {eventType:'highlight',selector:'#menu_kb'},
        {eventType:'menuclick',selector:'#menu_kb > a'},
        {eventType:'highlight',selector:'#menu_kb_statements > a'},
        {eventType:'menuleafclick',selector:'#menu_kb_statements'},
        {eventType:'menuclick',selector:'#menu_maps > a'},
*/
/*
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
*/
    });
};



AKT.menuReset = function (element) {
    var menuItemId = $(element).attr("id");
    AKT.incrementZindex("webakt.js: AKT.menuReset");
    $('#'+lookup[menuItemId]).css({display:"block", float:"none", "z-index":AKT.state.zindex, zindex:AKT.state.zindex});
    $(element).find('a').css({background:'#d0d0d0',color:'#707070'});
};
//$('#kb_openkb').on('click', function(event,object) {
//    alert('openkb');
//});

// This is another way: handle all commands the same, assuming they just open up a dialog window,
// looking up the dalog ID from the menu item ID.
// Almost certainly won't handle all cases...
    //AKT.menuHandler = function(menuItemId) {
    //    AKT.state.zindex += 1;
    //    $('#'+lookup[menuItemId]).css({display:"block", float:"none", "z-index":AKT.state.zindex, zindex:AKT.state.zindex});
    //    $(this).find('a').css({background:'#d0d0d0',color:'black'});       
    //};






AKT.loadSubmenus = function (menuUlId, entryIds, useIndex) {
    $('#'+menuUlId).find('ul').empty();
    if (!entryIds) return;
    if (Array.isArray(entryIds)) {
        for (var i=0; i<entryIds.length; i++) {
            if(useIndex) {   // Note!! The value attribute can either be the index or the option itself!!!
                var v = i;
            } else {
                v = entryIds[i];
            }
            var li = $('<li id="menu_'+menuUlId+'" class="menus-dropdown submenu leaf live" style="background:#d4d0c8;"><a href="#">'+entryIds[i]+'</a></li>');
            $('#'+menuUlId).find('ul').append(li);
            $(li).on('click', function() {
                console.debug('KB selected: ',$(this).find('a').text());
                //AKT.state.current_kb = $(this).find('a').text();
                AKT.changeKb($(this).find('a').text());
            });
        }
    }
};

