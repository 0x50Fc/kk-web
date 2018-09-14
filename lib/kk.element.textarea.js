//多行文本框
(function () {

    var Layout = function (element) {

        var size = { width: 0, height: 0 };

        if (element instanceof kk.TextareaElement) {

            if (element.width.type == kk.Pixel.TYPE_AUTO || element.height.type == kk.Pixel.TYPE_AUTO) {

                var view = element.view;

                if(view) {
                    size.width = view.scrollWidth;
                    size.height = view.scrollHeight;
                }

            } else {
                size.width = element.width.valueOf(element.frame.width, 0);
                size.height = element.width.valueOf(element.frame.height, 0);
            }

            var v = element.minWidth.valueOf(0, 0);

            if (size.width < v) {
                size.width = v;
            }

            v = element.maxWidth.valueOf(0, -1);

            if (v > 0 && size.width > v) {
                size.width = v;
            }

            v = element.minHeight.valueOf(0, 0);

            if (size.height < v) {
                size.height = v;
            }

            v = element.maxHeight.valueOf(0, -1);

            if (v > 0 && size.height > v) {
                size.height = v;
            }

            element.contentSize = size;
        }

        return size;
    };

    kk.TextareaElement = function () {
        kk.ViewElement.apply(this, arguments);
        this._layout = Layout;
    };

    kk.TextareaElement.prototype = kk.extend(kk.ViewElement.prototype, {

        viewChangedKey: function (view, key, value) {
            kk.ViewElement.prototype.viewChangedKey.apply(this, arguments);
            switch (key) {
                case "font":
                    kk.Font.parse(value, view, this.lineSpacing.valueOf(0, 0));
                    break;
                case "line-spacing":
                    kk.Font.parse(this.get("font"), view, this.lineSpacing.valueOf(0, 0));
                    break;
                case "text-decoration":
                    view.style.textDecoration = value || 'none';
                    break;
                case "enabled":
                    view.disabled = !kk.booleanValue(value);
                    this.updateStatus();
                    break;
                case "autofocus":
                    if(kk.booleanValue(value)) {
                        var element = this;
                        this.app.post(function(){
                            element.focusUpdatting = true;
                            view.focus();
                            element.focusUpdatting = false;
                        });
                    }
                    break;
                case "#text":
                    view.value = value;
                    break;
                case "padding":
                    view.padding = this.padding.toString();
                    break;
            }
        },

        setLayout : function() {
            this._layout = Layout;
        },
        
        updateStatus: function () {
            if (this.get("enabled") != 'true') {
                this.set("status", "disabled");
            } else if (this.active) {
                this.set("status", "active");
            } else {
                this.set("status", "");
            }
        },

        setActive: function (active) {
            this.active = active;
            this.updateStatus();
        },

        createView: function () {
            var e = document.createElement("textarea");
            e.setAttribute("class", "kk-view kk-textarea");
            return e;
        },

        viewDidAppear : function(view) {
            var element = this;
            var app = this.app;
            var change = function(event) {
                event.stopPropagation();
                kk.pushApp(app);
                var e = new kk.ElementEvent(element);
                e.data = element.data();
                e.data['value'] = this.value;
                element.emit("change",e);
                
                if(element.width.type == kk.Pixel.TYPE_AUTO || element.height.type == kk.Pixel.TYPE_AUTO) {
                    e.cancelBubble = false;
                    element.emit("layout",e);
                }
                kk.popApp();
            };
            $(view)
                .on("focus", function (event) {
                    event.stopPropagation();
                    kk.pushApp(app);
                    element.setActive(true);
                    if(!element.focusUpdatting){
                        var e = new kk.ElementEvent(element);
                        e.data = element.data();
                        e.data['value'] = this.value;
                        element.emit("focus",e);
                    }
                    kk.popApp();
                })
                .on("blur", function (event) {
                    event.stopPropagation();
                    kk.pushApp(app);
                    element.setActive(false);
                    var e = new kk.ElementEvent(element);
                    e.data = element.data();
                    e.data['value'] = this.value;
                    element.emit("blur",e);
                    kk.popApp();
                    change.apply(this,arguments);
                })
                .on("keyup",change);
    
        },


    });

})();

