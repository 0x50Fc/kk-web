//WebView
(function () {


    kk.WebViewElement = function () {
        kk.ViewElement.apply(this, arguments);
    };

    kk.WebViewElement.prototype = kk.extend(kk.ViewElement.prototype, {

        createView : function() {
            var v = document.createElement("iframe");
            v.setAttribute("frameborder","0");
            v.setAttribute("seamless","seamless");
            return v;
        },

        viewChangedKey: function (view, key, value) {
            kk.ViewElement.prototype.viewChangedKey.apply(this, arguments);
            if (key == "src") {
                view.setAttribute("src", value);
            }
        },


    });

})();

