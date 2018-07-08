//WebView
(function () {


    kk.WebViewElement = function () {
        kk.ViewElement.apply(this, arguments);
        this._onEvents = [];
    };

    kk.WebViewElement.prototype = kk.extend(kk.ViewElement.prototype, {

        createView : function() {
            var v = document.createElement("iframe");
            v.setAttribute("frameborder","0");
            v.setAttribute("seamless","seamless");
            return v;
        },

        onLoaded : function() {
            this.loaded = true;
            while(this._onEvents.length) {
                var v = this._onEvents.shift();
                if(this.view && this.view.contentWindow) {
                    var fn = this.view.contentWindow["on"+v.name];
                    if(typeof fn == 'function') {
                        fn(v.data);
                    }
                }
            }
        },

        setView : function(view) {
            kk.ViewElement.prototype.setView.apply(this,arguments);
            if(view) {
                var element = this;
                $(view).bind("load",function(){
                    element.onLoaded();
                });
            }
        },

        viewChangedKey: function (view, key, value) {
            kk.ViewElement.prototype.viewChangedKey.apply(this, arguments);
            if (key == "src") {
                view.setAttribute("src", value);
            }
        },

        emit : function(name, event) {
            kk.ViewElement.prototype.emit.apply(this, arguments);
            if(event instanceof kk.ElementEvent) {
                event.cancelBubble = true;
                if(this.loaded) {
                    var fn = this.view.contentWindow["on"+name];
                    if(typeof fn == 'function') {
                        fn(event.data);
                    }
                } else {
                    this._onEvents.push({ name : name , data : event.data});
                }
            }
        }

    });

})();

