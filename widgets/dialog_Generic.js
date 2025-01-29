(function ($) {

  /***********************************************************
   *         dialog_Generic widget
   ***********************************************************
   */
    $.widget('akt.dialog_Generic', {
        meta:{
            short_description: 'dialog_Generic',
            long_description: 'dialog_Generic',
            author: 'Robert Muetzelfeldt',
            last_modified: 'July 2021',
            visible: true,
            options: {
            }
        },

        options: {
            kb:null,
            show_titlebar:true,
            widget_name: null
        },

        evaluate: function(kb) {
            var results = evaluate(kb);
            display(this, results);
            return results;
        },

        widgetEventPrefix: 'dialog_Generic:',

        _create: function () {
            console.debug('\n### Creating instance of widget "akt.dialog_Generic".',
                '\nElement ID:',this.element[0].id,'  Widget UUID:',this.uuid,'  Options:',this.options);
            var self = this;
            this.element.addClass('dialog_Generic-1');

            var kb = self.options.kb;

            createEmptyWidget(self);
            var results = evaluate(self);
            display(self, results);  // TODO - check that this works for diagramming -
            // I commented it out when working on it.

            this._setOptions({
            });
        },

        _destroy: function () {
            this.element.removeClass('dialog_Generic-1');
            this.element.empty();
            this._super();
        },
        _setOption: function (key, value) {
            console.debug('\n** dialog_Generic: setOption: ',key,' = ',value);
            var self = this;
            var prev = this.options[key];
            if (key === 'visible' && value) {
                $(self.element).css({display:'block'});
                display(self, null);   // TODO: check this
            } else {
                if (key !== 'nodisplay' || (key === 'nodisplay' && !value)) {
                    console.debug('### ',key,value);
                    self.options[key] = value;
                    display(self, null);
                }
            }
            var fnMap = {
            };

            // base
            this._super(key, value);

            if (key in fnMap) {
                fnMap[key]();

                // Fire event
                this._triggerOptionChanged(key, prev, value);
            }
        },

        _triggerOptionChanged: function (optionKey, previousValue, currentValue) {
            this._trigger('setOption', {type: 'setOption'}, {
                option: optionKey,
                previous: previousValue,
                current: currentValue
            });
        }
    });

// ================================================================================


    function createEmptyWidget(widget) {

        // See comments in AKT.makeWidgetTitlebar(): I can't see why
        // event handler can't go there.  It works for AKT.reprocess...
        if (widget.options.show_titlebar) {
            console.debug(widget.widgetName, widget.options.widget_name);
            //var titlebarDiv = AKT.makeWidgetTitlebar(widget.widgetName,widget.element);
            //var titlebarDiv = AKT.makeWidgetTitlebar(widget.options.widget_name, widget.element, widget.options);
            //$(widget.element).append(titlebarDiv);
            $(widget.element).find('.w3-right').on('click', function () {
                AKT.recordEvent({
                    file:'dialog_Generic.js',
                    function:'createEmptyWidget()',
                    event:'click',
                    element:widget.element,
                    finds:['.dialog_close_button'],
                    message:'Clicked on the generic widgette close button'
                });
                $(widget.element).css({display:"none"});
            });
        }
   
        console.debug('\n&&& ',widget.options);
        console.debug(AKT.widgets);

        if (AKT.widgets[widget.options.widget_name].html) {
            var widgetContent = $(AKT.widgets[widget.options.widget_name].html);
        }
        $(widget.element).append(widgetContent);

        $(widget.element).css({display:'block'});
        //$(widget.element).draggable();
        $(widget.element).draggable({handle:".titlebar",containment:"#workspace"});

        AKT.widgets[widget.options.widget_name].setup(widget);
    }



    function evaluate(widget) {
        console.debug('Starting akt.dialog_Generic: evaluate()...');
        var results = null;
        return results;
    }


    function display(widget, results) {
        //console.log('STARTING akt.dialog_Generic: '+widget.options.widget_name+': display()');
        //console.log(widget.options);
        AKT.widgets[widget.options.widget_name].display(widget);

        var zindex = AKT.incrementZindex("dialog_Generic");
        $(widget.element).css({display:'block','z-index':zindex});
    }

})(jQuery);


