//按钮
(function () {


    kk.PageElement = function () {
        kk.ViewElement.apply(this, arguments);
        this.pageShowing = false;
        this.set("hidden","true");
    };

    kk.PageElement.prototype = kk.extend(kk.ViewElement.prototype, {

        viewChangedKey: function (view, key, value) {
            kk.ViewElement.prototype.viewChangedKey.apply(this, arguments);
            if (key == "path" || key =="hidden" ) {
                this.open();
            }
        },

        viewDidLayouted: function (view) {
            kk.ViewElement.prototype.viewDidLayouted.apply(this, arguments);
            if ( !kk.booleanValue(this.get("hidden")) && this._page) {
                this._page.resize(this.frame.width, this.frame.height, view);
            }
        },

        setView: function (view) {
            if (this._page) {
                this._page.recycle();
                this._page.recycleView();
                delete this._page;
            }
            kk.ViewElement.prototype.setView.apply(this, arguments);
            this.open();
        },

        onRecycleView : function(view) {
            kk.ViewElement.prototype.onRecycleView.apply(this, arguments);
            if (this._page) {
                this._page.recycle();
                this._page.recycleView();
                delete this._page;
            }
        },

        hidePage : function() {

            if (!this.view) {
                return false;
            }

            if(!this._page) {
                return;
            }

            if(!this.pageShowing) {
                return;
            }

            this.pageShowing = true;
            this._page.data.set(["page", "willDisappear"], {});
            this._page.data.set(["page", "didDisappear"], {});
        },

        showPage : function() {

            if (!this.view) {
                return false;
            }

            if(!this._page) {
                return;
            }

            if(this.pageShowing) {
                return;
            }

            this.pageShowing = false;
            this._page.data.set(["page", "willAppear"], {});
            this._page.data.set(["page", "didAppear"], {});
        },

        open: function () {


            if (!this.view) {
                return false;
            }

            var path = this.get("path");

            if (this._page && this._page.data.get(["url"]) == path) {
                if(this.isHidden()) {
                    this.hidePage();
                } else {
                    this.showPage();
                }
                return true;
            }

            if (this._page) {
                var p = this._page;
                delete this._page;
                p.recycle()
                this.app.post(function(){
                    p.recycleView(); 
                });
            }

            if(!path) {
                return false;
            }

            if(this.isHidden()) {
                return false;
            }

            var element = this;
            var page = this._page = new kk.Page(kk.getApp());

            var query = this.data();

            page.data.set(["url"], path);

            var i = path.indexOf("?");

            if(i > 0) {
                path.substr(i+1).replace(/([^&=\?]+)=([^&=\?]*)/g, function (text, name, value) {
                    query[name] = decodeURIComponent(value);
                });
                path = path.substr(0,i);
            }

            page.data.set(["path"], path);
            page.data.set(["query"], query);

            page.data.on(["action", "close"], function (data) {
                var e = new kk.ElementEvent(element);
                e.data = data;
                element.emit("close", e);
            });

            page.data.on(["action", "open"], function (data) {
                var e = new kk.ElementEvent(element);
                e.data = data;
                element.emit("open", e);
            });

            page.open(path);

            page.obtainView(this.view);
            this.pageShowing = true
        },

        createView: function () {
            var e = document.createElement("div");
            e.setAttribute("class", "kk-view kk-page");
            return e;
        }

    });

})();

