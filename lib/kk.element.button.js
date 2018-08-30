//按钮
(function () {


    kk.ButtonElement = function () {
        kk.ViewElement.apply(this, arguments);
    };

    kk.ButtonElement.prototype = kk.extend(kk.ViewElement.prototype, {

        viewChangedKey: function (view, key, value) {
            kk.ViewElement.prototype.viewChangedKey.apply(this,arguments);
            if(key == "selected" || key == "enabled") {
                if(key == 'enabled') {
                    view.disabled = value != 'true';
                    var element = this;
                    var app = this.app;
                    $(view)
                    .on("click",function(){
                        event.stopPropagation();
                        kk.pushApp(app);
                        element.doTapAction();
                        kk.popApp();
                    })
                }
                this.updateStatus();
            }
        },

        updateStatus : function() {
            if(this.get("enabled") != 'true') {
                this.set("status","disabled");
            } else if(this.get("selected") == 'true') {
                this.set("status","selected");
            } else if(this.hover) {
                this.set("status","hover");
            } else {
                this.set("status","");
            }
        },

        setHover : function(hover) {
            this.hover = hover;
            this.updateStatus();
        },

        createView: function () {
            var e = document.createElement("button");
            e.setAttribute("class", "kk-view kk-button");
            return e;
        },

        doTapAction : function() {
            var e = new kk.ElementEvent(this);
            e.data = this.data();
            this.emit("tap",e);
        },

        viewDidAppear : function(view) {
            var element = this;
            var app = this.app;
            $(view)
            .on("click",function(){
                event.stopPropagation();
                kk.pushApp(app);
                element.doTapAction();
                kk.popApp();
            })
            .on("mousedown",function(event){
                event.stopPropagation();
                kk.pushApp(app);
                element.setHover(true);
                kk.popApp();
            })
            .on("mouseup",function(event){
                event.stopPropagation();
                kk.pushApp(app);
                element.setHover(false);
                kk.popApp();
            })
            .on("touchstart",function(){
                kk.pushApp(app);
                element.setHover(true);
                kk.popApp();
            })
            .on("touchend",function(){
                kk.pushApp(app);
                element.setHover(false);
                kk.popApp();
            })
            .on("touchcancel",function(){
                kk.pushApp(app);
                element.setHover(false);
                kk.popApp();
            });
        },

        setView: function (view) {
            kk.ViewElement.prototype.setView.apply(this,arguments);
        }

    });

})();

