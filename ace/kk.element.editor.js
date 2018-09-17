//多行文本框
(function () {

    var Layout = function (element) {

        var size = { width: 0, height: 0 };

        if (element instanceof kk.EditorElement) {

            if (element.width.type == kk.Pixel.TYPE_AUTO || element.height.type == kk.Pixel.TYPE_AUTO) {

                var view = element.view;

                if (view) {
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

    kk.EditorElement = function () {
        kk.ViewElement.apply(this, arguments);
        this._layout = Layout;
    };

    kk.EditorElement.prototype = kk.extend(kk.ViewElement.prototype, {

        uninstallBar: function () {

            this.cancelUninstallBar();

            if(!this._barView) {
                return;
            }
            
            this.app.clearBarView(this._barView);

            delete this._barView;

            var e = this.firstChild;

            if (e && e.get("#name") == "bar") {

                e.off("down");

                var p = e.firstChild;

                while (p) {
                    if (p instanceof kk.ViewElement) {
                        p.recycleView();
                    }
                    p = p.nextSibling;
                }

            }
            
        },

        cancelUninstallBar : function() {
            if(this._uninstallBarId) {
                window.clearTimeout(this._uninstallBarId);
                delete this._uninstallBarId;
            }
        },

        installBar: function () {

            this.cancelUninstallBar();

            if(this._barView) {
                this.app.setBarView(this._barView,parseInt(this._barView.style.height));
                return;
            }

            var view = document.createElement("div");

            view.className = "kk-view kk-app-bar";

            var height = 0;
            var e = this.firstChild;

            var element = this;

            var fn = function() {
                element._cancelUninstallBar = true;
                element.cancelUninstallBar();
            };

            if (e && e.get("#name") == "bar") {

                e.on("down",fn);

                var p = e.firstChild;

                while (p) {
                    if (p instanceof kk.ViewElement) {
                        if(p.frame.height > height) {
                            height = p.frame.height;
                        }
                        p.obtainView(view);
                    }
                    p = p.nextSibling;
                }

            }

            this.app.setBarView(view,height);

            this._barView = view;

            $(view)
                .on("mousedown",fn)
                .on("touchstart",fn);

        },

        doChange : function() {

            if(!this._ace) {
                return;
            }

            var editor = this._ace;
            var element = this;

            var e = new kk.ElementEvent(element);
            e.data = element.data();
            e.data['value'] = editor.getValue();
            element.emit("change", e);

            if (element.width.type == kk.Pixel.TYPE_AUTO || element.height.type == kk.Pixel.TYPE_AUTO) {
                e.cancelBubble = false;
                element.emit("layout", e);
            }
        },

        emit : function(name, event) {
            kk.ViewElement.prototype.emit.apply(this,arguments);
            if(name == "insert") {
                var data = event.data;
                if(data && data.text !== undefined && this._ace) {
                    this._ace.insert(data.text);
                    this._ace.focus();
                    this.doChange();
                }
            }
        },

        setView: function (view) {
            if (this._ace) {
                this._ace.destroy();
                delete this._ace;
            }

            this.uninstallBar();

            kk.ViewElement.prototype.setView.apply(this, arguments);

            if (this.view) {

                this.setActive(false);

                var element = this;

                this._ace = new ace.edit(this.view, {
                    autoScrollEditorIntoView: this.height.type == kk.Pixel.TYPE_AUTO,
                    maxLines: kk.Pixel.AUTO,
                    maxPixelHeight: this.maxHeight.valueOf(0, 0)
                });

                this._ace.setTheme(this.get("theme") || 'ace/theme/tomorrow');
                this._ace.getSession().setNewLineMode('unix');
                this._ace.getSession().setTabSize(2);
                
                var mode = this.get("mode");
                if (mode) {
                    this._ace.getSession().setMode(mode);
                }

                (function (app, element, editor) {

                    var app = element.app;

                    var change = function (event) {

                        kk.pushApp(app);
                        element.doChange();
                        kk.popApp();
                    };

                    editor.on("change", change);

                    editor.on("focus", function () {

                        kk.pushApp(app);

                        element.setActive(true);

                        var e = new kk.ElementEvent(element);
                        e.data = element.data();
                        e.data['value'] = editor.getValue();
                        element.emit("focus", e);

                        kk.popApp();

                    });

                    editor.on("blur", function () {

                        kk.pushApp(app);

                        element.setActive(false);

                        var e = new kk.ElementEvent(element);
                        e.data = element.data();
                        e.data['value'] = editor.getValue();
                        element.emit("blur", e);

                        kk.popApp();

                    });

                })(this.app, this, this._ace);

            }
        },

        viewChangedKey: function (view, key, value) {
            kk.ViewElement.prototype.viewChangedKey.apply(this, arguments);
            switch (key) {
                case "enabled":
                    view.disabled = !kk.booleanValue(value);
                    this.updateStatus();
                    break;
                case "autofocus":
                    if (kk.booleanValue(value)) {
                        var element = this;
                        this.app.post(function () {
                            element.focusUpdatting = true;
                            element._ace.focus();
                            element.focusUpdatting = false;
                        });
                    }
                    break;
                case "#text":
                case "value":
                    this._ace.setValue(value, -1);
                    var app = this.app;
                    var element = this;
                    app.post(function () {
                        if (element.width.type == kk.Pixel.TYPE_AUTO || element.height.type == kk.Pixel.TYPE_AUTO) {
                            element.emit("layout", new kk.ElementEvent(element));
                        }
                    });
                    break;
                case "padding":
                    view.padding = this.padding.toString();
                    break;
                case "readonly":
                    this._ace.setReadOnly(kk.booleanValue(value));
                    break;
                case "font":
                    this._ace.setFontSize(kk.Font.getSize(value) || 12);
                    break;
            }
        },

        setLayout: function () {
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

            if(active) { 
                this._cancelUninstallBar = false;
                this.installBar();
            } else {

                if(this._cancelUninstallBar) {
                    return;
                }

                this.cancelUninstallBar();

                var element = this;

                this._uninstallBarId = setTimeout(function(){
                    element.uninstallBar();
                },200);
                
            }

        },

        createView: function () {
            var e = document.createElement("div");
            e.setAttribute("class", "kk-view kk-editor");
            return e;
        },

        viewDidLayouted: function (view) {
            kk.ViewElement.prototype.viewDidLayouted.apply(this, arguments);
            if (this._ace) {
                this._ace.resize();
            }

            var app = this.app;

            var size =  {
                width : app.view.clientWidth,
                height : app.view.clientHeight
            };

            var e = this.firstChild;

            if (e && e.get("#name") == "bar") {

                var p = e.firstChild;

                while (p) {

                    if (p instanceof kk.ViewElement) {

                        var width = p.width.valueOf(size.width, 0);
                        var height = p.height.valueOf(size.height, 0);

                        p.layout(width, height);

                    }

                    p = p.nextSibling;
                }

            }


        },

    });

    kk.elements['editor'] = kk.EditorElement;

})();

