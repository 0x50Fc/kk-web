//输入框
(function () {


    kk.TextareaElement = function () {
        kk.ViewElement.apply(this, arguments);
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
            }
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
                });
    
        },

        viewDidLayouted: function (view) {
            kk.ViewElement.prototype.viewDidLayouted.apply(this, arguments);
            view.style.padding = this.padding.toString();
        },

    });

})();

