kk.ElementEvent = function (element) {
    kk.Event.call(this);
    this.cancelBubble = false;
    this.element = element;
};

kk.ElementEvent.prototype = kk.extend(kk.Event.prototype, {

});

kk.Element = function () {
    kk.EventEmitter.call(this);
    this.attributes = {};
    this.styles = {};
    this.parent = null;
    this.prevSibling = null;
    this.nextSibling = null;
    this.firstChild = null;
    this.lastChild = null;
    this.depth = 0;
    this.app = kk.getApp();
};

kk.Element.prototype = kk.extend(kk.EventEmitter.prototype, {

    append: function (element) {

        if (!(element instanceof kk.Element)) {
            return;
        }

        element.remove();

        if (this.lastChild) {
            this.lastChild.nextSibling = element;
            element.prevSibling = this.lastChild;
            this.lastChild = element;
            element.parent = this;
        } else {
            this.firstChild = this.lastChild = element;
            element.parent = this;
        }

        this.didAddChildren(element);

        return this;
    },

    before: function (element) {

        if (!(element instanceof kk.Element)) {
            return;
        }

        element.remove();

        if (this.prevSibling) {
            this.prevSibling.nextSibling = element;
            element.prevSibling = this.prevSibling;
            element.nextSibling = this;
            element.parent = this.parent;
            this.prevSibling = element;
        } else if (this.parent) {
            element.nextSibling = this;
            element.parent = this.parent;
            this.prevSibling = element;
            this.parent.firstChild = element;
        }

        if (this.parent) {
            this.parent.didAddChildren(element);
        }

        return this;
    },

    after: function (element) {

        if (!(element instanceof kk.Element)) {
            return;
        }

        element.remove();

        if (this.nextSibling) {
            this.nextSibling.prevSibling = element;
            element.nextSibling = this.nextSibling;
            element.prevSibling = this;
            element.parent = this.parent;
            this.nextSibling = element;
        } else if (this.parent) {
            element.prevSibling = this;
            element.parent = this.parent;
            this.nextSibling = element;
            this.parent.lastChild = element;
        }

        if (this.parent) {
            tihs.parent.didAddChildren(element);
        }

        return this;
    },

    remove: function () {

        if (this.prevSibling) {
            this.parent.willRemoveChildren(element);

            this.prevSibling.nextSibling = this.nextSibling;
            if (this.nextSibling) {
                this.nextSibling.prevSibling = this.prevSibling;
            } else {
                this.parent.lastChild = this.prevSibling;
            }
        } else if (this.parent) {

            this.parent.willRemoveChildren(element);

            this.parent.firstChild = this.nextSibling;

            if (this.nextSibling) {
                this.nextSibling.prevSibling = null;
            } else {
                this.parent.lastChild = null;
            }
        }

        return this;
    },

    appendTo: function (element) {
        if (element) {
            element.append(this);
        }
        return this;
    },

    beforeTo: function (element) {
        if (element) {
            element.before(this);
        }
        return this;
    },

    afterTo: function (element) {
        if (element) {
            element.after(this);
        }
        return this;
    },

    willRemoveChildren: function (element) {
        element.depth = 0;
    },

    didAddChildren: function (element) {
        element.depth = this.depth + 1;
    },

    changedKeys: function (keys) {
        for (var i = 0; i < keys.length; i++) {
            this.changedKey(keys[i]);
        }
    },

    changedKey: function (key) {

    },

    keys: function () {
        var hasKeys = {
            "status": true, "in-status": true
        };
        var keys = [];
        for (var key in this.attributes) {
            if (!hasKeys[key]) {
                keys.push(key);
                hasKeys[key] = true;
            }
        }
        var s = this.status();
        var attrs = this.styles[s];
        if (attrs) {
            for (var key in attrs) {
                if (!hasKeys[key]) {
                    keys.push(key);
                    hasKeys[key] = true;
                }
            }
        }
        if (s != '') {
            attrs = this.styles[''];
            if (attrs) {
                for (var key in attrs) {
                    if (!hasKeys[key]) {
                        keys.push(key);
                        hasKeys[key] = true;
                    }
                }
            }
        }
        return keys;
    },

    get: function (key) {
        var v = this.attributes[key];
        if (v === undefined) {
            var s = this.status();
            if (s === undefined) {
                s = "";
            }
            var attrs = this.styles[s];
            if (attrs) {
                v = attrs[key];
            }
            if (v === undefined && s != "") {
                attrs = this.styles[""];
                if (attrs) {
                    v = attrs[key];
                }
            }
        }
        return v;
    },

    set: function (key, value) {
        if (!key) {
            return;
        }

        if (value === undefined) {
            delete this.attributes[key];
        } else {
            this.attributes[key] = value;
        }

        if (key == "status" || key == "in-status") {
            
            var hasKeys = {
                "status": true, "in-status": true
            };
            var keys = [];
            var s = this.status();
            var attrs = this.styles[s];
            if (attrs) {
                for (var key in attrs) {
                    if (!hasKeys[key]) {
                        keys.push(key);
                        hasKeys[key] = true;
                    }
                }
            }
            if (s != '') {
                attrs = this.styles[''];
                if (attrs) {
                    for (var key in attrs) {
                        if (!hasKeys[key]) {
                            keys.push(key);
                            hasKeys[key] = true;
                        }
                    }
                }
            }
            this.changedKeys(keys);
            var e = this.firstChild;
            while (e) {
                e.set("in-status", value);
                e = e.nextSibling;
            }
        } else {
            this.changedKeys([key]);
        }
    },

    setAttrs: function (attrs) {
        if (!attrs) {
            return;
        }
        var keys = [];
        for (var key in attrs) {
            this.attributes[key] = attrs[key];
            keys.push(key);
        }
        this.changedKeys(keys);
    },

    setStyle: function (attrs, status) {

        if (!attrs) {
            return;
        }

        if (!status) {
            status = "";
        }

        var keys = [];

        var vs = this.styles[status];
        if (vs === undefined) {
            this.styles[status] = attrs;
            for (var key in attrs) {
                keys.push(key);
            }
        } else {
            for (var key in attrs) {
                vs[key] = attrs[key];
                keys.push(key);
            }
        }

        this.changedKey(keys);
    },

    setCSSStyle: function (cssStyle, status) {

        if (!cssStyle) {
            return;
        }

        var attrs = {};

        cssStyle.replace(/([A-Za-z0-9\- ]*)\:([^\;\n\r]*)/g, function (text, key, value) {
            attrs[key.trim()] = value.trim();
        });

        this.setStyle(attrs, status);

    },

    status: function () {
        var s = this.attributes["status"];
        if (s === undefined) {
            s = this.attributes["in-status"];
        }
        return s || '';
    },

    setStatus: function (status) {
        this.set("status", status || '');
    },

    data: function () {

        var data = {};

        for (var key in this.attributes) {
            if (key.startsWith("data-")) {
                var v = this.attributes[key];
                data[key.substr(5)] = v;
            }
        }

        return data;
    },

    emit: function (name, event) {
        kk.EventEmitter.prototype.emit.apply(this, arguments);
        if (event instanceof kk.ElementEvent) {
            if (!event.cancelBubble) {
                var p = this.parent;
                if (p) {
                    p.emit(name, event);
                }
            }
        }
    },

    hasEventBubble: function (name) {
        if (this.hasEvent(name)) {
            return true;
        }
        var p = this.parent;
        if (p) {
            return p.hasEventBubble(name);
        }
        return false;
    },

    recycle: function () {
        this.off();
        this.remove();
        var p = this.firstChild;
        while (p) {
            var n = p.nextSibling;
            p.recycle();
            p = n;
        }
    },

    toString: function () {
        var v = [];
        var name = this.get("#name");
        if (name === undefined) {
            name = "element";
        }

        v.push("\t".repeat(this.depth));
        v.push("<");
        v.push(name);

        for (var key in this.attributes) {
            if (key.startsWith("#")) {
                continue;
            }
            v.push(" ");
            v.push(key);
            v.push("=");
            v.push(JSON.stringify(this.attributes[key] + ''));
        }

        for (var key in this.styles) {
            v.push(" ");
            v.push("style");
            if (key != "") {
                v.push(":");
                v.push(key);
            }
            v.push("=\"");
            var attrs = this.styles[key];
            for (var name in attrs) {
                v.push(name);
                v.push(": ");
                v.push(attrs[name] + '');
                v.push("; ");
            }
            v.push("\"");
        }

        v.push(">");

        var p = this.firstChild;
        if (p) {
            v.push("\n");
            while (p) {
                v.push(p.toString());
                v.push("\n");
                p = p.nextSibling;
            }
            v.push("\t".repeat(this.depth));
        } else {
            v.push(this.get("#text") || '');
        }

        v.push("</");
        v.push(name);
        v.push(">");

        return v.join('');
    }

});

