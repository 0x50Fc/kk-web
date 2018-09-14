//选择框
(function () {

    kk.SelectElement = function () {
        kk.ViewElement.apply(this, arguments);
    };

    kk.SelectElement.prototype = kk.extend(kk.ViewElement.prototype, {

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
                case "value":
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
            if(active) {
                this.app.setBarView(undefined,0);
            }
        },

        createView: function () {
            var e = document.createElement("select");
            e.setAttribute("class", "kk-view kk-select");
            return e;
        },

        updateOptions : function() {

            var e = this.view;

            if(!e) {
                return;
            }

            e.innerHTML = '';

            var p = this.firstChild;

            var value = this.get("value");

            while(p) {
                if(p.get("#name") == "option") {
                    var v = document.createElement("option");
                    var vv = p.get("value");
                    if(vv !== undefined) {
                        v.setAttribute("value",vv);
                        if(value === undefined) {
                            value = vv;
                        }
                    }
                    v.textContent = p.get("#text");
                    e.appendChild(v);
                }
                p = p.nextSibling;
            }

            e.value = value ;

        },

        willRemoveChildren: function (element) {
            kk.ViewElement.prototype.willRemoveChildren.apply(this, arguments);
            var v = this;
            this.app.post(function(){
                v.updateOptions();
            });
        },
    
        didAddChildren: function (element) {
            kk.ViewElement.prototype.didAddChildren.apply(this, arguments);
            var v = this;
            this.app.post(function(){
                v.updateOptions();
            });
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
                })
                .on("change",change)
                .on("keyup", function(event){
                    event.stopPropagation();
                    if(event.keyCode == 13) {
                        kk.pushApp(app);
                        var e = new kk.ElementEvent(element);
                        e.data = element.data();
                        e.data['value'] = this.value;
                        element.emit("done",e);
                        kk.popApp();
                    }
                });
            this.updateOptions();
        },

        viewDidLayouted: function (view) {
            kk.ViewElement.prototype.viewDidLayouted.apply(this, arguments);
            view.style.padding = this.padding.toString();
        },

    });

})();

