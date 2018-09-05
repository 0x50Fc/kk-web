//文本
(function () {

    var Layout = function (element) {

        var size = { width: 0, height: 0 };

        if (element instanceof kk.TextElement) {

            if (element.width.type == kk.Pixel.TYPE_AUTO || element.height.type == kk.Pixel.TYPE_AUTO) {

                var textSize = element.getTextSize();

                if (element.width.type == kk.Pixel.TYPE_AUTO) {
                    size.width = Math.ceil(textSize.width + 1)
                        + element.padding.left.valueOf(0, 0)
                        + element.padding.right.valueOf(0, 0);
                }

                if (element.height.type == kk.Pixel.TYPE_AUTO) {
                    size.height = Math.ceil(textSize.height + 1)
                        + element.padding.top.valueOf(0, 0)
                        + element.padding.bottom.valueOf(0, 0);
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

    var getAttribute = function (key) {
        var v;
        for (var i = 1; i < arguments.length; i++) {
            var e = arguments[i];
            if (e && e instanceof kk.Element) {
                v = e.get(key);
                if (v !== undefined) {
                    break;
                }
            }
        }
        return v;
    };

    var textAttribute = function (view, element, textElement) {
        var v = getAttribute("font",element,textElement);
        if (v) {
            kk.Font.parse(v, view);
        }
        v = getAttribute("color",element,textElement);
        if (v) {
            view.style.color = kk.Color.parse(v);
        }
        v = getAttribute("text-decoration",element,textElement);
        if (v) {
            view.style.textDecoration = v;
        }
        v = getAttribute("text-stroke",element,textElement);
        if (v) {
            var size = new kk.Pixel();
            var color;
            var vs = v.split(" ");
            for (var i = 0; i < vs.length; i++) {
                v = vs[i];
                if (kk.Pixel.is(v)) {
                    size.set(v);
                } else {
                    color = kk.Color.parse(v);
                }
            }
            if (color && size.type != kk.Pixel.TYPE_AUTO) {
                view.style.webkitTextStroke = view.style.textStroke = '1px ' + color;
            }
        }
        if (element.maxWidth && element.maxWidth.type != kk.Pixel.TYPE_AUTO) {
            view.style.maxWidth = element.maxWidth.valueOf(0, 0) + 'px';
        }
    };

    kk.SpanElement = function () {
        kk.Element.apply(this, arguments);
    };

    kk.SpanElement.prototype = kk.extend(kk.Element.prototype, {

        changedKey: function (key) {
            kk.Element.prototype.changedKey.apply(this, arguments);
            if (this.parent && this.parent instanceof kk.TextElement) {
                this.parent.setNeedDisplay();
            }
        },

        textView: function (element) {

            var view = document.createElement("span");

            textAttribute(view, this, element);

            view.innerText = this.get("#text") || '';

            return view;
        }

    });

    kk.ImgElement = function () {
        kk.Element.apply(this, arguments);
        this.width = new kk.Pixel();
        this.height = new kk.Pixel();
    };

    kk.ImgElement.prototype = kk.extend(kk.Element.prototype, {

        changedKey: function (key) {
            kk.Element.prototype.changedKey.apply(this, arguments);

            if (key == "width") {
                this.width.set(this.get(key));
            } else if (key == "height") {
                this.height.set(this.get(key));
            }

            if (this.parent && this.parent instanceof kk.TextElement) {
                this.parent.setNeedDisplay();
            }
        },

        textView: function (element) {

            var view = document.createElement("img");

            var image = this.app.getImage(this.get("src"));

            if (image) {
                var width = image.width();
                var height = image.height();
                if (width > 0 && height > 0) {

                    if (this.width.type == kk.Pixel.TYPE_AUTO && this.height.type == kk.Pixel.TYPE_AUTO) {

                    } else if (this.width.type == kk.Pixel.TYPE_AUTO) {
                        var v = this.height.valueOf(0, 0);
                        width = v * width / height;
                        height = v;
                    } else if (this.height.type == kk.Pixel.TYPE_AUTO) {
                        var v = this.width.valueOf(0, 0);
                        height = v * height / width;
                        width = v;
                    } else {
                        width = this.width.valueOf(0, 0);
                        height = this.height.valueOf(0, 0);
                    }

                    view.style.width = width + 'px';
                    view.style.height = height + 'px';
                    view.src = image.getURL();

                } else {
                    view.style.width = this.width.valueOf(0, 0) + 'px';
                    view.style.height = this.width.valueOf(0, 0) + 'px';
                }
            } else {
                view.style.width = this.width.valueOf(0, 0) + 'px';
                view.style.height = this.width.valueOf(0, 0) + 'px';
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
            switch (key) {
                case "font":
                    kk.Font.parse(value, view.firstChild, this.lineSpacing.valueOf(0, 0));
                    break;
                case "line-spacing":
                    kk.Font.parse(this.get("font"), view.firstChild, this.lineSpacing.valueOf(0, 0));
                    break;
                case "text-decoration":
                    view.firstChild.style.textDecoration = value || 'none';
                    break;
            }
            this.setNeedDisplay();
        },

        setView: function (view) {
            kk.ViewElement.prototype.setView.apply(this, arguments);
        },

        viewDidAppear: function (view) {

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

            if (!p) {
                view.innerText = this.get("#text") || '';
            } else {
                while (p) {
                    if (p instanceof kk.SpanElement) {
                        view.appendChild(p.textView(this));
                    } else if (p instanceof kk.ImgElement) {
                        view.appendChild(p.textView(this));
                    }
                    p = p.nextSibling;
                }
            }

            textAttribute(view, this);

            view.className = "kk-view kk-text";
            view.style.position = 'absolute';
            view.style.top = '-8000px';

            document.body.appendChild(view);

            var size = { width: view.clientWidth +2, height: view.clientHeight};

            document.body.removeChild(view);

            this._textSize = size;

            return size;
        },

        display: function () {

            this.displaying = false;

            if (!this.view) {
                return;
            }

            var p = this.firstChild;
            var view = this.view.firstChild;

            textAttribute(view, this);

            if (!p) {
                view.innerText = (this.get("#text") || '').replace("\n", "<br/>");
            } else {
                view.innerText = '';
                while (p) {
                    if (p instanceof kk.SpanElement) {
                        view.appendChild(p.textView(this));
                    } else if (p instanceof kk.ImgElement) {
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

            this.app.post(function () {
                e.display();
            });

        },

        createView: function () {
            var v = document.createElement("div");
            v.className = "kk-view kk-text";
            var pre = document.createElement("span");
            pre.style.display = 'inline-block';
            pre.style.verticalAlign = 'top';
            pre.style.margin = '0px';
            pre.style.padding = '0px';
            v.appendChild(pre);
            return v;
        },

        setLayout: function () {
            this._layout = Layout;
        },

        viewDidLayouted: function (view) {
            kk.ViewElement.prototype.viewDidLayouted.apply(this, arguments);
            this.changedKeys(["font", "line-spacing"]);
            if (this._textSize === undefined) {
                this.getTextSize();
            }
            var mtop = (this.frame.height - this._textSize.height) * 0.5;
            view.firstChild.style.margin = mtop + "px 0px 0px 0px";
        }

    });

})();

