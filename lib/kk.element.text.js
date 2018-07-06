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
        }
        if(element.maxWidth && element.maxWidth.type != kk.Pixel.TYPE_AUTO) {
            view.style.maxWidth = element.maxWidth.valueOf(0,0) + 'px';
        }
    };

    kk.SpanElement = function() {
        kk.Element.apply(this, arguments);
    };

    kk.SpanElement.prototype = kk.extend(kk.Element.prototype,{

        changedKey : function(key) {
            kk.Element.prototype.changedKey.apply(this,arguments);
            if(this.parent && this.parent instanceof kk.TextElement ){
                this.parent.setNeedDisplay();
            }
        },

        textView : function(element) {

            var view = document.createElement("span");

            textAttribute(view,this);

            view.innerText = this.get("#text") || '';

            return view;
        }

    });

    kk.ImgElement = function() {
        kk.Element.apply(this,arguments);
        this.width = new kk.Pixel();
        this.height = new kk.Pixel();
    };

    kk.ImgElement.prototype = kk.extend(kk.Element.prototype,{

        changedKey : function(key) {
            kk.Element.prototype.changedKey.apply(this,arguments);

            if(key == "width") {
                this.width.set(this.get(key));
            } else if(key == "height") {
                this.height.set(this.get(key));
            }

            if(this.parent && this.parent instanceof kk.TextElement ){
                this.parent.setNeedDisplay();
            }
        },

        textView : function(element) {

            var view = document.createElement("img");

            var image = this.app.getImage(this.get("src"));

            if(image) {
                var width = image.width();
                var height = image.height();
                if(width >0 && height > 0) {

                    if(this.width.type == kk.Pixel.TYPE_AUTO && this.height.type == kk.Pixel.TYPE_AUTO) {

                    } else if(this.width.type == kk.Pixel.TYPE_AUTO) {
                        var v = this.height.valueOf(0,0);
                        width = v * width / height;
                        height = v;
                    } else if(this.height.type == kk.Pixel.TYPE_AUTO) {
                        var v = this.width.valueOf(0,0);
                        height = v * height / width;
                        width = v;
                    } else {
                        width = this.width.valueOf(0,0);
                        height = this.height.valueOf(0,0);
                    }

                    view.style.width = width + 'px';
                    view.style.height = height + 'px';
                    view.src = image.getURL();

                } else {
                    view.style.width = this.width.valueOf(0,0) + 'px';
                    view.style.height = this.width.valueOf(0,0) + 'px';
                }
            } else {
                view.style.width = this.width.valueOf(0,0) + 'px';
                view.style.height = this.width.valueOf(0,0) + 'px';
            }

            return view;
        }
    });


    kk.TextElement = function () {
        kk.ViewElement.apply(this, arguments);
        this.layout = Layout;
        this.displaying = false;
        this._layout = Layout;
    };

    kk.TextElement.prototype = kk.extend(kk.ViewElement.prototype, {

        viewChangedKey: function (view, key, value) {
            kk.ViewElement.prototype.viewChangedKey.apply(this, arguments);
            this.setNeedDisplay();
        },

        setView : function(view) {
            kk.ViewElement.prototype.setView.apply(this,arguments);
            if(view) {
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
                        view.appendChild(p.textView(this));
                    } else if(p instanceof kk.ImgElement) {
                        view.appendChild(p.textView(this));
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
                        view.appendChild(p.textView(this));
                    } else if(p instanceof kk.ImgElement) {
                        view.appendChild(p.textView(this));
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

