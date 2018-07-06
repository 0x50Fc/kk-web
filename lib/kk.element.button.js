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

        setView: function (view) {
            if(this.view) {
                $(this.view).off("click");
            }
            kk.ViewElement.prototype.setView.apply(this,arguments);
            if(this.view) {
                var element = this;
                $(this.view)
                .on("click",function(){
                    var e = new kk.ElementEvent(element);
                    e.data = element.data();
                    element.emit("tap",e);
                })
                .on("touchstart",function(){
                    element.setHover(true);
                })
                .on("touchend",function(){
                    element.setHover(false);
                })
                .on("touchcancel",function(){
                    element.setHover(false);
                });;
            }
        }

    });

})();

