

kk.Pixel = function () {
    this.type = 0;
    this.value = 0;
};

kk.Pixel.UnitPX = 1.0;
kk.Pixel.UnitRPX = 0.5;
kk.Pixel.UnitVW = 1.0;
kk.Pixel.UnitVH = 1.0;

kk.Pixel.TYPE_AUTO = 0;
kk.Pixel.TYPE_PERCENT = 1;
kk.Pixel.TYPE_PX = 2;
kk.Pixel.TYPE_RPX = 3;
kk.Pixel.TYPE_VW = 4;
kk.Pixel.TYPE_VH = 5;
kk.Pixel.AUTO = 0x7fffffffffffffff;

kk.Pixel.is = function (value) {
    if (value == 'auto') {
        return true;
    }
    return /^[\-\+0-9]*(px|rpx|vw|vh|\%)$/i.test(value);
};

kk.Pixel.valueOf = function (value, baseOf, defalutValue) {
    kk.Pixel.P.set(value);
    return kk.Pixel.P.valueOf(baseOf, defalutValue);
};

kk.Pixel.prototype = kk.extend(Object.prototype, {

    valueOf: function (baseOf, defaultValue) {
        var app = kk.getApp();
        switch (this.type) {
            case kk.Pixel.TYPE_PERCENT:
                return this.value * baseOf * 0.01;
            case kk.Pixel.TYPE_PX:
                if (app) {
                    return this.value * app.UnitPX;
                }
                return this.value * kk.Pixel.UnitPX;
            case kk.Pixel.TYPE_RPX:
                if (app) {
                    var v = this.value * app.UnitRPX;
                    if (this.value == 1) {
                        return Math.max(v, 1);
                    }
                    return v;
                }
                return this.value * kk.Pixel.UnitRPX;
            case kk.Pixel.TYPE_VW:
                if (app) {
                    return this.value * app.UnitVW;
                }
                return this.value * kk.Pixel.UnitVW;
            case kk.Pixel.TYPE_VH:
                if (app) {
                    return this.value * app.UnitVH;
                }
                return this.value * kk.Pixel.UnitVH;
        }
        return defaultValue;
    },

    set: function (value) {
        if (typeof value == 'string') {
            this.type = kk.Pixel.TYPE_AUTO;
            this.value = 0;
            if (value.endsWith("rpx")) {
                this.type = kk.Pixel.TYPE_RPX;
                this.value = parseFloat(value) || 0;
            } else if (value.endsWith("px")) {
                this.type = kk.Pixel.TYPE_PX;
                this.value = parseFloat(value) || 0;
            } else if (value.endsWith("vw")) {
                this.type = kk.Pixel.TYPE_VW;
                this.value = parseFloat(value) || 0;
            } else if (value.endsWith("vh")) {
                this.type = kk.Pixel.TYPE_VH;
                this.value = parseFloat(value) || 0;
            } else if (value.endsWith("%")) {
                this.type = kk.Pixel.TYPE_PERCENT;
                this.value = parseFloat(value) || 0;
            } else if (value != 'auto') {
                this.type = kk.Pixel.TYPE_PX;
                this.value = parseFloat(value) || 0;
            }
        } else if (value instanceof kk.Pixel) {
            this.type = value.type;
            this.value = value.value;
        } else {
            this.type = kk.Pixel.TYPE_AUTO;
            this.value = 0;
        }
    }
});

kk.Pixel.P = new kk.Pixel();

kk.Edge = function () {
    this.top = new kk.Pixel();
    this.right = new kk.Pixel();
    this.bottom = new kk.Pixel();
    this.left = new kk.Pixel();
};

kk.Color = {
    parse: function (value) {
        if (/^\#[0-9a-fA-F]{3,6}$/i.test(value)) {
            return value;
        } else if (/^\#[0-9a-fA-F]{8,8}$/i.test(value)) {
            var a = parseInt(value.substr(1, 2), 16);
            var r = parseInt(value.substr(3, 2), 16);
            var g = parseInt(value.substr(5, 2), 16);
            var b = parseInt(value.substr(7, 2), 16);
            return 'rgba(' + r + ',' + g + ',' + b + ',' + (a / 255.0) + ')';
        }
        return 'inherit';
    }
};

kk.Transform = {
    parse: function (value) {
        if (typeof value == 'string') {
            var vs = value.split(" ");
            var r = [];
            for (var i = 0; i < vs.length; i++) {
                var v = vs[i];
                if (v.startsWith("translate(") && v.endsWith(")")) {
                    var vv = v.substr(10, v.length - 11).split(",");
                    var x = vv.length > 0 ? kk.Pixel.valueOf(vv[0], 0, 0) + 'px' : '0px';
                    var y = vv.length > 1 ? kk.Pixel.valueOf(vv[1], 0, 0) + 'px' : '0px';
                    r.push('translate(' + x + ',' + y + ')');
                } else if (v.startsWith("scale(") && v.endsWith(")")) {
                    var vv = v.substr(6, v.length - 7).split(",");
                    var x = vv.length > 0 ? parseFloat(vv[0]) + '' : '1';
                    var y = vv.length > 1 ? parseFloat(vv[1]) + '' : '1';
                    r.push('scale(' + x + ',' + y + ')');
                } else if (v.startsWith("rotate(") && v.endsWith(")")) {
                    var vv = v.substr(7, v.length - 8).split(",");
                    var a = vv.length > 0 ? parseFloat(vv[0]) + '' : '0';
                    r.push('rotate(' + a + 'deg)');
                } else if (v.startsWith("rotateX(") && v.endsWith(")")) {
                    var vv = v.substr(8, v.length - 9).split(",");
                    var a = vv.length > 0 ? parseFloat(vv[0]) + '' : '0';
                    r.push('rotateX(' + a + 'deg)');
                } else if (v.startsWith("rotateY(") && v.endsWith(")")) {
                    var vv = v.substr(8, v.length - 9).split(",");
                    var a = vv.length > 0 ? parseFloat(vv[0]) + '' : '0';
                    r.push('rotateY(' + a + 'deg)');
                } else if (v.startsWith("rotateZ(") && v.endsWith(")")) {
                    var vv = v.substr(8, v.length - 9).split(",");
                    var a = vv.length > 0 ? parseFloat(vv[0]) + '' : '0';
                    r.push('rotateZ(' + a + 'deg)');
                }
            }

            return r.join(' ');
        }
        return '';
    }
};

kk.Font = {
    parse: function (value, view, lineSpacing) {
        if (typeof value == 'string') {
            var vs = value.split(" ");
            for (var i = 0; i < vs.length; i++) {
                var v = vs[i];
                view.style.fontWeight = 'normal';
                view.style.fontStyle = 'normal';
                if (kk.Pixel.is(v)) {
                    var size = kk.Pixel.valueOf(v, 0, 0);
                    if (size >= 12) {
                        view.style.fontSize = size + 'px';
                        view.style.lineHeight = (size + (lineSpacing || 0)) + 'px';
                        view.style.transform = '';
                    } else {
                        var scale = size / 12.0;
                        size = 12;
                        view.style.fontSize = size + 'px';
                        view.style.lineHeight = (size + (lineSpacing || 0)) + 'px';
                        view.style.transform = 'scale(' + scale + ')';
                    }
                } else if (v == 'bold') {
                    view.style.fontWeight = 'bold';
                } else if (v == 'italic') {
                    view.style.fontStyle = 'italic';
                } else {
                    view.style.fontFamily = v;
                }
            }
        } else if (lineSpacing !== undefined) {
            view.style.lineHeight = (parseFloat(view.style.fontSize) + (lineSpacing || 0)) + 'px';
        }
    }
};

kk.Edge.prototype = kk.extend(Object.prototype, {

    set: function (value) {
        if (typeof value == 'string') {
            var vs = value.split(" ");
            if (vs.length > 0) {
                this.top.set(vs[0]);
                if (vs.length > 1) {
                    this.right.set(vs[1]);
                    if (vs.length > 2) {
                        this.bottom.set(vs[2]);
                        if (vs.length > 3) {
                            this.left.set(vs[3]);
                        } else {
                            this.left.set(this.right);
                        }
                    } else {
                        this.bottom.set(this.top);
                        this.left.set(this.right);
                    }
                } else {
                    this.right.set(this.top);
                    this.bottom.set(this.top);
                    this.left.set(this.top);
                }
            }
        } else {
            this.top.set('auto');
            this.left.set('auto');
            this.bottom.set('auto');
            this.right.set('auto');
        }
    }
});

kk.ViewElement = function () {
    kk.Element.apply(this, arguments);
    this.frame = { x: 0, y: 0, width: 0, height: 0 };
    this.contentSize = { width: 0, height: 0 };
    this.contentOffset = { x: 0, y: 0 };
    this.padding = new kk.Edge();
    this.margin = new kk.Edge();
    this.width = new kk.Pixel();
    this.minWidth = new kk.Pixel();
    this.maxWidth = new kk.Pixel();
    this.height = new kk.Pixel();
    this.minHeight = new kk.Pixel();
    this.maxHeight = new kk.Pixel();
    this.left = new kk.Pixel();
    this.top = new kk.Pixel();
    this.right = new kk.Pixel();
    this.bottom = new kk.Pixel();
    this.lineSpacing = new kk.Pixel();
    this.verticalAlign = 'top';
    this.position = 'none';
    this.view = null;
    this._layout = kk.ViewElement.RelativeLayout;
};

kk.ViewElement.RelativeLayout = function (element) {

    var size = { width: element.frame.width, height: element.frame.height };
    var padding = {
        left: element.padding.left.valueOf(size.width, 0),
        top: element.padding.top.valueOf(size.width, 0),
        right: element.padding.right.valueOf(size.width, 0),
        bottom: element.padding.bottom.valueOf(size.width, 0),
    };

    var inSize = { width: size.width - padding.left - padding.right, height: size.height - padding.top - padding.bottom };

    var contentSize = { width: 0, height: 0 };

    var p = element.firstChild;

    while (p) {

        if (p instanceof kk.ViewElement) {

            var margin = {
                left: p.margin.left.valueOf(size.width, 0),
                top: p.margin.top.valueOf(size.width, 0),
                right: p.margin.right.valueOf(size.width, 0),
                bottom: p.margin.bottom.valueOf(size.width, 0),
            };

            var width = p.width.valueOf(inSize.width - margin.left - margin.right, kk.Pixel.AUTO);
            var height = p.height.valueOf(inSize.height - margin.top - margin.bottom, kk.Pixel.AUTO);

            p.frame.width = width;
            p.frame.height = height;

            p.layoutChildren();

            if (width == kk.Pixel.AUTO) {
                width = p.contentSize.width;
                var min = p.minWidth.valueOf(inSize.width, 0);
                var max = p.maxWidth.valueOf(inSize.width, kk.Pixel.AUTO);
                if (width < min) {
                    width = min;
                }
                if (width > max) {
                    width = max;
                }
                p.frame.width = width;
            }

            if (height == kk.Pixel.AUTO) {
                height = p.contentSize.height;
                var min = p.minHeight.valueOf(inSize.height, 0);
                var max = p.maxHeight.valueOf(inSize.height, kk.Pixel.AUTO);
                if (height < min) {
                    height = min;
                }
                if (height > max) {
                    height = max;
                }
                p.frame.height = height;
            }

            var left = p.left.valueOf(inSize.width, kk.Pixel.AUTO);
            var right = p.right.valueOf(inSize.width, kk.Pixel.AUTO);
            var top = p.top.valueOf(inSize.height, kk.Pixel.AUTO);
            var bottom = p.bottom.valueOf(inSize.height, kk.Pixel.AUTO);

            if (left == kk.Pixel.AUTO) {
                if (size.width == kk.Pixel.AUTO) {
                    left = padding.left + margin.left;
                } else if (right == kk.Pixel.AUTO) {
                    left = padding.left + margin.left + (inSize.width - width - margin.left - margin.right) * 0.5;
                } else {
                    left = padding.left + (inSize.width - right - margin.right - width);
                }
            } else {
                left = padding.left + left + margin.left;
            }

            if (top == kk.Pixel.AUTO) {
                if (size.height == kk.Pixel.AUTO) {
                    top = padding.top + margin.top;
                } else if (bottom == kk.Pixel.AUTO) {
                    top = padding.top + margin.top + (inSize.height - height - margin.top - margin.bottom) * 0.5;
                } else {
                    top = padding.top + (inSize.height - height - margin.bottom - bottom);
                }
            } else {
                top = padding.top + top + margin.top;
            }

            p.frame.x = left;
            p.frame.y = top;

            if (left + padding.right + margin.right + width > contentSize.width) {
                contentSize.width = left + padding.right + margin.right + width;
            }

            if (top + padding.bottom + margin.bottom + height > contentSize.height) {
                contentSize.height = top + padding.bottom + margin.bottom + height;
            }

            p.didLayouted();
        }

        p = p.nextSibling;
    }

    element.contentSize = contentSize;

    return contentSize;

};

kk.ViewElement.LineLayout = function (elements, inSize, lineHeight) {
    for (var i = 0; i < elements.length; i++) {
        var element = elements[i];
        if (element.verticalAlign == 'bottom') {
            var mbottom = element.margin.bottom.valueOf(inSize.height, 0);
            var mtop = element.margin.top.valueOf(inSize.height, 0);
            element.frame.y = element.frame.y + (lineHeight - mtop - mbottom - element.frame.height);
        } else if (element.verticalAlign == 'middle') {
            var mbottom = element.margin.bottom.valueOf(inSize.height, 0);
            var mtop = element.margin.top.valueOf(inSize.height, 0);
            element.frame.y = element.frame.y + (lineHeight - mtop - mbottom - element.frame.height) * 0.5;
        }
        element.didLayouted();
    }
};

kk.ViewElement.FlexLayout = function (element, isAutoWarp) {

    if (isAutoWarp === undefined) {
        isAutoWarp = true;
    }

    var size = { width: element.frame.width, height: element.frame.height };
    var padding = {
        left: element.padding.left.valueOf(size.width, 0),
        top: element.padding.top.valueOf(size.width, 0),
        right: element.padding.right.valueOf(size.width, 0),
        bottom: element.padding.bottom.valueOf(size.width, 0),
    };

    var inSize = { width: size.width - padding.left - padding.right, height: size.height - padding.top - padding.bottom };

    var y = padding.top;
    var x = padding.left;
    var maxWidth = padding.left + padding.right;
    var lineHeight = 0;

    var lines = [];

    var p = element.firstChild;

    while (p) {

        if (p instanceof kk.ViewElement) {

            if (p.isHidden()) {
                p = p.nextSibling;
                continue;
            }

            var margin = {
                left: p.margin.left.valueOf(size.width, 0),
                top: p.margin.top.valueOf(size.width, 0),
                right: p.margin.right.valueOf(size.width, 0),
                bottom: p.margin.bottom.valueOf(size.width, 0),
            };

            var width = p.width.valueOf(inSize.width - margin.left - margin.right, kk.Pixel.AUTO);
            var height = p.height.valueOf(inSize.height - margin.top - margin.bottom, kk.Pixel.AUTO);

            p.frame.width = width;
            p.frame.height = height;

            p.layoutChildren();

            if (width == kk.Pixel.AUTO) {
                width = p.contentSize.width;
                var min = p.minWidth.valueOf(inSize.width, 0);
                var max = p.maxWidth.valueOf(inSize.width, kk.Pixel.AUTO);
                if (width < min) {
                    width = min;
                }
                if (width > max) {
                    width = max;
                }
                p.frame.width = width;
            }

            if (height == kk.Pixel.AUTO) {
                height = p.contentSize.height;
                var min = p.minHeight.valueOf(inSize.height, 0);
                var max = p.maxHeight.valueOf(inSize.height, kk.Pixel.AUTO);
                if (height < min) {
                    height = min;
                }
                if (height > max) {
                    height = max;
                }
                p.frame.height = height;
            }

            if (isAutoWarp && x + margin.left + margin.right + padding.right + p.frame.width > size.width) {
                if (lines.length > 0) {
                    kk.ViewElement.LineLayout(lines, inSize, lineHeight);
                    lines = [];
                }
                y += lineHeight;
                lineHeight = 0;
                x = padding.left;
            }

            var left = x + margin.left;
            var top = y + margin.top;

            x += width + margin.left + margin.right;

            if (lineHeight < height + margin.top + margin.bottom) {
                lineHeight = height + margin.top + margin.bottom;
            }

            p.frame.x = left;
            p.frame.y = top;

            if (left + padding.right + margin.right + width > maxWidth) {
                maxWidth = left + padding.right + margin.right + width;
            }

            lines.push(p);
        }

        p = p.nextSibling;
    }

    if (lines.length > 0) {
        kk.ViewElement.LineLayout(lines, inSize, lineHeight);
    }

    element.contentSize = { width: maxWidth, height: y + lineHeight + padding.bottom };

    return element.contentSize;
};

kk.ViewElement.HorizontalLayout = function (element) {
    return kk.ViewElement.FlexLayout(element, false);
};


kk.ViewElement.prototype = kk.extend(kk.Element.prototype, {

    changedKey: function (key) {
        kk.Element.prototype.changedKey.apply(this, arguments);
        var v = this.get(key);
        switch (key) {
            case "padding":
                this.padding.set(v)
                break;
            case "margin":
                this.margin.set(v)
                break;
            case "width":
                this.width.set(v)
                break;
            case "min-width":
                this.minWidth.set(v)
                break;
            case "max-width":
                this.maxWidth.set(v)
                break;
            case "height":
                this.height.set(v)
                break;
            case "min-height":
                this.minHeight.set(v)
                break;
            case "max-height":
                this.maxHeight.set(v)
                break;
            case "left":
                this.left.set(v)
                break;
            case "top":
                this.top.set(v)
                break;
            case "right":
                this.right.set(v)
                break;
            case "bottom":
                this.bottom.set(v)
                break;
            case "layout":
                this.setLayout(v)
                break;
            case "vertical-align":
                this.verticalAlign = v;
                break;
            case "position":
                this.position = v;
                break;
            case "line-spacing":
                this.lineSpacing.set(v);
                break;
            case "skin":
                this.setUpdateSkin();
                break;
        }
        if (this.view) {
            this.viewChangedKey(this.view, key, v);
        }
    },

    updateSkin: function () {


        this.updattingSkin = false;
        var skin = this.get("skin");

        var e = this.firstChild;

        while (e) {

            if (e.get("#name") == "skin" && e.get("name") == skin) {
                break;
            }

            e = e.nextSibling;
        }

        if (e) {
            var attrs = e.attributes;
            var vs = {};

            for (var key in attrs) {
                if (key == 'name' || key.startsWith('#')) {
                    continue;
                }
                vs[key] = attrs[key];
            }

            this.setAttrs(vs);
        }

    },

    setUpdateSkin: function () {

        if (this.updattingSkin) {
            return;
        }

        this.updattingSkin = true;

        var element = this;
        var app = this.app;

        app.post(function () {
            element.updateSkin();
        });

    },

    setLayout: function (layout) {
        if (typeof layout == 'string') {
            switch (layout) {
                case 'relative':
                    this._layout = (kk.ViewElement.RelativeLayout);
                    break;
                case 'flex':
                    this._layout = (kk.ViewElement.FlexLayout);
                    break;
                case 'horizontal':
                    this._layout = (kk.ViewElement.HorizontalLayout);
                    break;
                default:
                    this._layout = (null);
                    break;
            }
        } else {
            this._layout = (layout);
        }
    },

    createView: function () {
        var e = document.createElement("div");
        e.setAttribute("class", "kk-view");
        return e;
    },

    setView: function (view) {
        this.view = view;
        if (view) {
            $(view).on("click", function (e) {
                e.stopPropagation();
            });
        }
    },

    viewChangedKey: function (view, key, value) {
        switch (key) {
            case "background-color":
                view.style.backgroundColor = kk.Color.parse(value);
                break;
            case "border-width":
                view.style.borderWidth = kk.Pixel.valueOf(value, 0, 0) + 'px';
                break;
            case "border-color":
                view.style.borderColor = kk.Color.parse(value);
                break;
            case "border-radius":
                view.style.borderRadius = kk.Pixel.valueOf(value, 0, 0) + 'px';
                break;
            case "overflow":
                if (value == "hidden") {
                    view.style.overflow = 'hidden';
                } else {
                    view.style.overflow = 'inherit';
                }
                break;
            case "color":
                view.style.color = kk.Color.parse(value);
                break;
            case "background-image":
                this.setNeedUpdateBackgroundView();
                break;
            case "text-align":
                view.style.textAlign = value;
                break;
            case "hidden":
                view.style.display = (value == 'true') ? 'none' : 'inherit';
                break;
            case "enabled":
                if (value != 'true') {
                    $(view).off("click");
                }
                break;
            case "opacity":
                this.setDidChangedKey(key);
                break;
            case "transform":
                this.setDidChangedKey(key);
                break;
            case "animation":
                this.setDidChangedKey(key);
                break;
        }
    },

    didChangedKeys: function () {

        this.didChangedKeying = false;

        var view = this.view;

        if (!view) {
            return;
        }

        var attrs = this.didChangedKeys;

        delete this.didChangedKeys;

        if (attrs) {

            var element = this;

            var setAttrs = function () {
                for (var key in attrs) {
                    if (key == "opacity") {
                        view.style.opacity = parseFloat(element.get(key));
                    } else if (key == "transform") {
                        view.style.transform = kk.Transform.parse(element.get(key));
                    }
                }
            };

            if (attrs["animation"]) {

                var anim = element.get("animation");

                if (this._curAnimation != anim) {
                    this._curAnimation = anim;
                    if (anim) {
                        var e = this.firstChild;
                        while (e) {
                            if (e instanceof kk.AnimationElement) {
                                if (e.get("name") == anim) {
                                    break;
                                }
                            }
                            e = e.nextSibling;
                        }
                        if (e) {
                            e.startAnimation(this, view, setAttrs);
                            return;
                        }
                    }
                }


            }

            setAttrs();


        }

    },

    setDidChangedKey: function (key) {

        if (this.didChangedKeys === undefined) {
            this.didChangedKeys = {};
        }

        this.didChangedKeys[key] = true;

        var view = this.view;

        if (!view) {
            return;
        }

        if (this.didChangedKeying) {
            return;
        }

        this.didChangedKeying = true;

        var element = this;
        var app = this.app;

        app.post(function () {
            element.didChangedKeys();
        });
    },

    updateBackgroundView: function () {

        this._updateBackgroundView = false;

        if (this.frame.width <= 0 || this.frame.height <= 0) {
            return;
        }

        var view = this.view;

        if (!view) {
            return;
        }

        var value = this.get("background-image");

        if (!value) {
            return;
        }

        var vs = (value || '').split(" ");

        if (vs.length > 0 && vs[0]) {
            var image = this.app.getImage(vs[0]);
            if (image && vs.length > 1) {
                var img = document.createElement("img");
                img.src = image.getURL();
                var mCapLeft = (parseInt(vs[1]) || 0) * image.scale;
                var mCapTop = (parseInt(vs[2]) || 0) * image.scale;
                var mCapSize = 1 * image.scale;
                var v = 1.0 / image.scale;
                var canvas = document.createElement("canvas");
                var width = canvas.width = this.frame.width;
                var height = canvas.height = this.frame.height;
                var mWidth = img.width;
                var mHeight = img.height;
                var capSize = 1;

                if (mCapLeft != 0 && mCapTop != 0) {
                    if (mWidth * v >= width) {
                        mCapLeft = 0;
                    }
                    if (mHeight * v >= height) {
                        mCapTop = 0;
                    }
                } else if (mCapLeft != 0 && mCapTop == 0) {
                    if (mWidth * v >= mWidth * xScale) {
                        mCapLeft = 0;
                    }
                } else if (mCapLeft == 0 && mCapTop != 0) {
                    if (mHeight * v >= mHeight * yScale) {
                        mCapTop = 0;
                    }
                }

                var ctx = canvas.getContext("2d");

                if (mCapTop == 0) {

                    var xScale = height / mHeight;

                    var capLeft = (mCapLeft * xScale);
                    var capRight = width - (mWidth * xScale - capLeft - mCapSize);

                    ctx.drawImage(img, 0, 0, mCapLeft, mHeight, 0, 0, capLeft, height);
                    ctx.drawImage(img, mCapLeft, 0, mCapSize, mHeight, capLeft, 0, capRight - capLeft, height);
                    ctx.drawImage(img, mCapLeft + mCapSize, 0, mWidth - mCapLeft - mCapSize, mHeight
                        , capRight, 0, width - capRight, height);

                } else if (capLeft == 0) {

                    var yScale = width / mWidth;

                    var capTop = (mCapTop * yScale);
                    var capBottom = height - (mHeight * yScale - capTop - mCapSize);

                    ctx.drawImage(img, 0, 0, mWidth, mCapTop, 0, 0, width, capTop);
                    ctx.drawImage(img, 0, mCapTop, mWidth, mCapSize,
                        0, capTop, width, capBottom - capTop);
                    ctx.drawImage(img, 0, mCapTop + mCapSize, mWidth, mHeight - mCapTop - mCapSize
                        , 0, capBottom, width, height);

                } else {

                    var capLeft = mCapLeft * v;
                    var capRight = width - (mWidth - capLeft - capSize) * v;
                    var capTop = mCapTop * v;
                    var capBottom = height - (mHeight - capTop - capSize) * v;

                    ctx.drawImage(img, 0, 0, mCapLeft, mCapTop,
                        0, 0, capLeft, capTop);
                    ctx.drawImage(img, 0, mCapTop, mCapLeft, capSize
                        , 0, capTop, capLeft, capBottom - capTop);
                    ctx.drawImage(img, 0, mCapTop + capSize, mCapLeft, mHeight
                        , 0, capBottom, capLeft, height - capBottom);

                    ctx.drawImage(img, mCapLeft + capSize, top, mWidth - mCapLeft - capSize, mCapTop
                        , capRight, 0, width - capRight, capTop);
                    ctx.drawImage(img, mCapLeft + capSize, mCapTop, mWidth - mCapLeft - capSize, capSize
                        , capRight, capTop, width - capRight, capBottom - capTop);
                    ctx.drawImage(img, mCapLeft + capSize, mCapTop + capSize, mWidth - mCapLeft - capSize, mHeight - mCapTop - capSize
                        , capRight, capBottom, width - capRight, height - capBottom);

                    ctx.drawImage(img, mCapLeft, 0, capSize, mCapTop
                        , capLeft, 0, capRight - capLeft, capTop);
                    ctx.drawImage(img, mCapLeft, mCapTop, capSize, capSize,
                        capLeft, capTop, capRight - capLeft, capBottom - capTop);
                    ctx.drawImage(img, mCapLeft, mCapTop + capSize, capSize, mHeight - mCapTop - capSize
                        , capLeft, capBottom, capRight - capLeft, height - capBottom);
                }


                view.style.backgroundImage = "url(" + canvas.toDataURL("image/png") + ")";
                view.style.backgroundSize = "100% 100%";

            } else if (image) {
                view.style.backgroundImage = "url(" + image.getURL() + ")";
                view.style.backgroundSize = "100% 100%";
            } else {
                view.style.backgroundImage = '';
            }
        } else {
            view.style.backgroundImage = '';
        }


    },

    setNeedUpdateBackgroundView: function () {

        if (!this.view) {
            return;
        }

        if (this._updateBackgroundView) {
            return;
        }

        var v = this.get("background-image");

        if (v) {
            var vs = (v || '').split(" ");
            if (vs.length > 1) {
                var element = this;
                this.app.post(function () {
                    element.updateBackgroundView();
                });
            } else {
                this.updateBackgroundView();
            }
        }
    },

    viewDidLayouted: function (view) {
        view.style.position = 'absolute';
        view.style.width = this.frame.width + 'px';
        view.style.height = this.frame.height + 'px';
        view.style.left = this.frame.x + 'px';
        view.style.top = this.frame.y + 'px';
        view.style.zIndex = this.depth;
        this.setNeedUpdateBackgroundView();
    },

    obtainView: function (view, addSubview) {

        if (this.view && this.view.parentElement == view) {
            this.obtainChildrenView();
            return;
        }

        this.recycleView();

        if (this.frame.width <= 0 || this.frame.height <= 0) {
            return;
        }

        var v = this.createView();

        this.setView(v);

        var keys = this.keys();
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var value = this.get(key);
            this.viewChangedKey(v, key, value);
        }

        this.viewDidLayouted(v);

        this.obtainChildrenView();

        if (typeof addSubview == 'function') {
            addSubview(v, this, view);
        } else if (this.parent instanceof kk.ViewElement) {
            this.parent.addSubview(v, this, view);
        } else {
            view.appendChild(v);
        }

    },

    recycle: function () {
        this.recycleView(false);
        kk.Element.prototype.recycle.apply(this, arguments);
    },

    recycleView: function (isRecycleChildrenView) {

        if (isRecycleChildrenView === undefined) {
            isRecycleChildrenView = true;
        }

        if (this.view) {
            var p = this.view.parentElement;
            if (p) {
                p.removeChild(this.view);
            }
            this.setView(null);
        }

        if (isRecycleChildrenView) {
            var e = this.firstChild;
            while (e) {
                if (e instanceof kk.ViewElement) {
                    e.recycleView();
                }
                e = e.nextSibling;
            }
        }
    },

    contentView: function () {
        return this.view;
    },

    obtainChildrenView: function () {

        var v = this.contentView();

        if (v) {
            var p = this.firstChild;
            while (p) {
                if (p instanceof kk.ViewElement) {
                    p.obtainView(v);
                }
                p = p.nextSibling;
            }
        }
    },

    remove: function () {
        this.recycleView();
        kk.Element.prototype.remove.apply(this, arguments);
    },

    addSubview: function (view, element, toView) {
        var v = element.get("floor");
        if (v == "back") {
            if (toView.firstElementChild) {
                toView.insertBefore(view, toView.firstElementChild);
            } else {
                toView.appendChild(view);
            }
        } else {
            toView.appendChild(view);
        }
    },

    isHidden: function () {
        return this.get("hidden") == 'true';
    },

    layoutChildren: function () {
        if (this._layout) {
            this.contentSize = this._layout(this);
        }
    },

    didLayouted: function () {
        if (this.view) {
            this.viewDidLayouted(this.view);
        }
    },

    layout: function (width, height) {
        this.frame.width = width;
        this.frame.height = height;
        if (this._layout) {
            this.contentSize = this._layout(this);
        }
        this.didLayouted();
    },

    setContentOffset: function (x, y) {
        this.contentOffset.x = x;
        this.contentOffset.y = y;
    },

    onResize: function () {
        this.changedKeys(["border-width", "font", "border-radius"]);
        var e = this.firstChild;
        while (e) {
            if (e instanceof kk.ViewElement) {
                e.onResize();
            }
            e = e.nextSibling;
        }
    }
});
