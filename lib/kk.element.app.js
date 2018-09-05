//按钮
(function () {


    kk.AppElement = function () {
        kk.ViewElement.apply(this, arguments);
    };

    kk.AppElement.prototype = kk.extend(kk.ViewElement.prototype, {

        viewChangedKey: function (view, key, value) {
            kk.ViewElement.prototype.viewChangedKey.apply(this, arguments);
            if (key == "src") {
                this.load(value);
            }
        },

        setView : function(view) {
            if(this._app) {
                this._app.recycle();
                delete this._app;
            }
            kk.ViewElement.prototype.setView.apply(this,arguments);
        },

        load: function (url) {

            if(!this.view) {
                return false;
            }

            if(this._app && this._app.data.get(["url"]) == url ) {
                return true;
            }

            if(this._app) {
                var v = this._app;
                delete this._app;
                this.app.post(function(){
                    v.recycle();
                });
            }

            if(url && (url.startsWith("http://") || url.startsWith("https://"))) {

            } else {
                return false;
            }

            var app = this._app = new kk.Application();

            (function(){

                var v = this.get("orientation");

                if(v !== undefined) {
                    app.orientation = v;
                }

                v = this.get("unit-rpx");

                if(v !== undefined) {
                    app.UnitRPX = v;
                }

            })();

            var query = app.data.get(["query"]) || {};

            var queryString = url;

            var i = queryString.indexOf("?");

            if(i > 0) {
                queryString = queryString.substr(i+1);
            }

            queryString.replace(/([^&=\?]+)=([^&=\?]*)/g, function (text, name, value) {
                query[name] = decodeURIComponent(value);
            });

            app.data.set(["query"], query);

            app.data.on(["alert"], function (data) {
                alert(data);
            });

            app.run(url, this.view);

        },

        createView: function () {
            var e = document.createElement("div");
            e.setAttribute("class", "kk-view kk-app");
            return e;
        }

    });

})();

