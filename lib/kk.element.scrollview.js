//ScrollView
(function () {


    kk.ScrollViewElement = function () {
        kk.ViewElement.apply(this, arguments);
    };

    kk.ScrollViewElement.prototype = kk.extend(kk.ViewElement.prototype, {

        createView: function () {
            var v = document.createElement("div");
            v.className = "kk-view kk-scrollview";
            var contentView = document.createElement("div");
            v.appendChild(contentView);
            return v;
        },

        setView: function(view) {
            delete this._contentView;
            kk.ViewElement.prototype.setView.apply(this,arguments);
            if(view) {
                this._contentView = view.firstChild;
            }
        },

        contentView: function () {
            return this._contentView;
        },

        viewDidLayouted: function (view) {
            kk.ViewElement.prototype.viewDidLayouted.apply(this,arguments);
            var v = this.contentView();
            if(v) {
                var width = this.contentSize.width;
                if(this.get("overflow-x") == 'scroll') {
                    width = Math.max(width,this.frame.width);
                }
                var height = this.contentSize.height;
                if(this.get("overflow-y") == 'scroll') {
                    height = Math.max(height,this.frame.height);
                }
                v.style.width = width + 'px';
                v.style.height = height + 'px';
            }
        },


    });

})();

