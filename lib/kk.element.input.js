//输入框
(function () {


    kk.InputElement = function () {
        kk.ViewElement.apply(this, arguments);
    };

    kk.InputElement.prototype = kk.extend(kk.ViewElement.prototype, {

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
                case "type":
                    if(value == "number") {
                        value = "text";
                    }
                    view.setAttribute("type", value);
                    break;
                case "placeholder":
                    view.setAttribute("placeholder", value);
                    break;
                case "autofocus":
                    if(kk.booleanValue(value)) {
                        this.app.post(function(){
                            view.focus();
                        });
                    }
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
            var e = document.createElement("input");
            e.setAttribute("class", "kk-view kk-input");
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
                    kk.popApp();
                })
                .on("blur", function (event) {
                    event.stopPropagation();
                    kk.pushApp(app);
                    element.setActive(false);
                    kk.popApp();
                    change.apply(this,arguments);
                })
                .on("keyup", function(event){
                    event.stopPropagation();
                    change.apply(this,arguments);
                    if(event.keyCode == 13) {
                        kk.pushApp(app);
                        var e = new kk.ElementEvent(element);
                        e.data = element.data();
                        e.data['value'] = this.value;
                        element.emit("done",e);
                        kk.popApp();
                    }
                });
    
        },

        viewDidLayouted: function (view) {
            kk.ViewElement.prototype.viewDidLayouted.apply(this, arguments);
            view.style.padding = this.padding.toString();
        },

    });

})();

