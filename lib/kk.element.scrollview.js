//ScrollView
(function () {

    var PositionTypeTop = "top";
    var PositionTypeBottom = "bottom";

    var isPositionType = function (type) {
        return type == PositionTypeTop || type == PositionTypeBottom;
    };

    kk.ScrollViewElement = function () {
        kk.ViewElement.apply(this, arguments);
        this.contentOffset = { x: 0, y: 0 };
        this.positionViews = {};
        this.onScrollId = undefined;
        this.tracking = false;
        this.scrolling = false;
    };

    kk.ScrollViewElement.prototype = kk.extend(kk.ViewElement.prototype, {

        createView: function () {
            var v = document.createElement("div");
            v.className = "kk-view";
            v.scrollView = document.createElement("div");
            v.scrollView.className = "kk-scrollview";
            v.scrollView.style.position = 'relative';
            v.scrollView.style.width = '100%';
            v.scrollView.style.height = '100%';
            v.appendChild(v.scrollView);
            v.contentView = document.createElement("div");
            v.scrollView.appendChild(v.contentView);
            return v;
        },

        clearPositionView: function (type) {

            var contentView = this.contentView();

            if (!contentView) {
                return contentView;
            }

            var v = this.positionViews[type];

            if (v) {
                if (v.firstChild && v.element) {
                    var view = v.firstChild;
                    v.removeChild(view);
                    view.style.left = v.element.frame.x + 'px';
                    view.style.top = v.element.frame.y + 'px';
                    this.addSubview(view, v.element, contentView);
                }
                v.style.display = 'none';
                delete v.element;
            }

        },

        setPositionView: function (element, type) {

            var contentView = this.contentView();

            if (!contentView) {
                return;
            }

            if (!isPositionType(type)) {
                return;
            }

            if (element instanceof kk.ViewElement) {

                var view = element.view;

                if (view) {

                    var v = this.positionViews[type];

                    if (v) {
                        if (v.element != element) {
                            this.clearPositionView(type);
                        } else {
                            return;
                        }
                    } else {
                        v = document.createElement("div");
                        v.style.display = 'none';
                        v.style.margin = '0px';
                        v.style.padding = '0px';
                        if (type == PositionTypeBottom) {
                            v.style.position = 'absolute';
                            v.style.width = '100%';
                            v.style.left = '0px';
                            var bottom = this.padding.bottom.valueOf(0, 0);
                            v.style.bottom = bottom + 'px';
                        } else if (type == PositionTypeTop) {
                            v.style.position = 'absolute';
                            v.style.width = '100%';
                            v.style.left = '0px';
                            var top = this.padding.top.valueOf(0, 0);
                            v.style.top = top + 'px';
                        }
                        this.view.appendChild(v);
                        this.positionViews[type] = v;
                    }

                    if (view.parentNode) {
                        view.parentNode.removeChild(view);
                    }

                    view.style.top = '0px';
                    view.style.left = '0px';

                    v.appendChild(view);
                    v.style.display = 'block';
                    v.element = element;

                } else {
                    this.clearPositionView(type);
                }

            } else {
                this.clearPositionView(type);
            }
        },

        onScroll: function (x, y) {

            this.contentOffset = { x: x, y: y };

            var contentView = this.contentView();

            var e = this.firstChild;

            while (e) {

                if (e instanceof kk.ViewElement) {
                    var view = e.view;
                    if (view) {
                        var type = e.get("position");
                        switch (type) {
                            case "top":
                                var top = e.margin.top.valueOf(0, 0);
                                if (y - e.frame.y > top) {
                                    this.setPositionView(e, type);
                                } else {
                                    this.setPositionView(undefined, type);
                                }
                                break;
                            case "bottom":
                                var bottom = e.margin.bottom.valueOf(0, 0);
                                var dy = y + this.frame.height - e.frame.height - bottom - e.frame.y;
                                if (dy > 0) {
                                    this.setPositionView(e, type);
                                } else {
                                    this.setPositionView(undefined, type);
                                }
                                break;
                        }
                    }

                }

                e = e.nextSibling;
            }

            if (this.hasEvent("scroll")) {

                var data = {
                    tracking: this.tracking,
                    x: x,
                    y: y,
                    w: this.contentSize.width,
                    h: this.contentSize.height,
                    width: this.frame.width,
                    height: this.frame.height
                };

                var e = new kk.ElementEvent(this);
                e.data = data;
                this.emit("scroll", e);
            }

            if (!this.anchorScrolling && this.hasEvent("anchor")) {

                var p = this.lastChild;
                var anchor;
                var element;
                var margin = new kk.Edge();
                while (p) {

                    if (p instanceof kk.ViewElement) {
                        anchor = p.get("anchor");
                        if (anchor !== undefined) {
                            margin.set(p.get("anchor-margin"));
                            if (y >= p.frame.y - margin.top.valueOf(0, 0)) {
                                element = p;
                                break;
                            }
                        }
                    }

                    p = p.prevSibling;
                }

                if (element) {
                    if (anchor != this.anchor) {
                        this.anchor = anchor;

                        var data = {
                            tracking: this.tracking,
                            x: x,
                            y: y,
                            w: this.contentSize.width,
                            h: this.contentSize.height,
                            width: this.frame.width,
                            height: this.frame.height,
                            view: {
                                width: element.frame.width,
                                height: element.frame.height,
                                x: element.frame.x,
                                y: element.frame.y,
                                anchor: anchor
                            }
                        };

                        var e = new kk.ElementEvent(this);

                        e.data = data;

                        this.emit("anchor", e);

                    }
                }

            }
        },

        setView: function (view) {
            if (this.onScrollId) {
                clearInterval(this.onScrollId);
                delete this.onScrollId;
            }
            this.positionViews = {};
            kk.ViewElement.prototype.setView.apply(this, arguments);
            if (view) {
                var scrollView = view.scrollView;
                var element = this;
                var scrollX = undefined;
                var scrollY = undefined;
                this.onScrollId = setInterval(function () {

                    if (scrollView.scrollTop != scrollY || scrollView.scrollLeft != scrollX) {
                        scrollX = scrollView.scrollLeft;
                        scrollY = scrollView.scrollTop;
                        element.onScroll(scrollX, scrollY);
                    }

                }, 1000 / 60);

                $(view)
                    .on("touchstart", function (e) {
                        element.setTracking(true);
                    })
                    .on("touchend", function (e) {
                        element.setTracking(false);
                    })
                    .on("touchcancel", function (e) {
                        element.setTracking(false);
                    });
            }
        },

        setTracking: function (v) {
            this.tracking = v;
            if (v) {
                this.cancelScroll();
            }
        },

        contentView: function () {
            return this.view ? this.view.contentView : undefined;
        },

        viewDidLayouted: function (view) {
            kk.ViewElement.prototype.viewDidLayouted.apply(this, arguments);
            var v = this.contentView();
            if (v) {
                var width = this.contentSize.width;
                if (this.get("overflow-x") == 'scroll') {
                    width = Math.max(width, this.frame.width);
                    this.view.scrollView.style.overflowX = 'scroll';
                }
                var height = this.contentSize.height;
                if (this.get("overflow-y") == 'scroll') {
                    height = Math.max(height, this.frame.height);
                    this.view.scrollView.style.overflowY = 'scroll';
                }
                v.style.width = width + 'px';
                v.style.height = height + 'px';
            }
        },

        cancelScroll: function () {
            if (this.scrolling) {
                clearInterval(this.scrolling.id);
                if (typeof this.scrolling.fn == 'function') {
                    this.scrolling.fn(false);
                }
                this.scrolling = false;
            }
        },

        scrollTo: function (x, y, animated, fn) {

            this.cancelScroll();

            if (this.view && this.view.scrollView) {

                if (!animated) {
                    this.view.scrollView.scrollTo(x, y);
                    if (typeof fn == 'function') {
                        fn();
                    }
                    return;
                }

                var element = this;

                this.scrolling = {
                    fn: fn
                };

                var cur = {
                    x: this.view.scrollView.scrollLeft,
                    y: this.view.scrollView.scrollTop,
                    duration: 300,
                    start: (new Date()).getTime(),
                    view: this.view.scrollView
                };

                this.scrolling.id = cur.id = setInterval(function () {
                    var v = (new Date()).getTime();
                    var a = (v - cur.start) / cur.duration;
                    if (a >= 1) {
                        cur.view.scrollLeft = x;
                        cur.view.scrollTop = y;
                        clearInterval(cur.id);
                        element.scrolling = false;
                        if (typeof fn == 'function') {
                            fn();
                        }
                    } else {
                        cur.view.scrollLeft = cur.x + (x - cur.x) * a;
                        cur.view.scrollTop = cur.y + (y - cur.y) * a;
                    }
                }, 1000 / 60);

            } else {
                if (typeof fn == 'function') {
                    fn();
                }
            }
        },

        emit: function (name, event) {

            kk.ViewElement.prototype.emit.apply(this, arguments);

            if (event instanceof kk.ElementEvent) {

                if (name == 'scrolltop') {

                    event.cancelBubble = true;

                    if (this.view && this.view.scrollView) {
                        this.scrollTo(0, 0, true);
                    }

                } else if (name == 'anchor') {

                    event.cancelBubble = true;

                    if (this.view && this.view.scrollView) {

                        var margin = new kk.Edge();

                        if (event.data && event.data.margin) {
                            margin.set(event.data.margin);
                        }

                        if (event.data && event.data.anchor) {

                            var anchor = event.data.anchor;

                            var element;

                            var p = this.firstChild;

                            while (p) {

                                if (p instanceof kk.ViewElement) {
                                    var v = p.get("anchor");
                                    if (v !== undefined && v == anchor) {
                                        element = p;
                                        break;
                                    }
                                }
                                p = p.nextSibling;
                            }

                            if (element) {
                                var x = element.frame.x - margin.left.valueOf(0, 0);
                                var y = element.frame.y - margin.top.valueOf(0, 0);
                                var e = this;
                                e.anchorScrolling = true;
                                this.scrollTo(x, y, true, function () {
                                    e.anchorScrolling = false;
                                });
                            }
                        }

                    }
                }

            }
        }


    });

})();

