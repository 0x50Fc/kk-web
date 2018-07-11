//按钮
(function () {


    kk.ButtonElement = function () {
        kk.ViewElement.apply(this, arguments);
    };

    kk.ButtonElement.prototype = kk.extend(kk.ViewElement.prototype, {

        viewChangedKey: function (view, key, value) {
            kk.ViewElement.prototype.viewChangedKey.apply(this,arguments);
            if(key == "selected" || key == "enabled") {
                this.updateStatus();
            }
        },

        updateStatus : function() {
            if(this.get("enabled") =='false') {
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
            var e = document.createElement("div");
            e.setAttribute("class", "kk-view kk-button");
            return e;
        },

        setView: function (view) {
            if(this.view) {
                $(this.view).off("click");
            }
            kk.ViewElement.prototype.setView.apply(this,arguments);
            if(this.view) {
                var element = this;
                var app = this.app;
                $(this.view)
                .off("click")
                .on("click",function(event){
                    event.stopPropagation();
                    kk.pushApp(app);
                    var e = new kk.ElementEvent(element);
                    e.data = element.data();
                    element.emit("tap",e);
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
            }
        }

    });

})();

