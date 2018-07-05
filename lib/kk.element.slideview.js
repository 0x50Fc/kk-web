//SlideView
(function () {


    kk.SlideViewElement = function () {
        kk.ScrollViewElement.apply(this, arguments);
    };

    kk.SlideViewElement.prototype = kk.extend(kk.ScrollViewElement.prototype, {

        viewChangedKey: function (view, key, value) {
            kk.ScrollViewElement.prototype.viewChangedKey.apply(this, arguments);
            if (key == "anchor") {
                this.updateAnchor(true);
            }
        },

        curElementView: function () {
            if (this._curElementView === undefined) {
                var e = this.firstChild;
                while (e) {
                    if (e.get("#name") == "slide:cur") {
                        break;
                    }
                    e = e.nextSibling;
                }
                if (e && e.firstChild && e.firstChild instanceof kk.ViewElement) {
                    this._curElementView = e.firstChild;
                } else {
                    this._curElementView = null;
                }
            }
            return this._curElementView;
        },

        updateAnchor: function (animated) {

            var element;
            var anchor = this.get("anchor");

            if (anchor) {
                var e = this.firstChild;
                while (e) {
                    if (e instanceof kk.ViewElement) {
                        if (anchor == e.get("anchor")) {
                            element = e;
                            break;
                        }
                    }
                    e = e.nextSibling;
                }
            }

            var cur = this.curElementView();
            var contentView = this.contentView();

            if (cur && contentView) {

                if (element) {

                    var size = { width: element.frame.width, height: this.frame.height };

                    size.width = cur.width.valueOf(size.width, 0);
                    size.height = cur.height.valueOf(size.height, 0);

                    var centerX = element.frame.x + element.frame.width * 0.5;

                    cur.frame.x = centerX - size.width * 0.5;
                    cur.frame.y = 0;

                    cur.layout(size.width, size.height);
                    cur.obtainView(contentView,function(view, element, toView){
                      
                        if (toView.firstElementChild) {
                            toView.insertBefore(view, toView.firstElementChild);
                        } else {
                            toView.appendChild(view);
                        }
                    });

                } else {
                    cur.recycleView();
                }

            }
        },


    });

})();

