//文本
(function () {

    var Layout = function (element) {

        var size = { width: 0, height: 0 };

        if (element instanceof kk.TextElement) {

            if (element.width.type == kk.Pixel.TYPE_AUTO || element.height.type == kk.Pixel.TYPE_AUTO) {

                var textSize = element.getTextSize();

                if (element.width.type == kk.Pixel.TYPE_AUTO) {
                    size.width = textSize.width;
                }

                if (element.height.type == kk.Pixel.TYPE_AUTO) {
                    size.height = textSize.height;
                }

            } else {
                size.width = element.width.valueOf(element.frame.width, 0);
                size.height = element.width.valueOf(element.frame.height, 0);
            }

            var v = element.minWidth.valueOf(0, 0);

            if (size.width < v) {
                size.width = v;
            }

            v = element.maxWidth.valueOf(0, -1);

            if (v > 0 && size.width > v) {
                size.width = v;
            }

            v = element.minHeight.valueOf(0, 0);

            if (size.height < v) {
                size.height = v;
            }

            v = element.maxHeight.valueOf(0, -1);

            if (v > 0 && size.height > v) {
                size.height = v;
            }

            element.contentSize = size;
        }

        return size;
    };

    var textAttribute = function(view, element) {
        var v = element.get("font");
        if(v) {
            kk.Font.parse(v,view);
        } else {
            element.style.fontSize = '14px';
        }
        if(element.maxWidth.type != kk.Pixel.TYPE_AUTO) {
            view.style.maxWidth = element.maxWidth.valueOf(0,0) + 'px';
        }
    };

    kk.TextElement = function () {
        kk.ViewElement.apply(this, arguments);
        this.layout = Layout;
        this.displaying = false;
        this._layout = Layout;
    };

    kk.TextElement.prototype = kk.extend(kk.ViewElement.prototype, {

        viewChangedKey: function (view, key, value) {
            kk.ViewElement.prototype.viewChangedKey.apply(this, arguments);
            if (key == "#text") {
                this.setNeedDisplay();
            }
        },

        willRemoveChildren: function (element) {
            kk.ViewElement.prototype.willRemoveChildren.apply(this, arguments);
            this.setNeedDisplay();
        },

        didAddChildren: function (element) {
            this.setNeedDisplay();
            kk.ViewElement.prototype.didAddChildren.apply(this, arguments);
        },

        getTextSize: function () {

            var view = document.createElement("div");

            var p = this.firstChild;

            if(!p) {
                view.innerText = this.get("#text") || '';
            } else {
                while(p) {
                    if( p instanceof kk.SpanElement) {
                        view.appendChild(p.textView());
                    } else if(p instanceof kk.ImgElement) {
                        view.appendChild(p.textView());
                    }
                    p = p.nextSibling;
                }
            }

            textAttribute(view,this);

            view.style.position = 'absolute';
            view.style.top = '-8000px';
            view.style.padding = '0px';
            view.style.margin = '0px';

            document.body.appendChild(view);

            var size = { width: view.clientWidth, height: view.clientHeight };
            
            document.body.removeChild(view);

            return size;
        },

        display: function () {

            this.displaying = false;

            if (!this.view) {
                return;
            }

            var p = this.firstChild;
            var view = this.view;

            if(!p) {
                view.innerText = this.get("#text") || '';
            } else {
                view.innerText = '';
                while(p) {
                    if( p instanceof kk.SpanElement) {
                        view.appendChild(p.textView());
                    } else if(p instanceof kk.ImgElement) {
                        view.appendChild(p.textView());
                    }
                    p = p.nextSibling;
                }
            }

        },

        setNeedDisplay: function () {

            if (this.displaying || !this.view) {
                return;
            }

            this.displaying = true;

            var e = this;

            setTimeout(function () {
                e.display();
            }, 0);

        },

        createView: function () {
            var v = document.createElement("div");
            v.setAttribute("class", "kk-view kk-text");
            return v;
        },

        setLayout: function () {
            this._layout = Layout;
        }

    });

})();

