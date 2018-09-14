//按钮
(function () {


    kk.ButtonElement = function () {
        kk.ViewElement.apply(this, arguments);
    };

    kk.ButtonElement.prototype = kk.extend(kk.ViewElement.prototype, {

        viewChangedKey: function (view, key, value) {
            kk.ViewElement.prototype.viewChangedKey.apply(this, arguments);
            if (key == "enabled") {
                view.disabled = !kk.booleanValue(value, true);
            }
            if (key == "selected" || key == "enabled") {
                this.updateStatus();
            }
        },

        updateStatus: function () {
            if (!kk.booleanValue(this.get("enabled"), true)) {
                this.set("status", "disabled");
            } else if (this.get("selected") == 'true') {
                this.set("status", "selected");
            } else if (this.hover) {
                this.set("status", "hover");
            } else {
                this.set("status", "");
            }
        },

        setHover: function (hover) {
            this.hover = hover;
            this.updateStatus();
        },

        createView: function () {
            var e = document.createElement("button");
            e.className = "kk-view kk-button";
            return e;
        },

        doTapAction: function () {
            var e = new kk.ElementEvent(this);
            e.data = this.data();
            this.emit("tap", e);
        },

        emit: function (name, event) {
            if ((name == "tap" || name == "down" || name == "up") && event instanceof kk.ElementEvent) {
                if (event.element != this) {
                    var p = this.parent;
                    if (!event.cancelBubble && p != null) {
                        p.emit(name, event);
                    }
                    return;
                }
            }
            kk.ViewElement.prototype.emit.apply(this, arguments);
        },

        viewDidAppear: function (view) {
            var element = this;
            var app = this.app;
            $(view)
                .on("click", function (event) {
                    event.stopPropagation();
                    kk.pushApp(app);
                    element.doTapAction();
                    kk.popApp();
                })
                .on("mousedown", function (event) {
                    event.stopPropagation();
                    kk.pushApp(app);
                    var e = new kk.ElementEvent(element);
                    e.data = element.data();
                    element.emit("down", e);
                    element.setHover(true);
                    kk.popApp();
                })
                .on("mouseup", function (event) {
                    event.stopPropagation();
                    kk.pushApp(app);
                    var e = new kk.ElementEvent(element);
                    e.data = element.data();
                    element.emit("up", e);
                    element.setHover(false);
                    kk.popApp();
                })
                .on("touchstart", function (event) {
                    event.stopPropagation();
                    kk.pushApp(app);
                    var e = new kk.ElementEvent(element);
                    e.data = element.data();
                    element.emit("down", e);
                    element.setHover(true);
                    kk.popApp();
                })
                .on("touchend", function (event) {
                    event.stopPropagation();
                    kk.pushApp(app);
                    var e = new kk.ElementEvent(element);
                    e.data = element.data();
                    element.emit("up", e);
                    element.setHover(false);
                    kk.popApp();
                })
                .on("touchcancel", function (event) {
                    kk.pushApp(app);
                    element.setHover(false);
                    kk.popApp();
                });
        },

        setView: function (view) {
            kk.ViewElement.prototype.setView.apply(this, arguments);
        }

    });

})();

