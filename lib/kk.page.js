
(function () {

    var elements = {
        "view": kk.ViewElement,
        "body": kk.ViewElement,
        "text": kk.TextElement,
        "span": kk.SpanElement,
        "img": kk.ImgElement,
        "image": kk.ImageElement,
        "button": kk.ButtonElement,
        "webview": kk.WebViewElement,
        "scroll": kk.ScrollViewElement,
        "slide": kk.SlideViewElement,
        "animation": kk.AnimationElement,
        "pager": kk.PagerViewElement,
        "app": kk.AppElement,
        "page": kk.PageElement,
        "input": kk.InputElement,
        "topbar": kk.Element,
        "select": kk.SelectElement,
        "option": kk.Element,
        "textarea": kk.TextareaElement
    };

    var ViewEachAttribute = function (e, attrs, data) {

        for (var key in attrs) {
            var v = attrs[key];

            if (key.startsWith("kk:")) {

                if (key == "kk:text") {
                    data.on(v, function (value, keys) {
                        if (value !== undefined && value !== null) {
                            e.set("#text", value + '');
                        }
                    });
                } else if (key == "kk:show") {
                    data.on(v, function (value, keys) {
                        if (value !== undefined && value !== null) {
                            e.set("hidden", value ? 'false' : 'true');
                        }
                    });
                } else if (key == "kk:hide") {
                    data.on(v, function (value, keys) {
                        if (value !== undefined && value !== null) {
                            e.set("hidden", value ? 'true' : 'false');
                        }
                    });
                } else if (key.startsWith("kk:on")) {
                    (function (keys) {
                        e.on(key.substr(5), function (event) {
                            if (event.element == e) {
                                var p = data;
                                while (p.parent) {
                                    p = p.parent;
                                }
                                p.set(keys, event.data);
                            }
                        });
                    })(v.split("."));
                } else if (key.startsWith("kk:emit_")) {
                    (function (name) {

                        data.on(v, function (value, keys) {
                            if (value !== undefined && value !== null) {
                                var ev = new kk.ElementEvent(e);
                                ev.data = value;
                                e.emit(name, ev);
                            }
                        }, true);

                    })(key.substr(8));
                } else {
                    (function (name) {

                        data.on(v, function (value, keys) {
                            if (value === undefined || value === null) {
                                e.set(name, '');
                            } else {
                                e.set(name, value + '');
                            }
                        });

                    })(key.substr(3));
                }

            } else if (key.startsWith("style:")) {
                e.setCSSStyle(v, key.substr(6));
            } else if (key == "style") {
                e.setCSSStyle(v, "");
            } else {
                e.set(key, v);
            }
        }

    };

    var ViewCreateWithName = function (name) {
        var alloc = elements[name];

        if (alloc === undefined) {
            alloc = kk.Element;
        }

        return new alloc();
    };

    var ViewCreate = function (name, attrs, element, data, fn) {

        var e = ViewCreateWithName(name);

        ViewEachAttribute(e, attrs, data);

        element.append(e);

        if (fn) {
            fn(e, data);
        }

        return e;
    };

    var View = function (name, attrs, element, data, fn) {

        if (attrs["kk:for"]) {

            var evaluate = attrs["kk:for"];

            delete attrs["kk:for"];

            (function (evaluate) {

                var indexKey = "index";
                var itemKey = "item";
                var evaluateScript = evaluate;
                var i = evaluate.indexOf(" in ");

                if (i >= 0) {
                    itemKey = evaluate.substr(0, i);
                    evaluateScript = evaluate.substr(i + 4);
                    i = itemKey.indexOf(",");
                    if (i >= 0) {
                        indexKey = itemKey.substr(0, i);
                        itemKey = itemKey.substr(i + 1);
                    }
                }

                var be = new kk.Element();

                element.append(be);

                var elements = [];
                var datas = [];
                var app = kk.getApp();

                data.on(evaluateScript, function (value) {

                    kk.pushApp(app);

                    var i = 0;

                    var item = function (idx, object) {
                        var e;
                        var d;
                        if (i < elements.length) {
                            e = elements[i];
                            d = datas[i];
                        } else {
                            d = new kk.Data();
                            e = ViewCreateWithName(name);
                            ViewEachAttribute(e, attrs, d);
                            be.before(e);
                            if (fn) {
                                fn(e, d);
                            }
                            elements.push(e);
                            datas.push(d);
                            d.setParent(data);
                        }
                        d.set([indexKey], idx);
                        d.set([itemKey], object);
                        i++;
                    };

                    if (value instanceof Array) {
                        for (var n = 0; n < value.length; n++) {
                            item(n, value[n]);
                        }
                    } else if (value instanceof Object) {
                        for (var key in value) {
                            item(key, value[key]);
                        }
                    }

                    while (i < elements.length) {
                        var e = elements.pop();
                        var d = datas.pop();
                        e.recycle();
                        d.off();
                    }

                    kk.popApp();

                });


            })(evaluate);
        } else if (attrs["kk:if"]) {

            var evaluate = attrs["kk:if"];
            delete attrs["kk:if"];

            (function (evaluate) {

                var be = new kk.Element();
                element.append(be);

                var e;
                var d;
                var app = kk.getApp();

                data.on(evaluate, function (value) {

                    kk.pushApp(app);

                    if (value) {
                        if (!e) {
                            d = new kk.Data();
                            e = ViewCreateWithName(name);
                            ViewEachAttribute(e, attrs, d);
                            be.before(e);
                            if (fn) {
                                fn(e, d);
                            }
                            d.setParent(data);
                        }
                    } else {
                        if (e) {
                            d.recycle();
                            e.remove();
                            d = undefined;
                            e = undefined;
                        }
                    }

                    kk.popApp();

                });


            })(evaluate);

        } else {
            ViewCreate(name, attrs, element, data, fn);
        }

    };

    kk.Page = function (app) {
        this.app = app;
        this.data = new kk.Data({});
        this.appReflect = new kk.DataReflect(app.data);
    };

    kk.Page.prototype = kk.extend(Object.prototype, {

        createTitleView: function () {
            this.titleView = new kk.TextElement();
            this.titleView.setAttrs({ font: '18px', color: '#000', layout: 'relative', margin: '20px 0px 0px 0px', width: '50%', height: '100%', 'text-align': 'center' });
            this.topbar.append(this.titleView);
        },

        createLeftButton: function () {
            this.leftButton = new kk.ButtonElement();
            this.leftButton.setAttrs({ height: '100%', left: '0px', padding: '20px 6px 0px 3px', hidden: 'true' });
            this.topbar.append(this.leftButton);

            var v = new kk.TextElement();
            v.setAttrs({ '#text': '返回', 'font': '16px', 'color': '#666', 'left': '4px' });
            v.appendTo(this.leftButton);

            var app = this.app;

            this.leftButton.on("tap", function (e) {
                app.back(true);
            });
        },

        createTopbar: function () {
            this.topbar = new kk.ViewElement();
            this.topbar.setAttrs({ width: '100%', top: '0px', height: '64px', 'background-color': '#fff', layout: 'relative' });
            var v = new kk.ViewElement();
            v.setAttrs({ width: '100%', height: '1px', 'background-color': '#a8e5e5e5', 'bottom': '0px' });
            v.appendTo(this.topbar);
            this.element.append(this.topbar);
            this.createTitleView();
            this.createLeftButton();

            var page = this;

            this.data.on(["page", "title"], function (v) {
                if (v !== undefined) {
                    kk.pushApp(page.app);
                    page.titleView.set("#text", v + '');
                    if (page.topbar.view) {
                        page.topbar.layoutChildren();
                    }
                    kk.popApp();
                }
            });

            this.data.on(["page", "topbar", "hidden"], function (v) {
                if (v !== undefined) {
                    kk.pushApp(page.app);
                    page.topbar.set("hidden", v ? 'true' : 'false');
                    kk.popApp();
                }
            });

        },

        createElement: function () {
            this.element = new kk.ViewElement();
            this.element.setAttrs({ width: '100%', height: '100%', padding: '-20px 0px 0px 0px' });
            return this.element;
        },

        installTopbar: function () {
            if (!this.element) {
                return;
            }
            var element = this.element.firstChild;
            if (!element) {
                return;
            }
            element = element.firstChild;
            if (!element || element.get("#name") != "topbar") {
                return;
            }
            var e = element.firstChild;
            while (e) {
                var n = e.nextSibling;
                if (e instanceof kk.ViewElement) {
                    switch (e.get("target")) {
                        case "left":
                            {
                                if (this.leftView) {
                                    continue;
                                }
                                if (this.leftButton) {
                                    this.leftButton.remove();
                                }
                                this.leftView = new kk.ViewElement();
                                this.leftView.setAttrs({ "width": "25%", height: "100%", left: "0px", padding: '20px 0px 0px 3px' });
                                this.leftView.appendTo(this.topbar);
                                this.leftView.append(e);
                            }
                            break;
                        case "center":
                            {
                                if (this.centerView) {
                                    continue;
                                }
                                if (this.titleView) {
                                    this.titleView.remove();
                                }
                                this.centerView = new kk.ViewElement();
                                this.centerView.setAttrs({ "width": "50%", height: "100%", padding: '20px 0px 0px 0px' });
                                this.centerView.appendTo(this.topbar);
                                this.centerView.append(e);
                            }
                            break;
                        case "right":
                            {
                                if (this.rightView) {
                                    continue;
                                }
                                this.rightView = new kk.ViewElement();
                                this.rightView.setAttrs({ "width": "25%", height: "100%", padding: '20px 3px 0px 0px', right: '0px' });
                                this.rightView.appendTo(this.topbar);
                                this.rightView.append(e);
                            }
                            break;
                    }
                }
                e = n;
            }
        },

        open: function (path) {
            var element = this.createElement();
            var data = this.data;
            var v = this.app.getScript(path + "_view.js");

            if (v) {
                eval(v);
            }

            this.createTopbar();
            this.installTopbar();

            this.app.exec(path + ".js", { page: this.data, app: this.appReflect });
        },

        recycle: function () {
            this.data.off();
            this.data.recycle();
            this.appReflect.off();
            this.appReflect.recycle();
        },

        setOrientation: function (width, height) {
            switch (this.app.orientation) {
                case 'portrait':
                    this.data.set(["page", "orientation"], { landscape: false, portrait: true, landscapeLeft: false, landscapeRight: false });
                    break;
                case 'landscape':
                    this.data.set(["page", "orientation"], { landscape: true, portrait: false, landscapeLeft: true, landscapeRight: false });
                    break;
                default:
                    if (width > height) {
                        this.data.set(["page", "orientation"], { landscape: true, portrait: false, landscapeLeft: true, landscapeRight: false });
                    } else {
                        this.data.set(["page", "orientation"], { landscape: false, portrait: true, landscapeLeft: false, landscapeRight: false });
                    }
            }
        },

        obtainView: function (view) {

            var page = this;
            var app = this.app;

            if (this.fnDataChanged) {
                this.data.off(["data"], this.fnDataChanged);
                delete this.fnDataChanged;
            }

            this.data.set(["page", "willAppear"], {});

            if (this.element instanceof kk.ViewElement) {
                this.setOrientation(view.clientWidth, view.clientHeight);
                app.post(function () {
                    page.element.layout(view.clientWidth, view.clientHeight);
                    page.element.obtainView(view);
                });
            }

            this.fnDataChanged = function (value, keys) {
                if (keys.length > 0 && (keys[0] == 'data' || keys[0] == 'page')) {
                    if (page.element instanceof kk.ViewElement) {
                        app.post(function () {
                            page.element.layout(view.clientWidth, view.clientHeight);
                            page.element.obtainView(view);
                        });
                    }
                }
            };

            this.data.on(["data"], this.fnDataChanged, true, 1);

            this.data.set(["page", "didAppear"], {});

        },

        recycleView: function () {
            this.data.set(["page", "willDisappear"], {});
            if (this.element instanceof kk.ViewElement) {
                this.element.recycleView();
            }
            this.data.set(["page", "didDisappear"], {});
            if (this.fnDataChanged) {
                this.data.off(["data"], this.fnDataChanged);
                delete this.fnDataChanged;
            }
        },

        resize: function (width, height, view) {
            if (this.element instanceof kk.ViewElement) {
                this.element.onResize();
                this.setOrientation(width, height);
                var page = this;
                var app = this.app;
                app.post(function () {
                    page.element.layout(width, height);
                    if (view && page.element instanceof kk.ViewElement) {
                        page.element.obtainView(view);
                    }
                });
            }
        }

    });

})();

