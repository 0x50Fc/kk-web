(function () {

    var KeyCallback = function () {
        this.priority = 0;
    };

    KeyCallback.prototype.run = function (data, changedKeys) {

        var v;

        if (typeof this.evaluateScript == 'function') {
            v = this.evaluateScript(data.object);
        } else if (this.keys !== undefined) {
            v = data.get(this.keys);
        }

        if (typeof this.fn == 'function') {
            this.fn(v, changedKeys, data);
        }

    };

    var KeyObserver = function () {
        this.children = {};
        this.cbs = [];
    };


    KeyObserver.prototype.add = function (keys, cb, index) {

        if (index < keys.length) {

            var key = keys[index];

            var ch = this.children[key];

            if (ch === undefined) {
                ch = new KeyObserver();
                this.children[key] = ch;
            }

            ch.add(keys, cb, index + 1);

        } else {
            this.cbs.push(cb);
        }
    };

    KeyObserver.prototype.remove = function (keys, fn, index) {

        if (fn === undefined) {
            this.children = {};
            this.cbs = [];
        } else if (index < keys.length) {
            var key = keys[index];
            var ch = this.children[key];
            if (ch) {
                ch.remove(keys, fn, index + 1);
            }
        } else {
            var cbs = [];
            for (var i = 0; i < this.cbs.length; i++) {
                var cb = this.cbs[i];
                if (cb.fn != fn) {
                    cbs.push(cb);
                }
            }
            this.cbs = cbs;
            for (var key in this.children) {
                var ch = this.children[key];
                ch.remove(keys, cbs, index);
            }
        }

    };

    KeyObserver.prototype.change = function (keys, cbs, index) {

        if (index === undefined) {
            index = 0;
        }

        if (index < keys.length) {

            var key = keys[index];

            var ch = this.children[key];

            if (ch) {
                ch.change(keys, cbs, index + 1);
            }

            for (var i = 0; i < this.cbs.length; i++) {
                var cb = this.cbs[i];
                if (cb.children) {
                    cbs.push(cb);
                }
            }

        } else {

            for (var key in this.children) {
                var ch = this.children[key];
                ch.change(keys, cbs, index);
            }

            for (var i = 0; i < this.cbs.length; i++) {
                var cb = this.cbs[i];
                cbs.push(cb);
            }

        }
    };


    var Data = function (object) {
        this.object = object || {};
        this.keyObserver = new KeyObserver();
    };

    Data.IObject = function() {}

    Data.IObject.prototype.get = function(key) {
        return this[key];
    };

    Data.IObject.prototype.set = function(key,value) {
        this[key] = value;
    };

    Data.get = function (object, keys, index) {

        if (keys === undefined) {
            return object;
        }

        if (typeof keys == 'string') {
            keys = keys.split(".");
        }

        if (keys instanceof Array) {

            if (index === undefined) {
                index = 0;
            }

            if (index < keys.length) {

                var key = keys[index];

                if (typeof object == 'object') {
                    if(object instanceof Data.IObject) {
                        return Data.get(object.get(key), keys, index + 1);
                    }
                    return Data.get(object[key], keys, index + 1);
                }

            } else {
                return object;
            }

        }

    };

    Data.set = function (object, keys, value, index) {

        if (keys === undefined) {
            return;
        }

        if (typeof object != 'object') {
            return;
        }

        if (typeof keys == 'string') {
            keys = keys.split(".");
        }

        if (keys instanceof Array) {

            if (index === undefined) {
                index = 0;
            }

            if (index + 1 < keys.length) {

                var key = keys[index];

                var v ;
                
                if(object instanceof Data.IObject) {
                    v = object.get(key);
                } else {
                    v = object[key];
                }

                if (v === undefined) {
                    v = {};
                    if(object instanceof Data.IObject) {
                        object.set(key,v);
                    } else {
                        object[key] = v;
                    }
                }

                Data.set(v, keys, value, index + 1);

            } else if (index < keys.length) {
                var key = keys[index];
                if(object instanceof Data.IObject) {
                    object.set(key,value);
                } else {
                    object[key] = value;
                }
            }
        }

    };

    Data.prototype.get = function (keys) {
        return Data.get(this.object, keys);
    };

    Data.prototype.set = function (keys, value, changed) {
        Data.set(this.object, keys, value);
        if (changed === undefined || changed === true) {
            this.changedKeys(keys);
        }
    };

    Data.prototype.on = function (keys, fn, children, priority) {
        var onKeys = [];
        var cb = new KeyCallback();
        cb.fn = fn;
        cb.children = children || false;
        cb.priority = priority || 0;

        if (typeof keys == 'string') {

            cb.evaluateScript = eval('(function(object){ var _G = {}; try { with(object) { _G.ret = ' + keys + '; } } catch(e) {  } return _G.ret; } )');

            var v = keys.replace(/(\\\')|(\\\")/g, '');

            v = v.replace(/(\'.*?\')|(\".*?\")/g, '');

            v = v.replace(/\".*?\"/g, '');

            v.replace(/[a-zA-Z_][0-9a-zA-Z\\._]*/g, function (name) {

                if (name && !name.startsWith("_")) {
                    onKeys.push(name.split("."));
                }

            });
        } else if (keys instanceof Array) {
            cb.keys = keys;
            onKeys.push(keys);
        } else {
            return false;
        }

        if (onKeys.length == 0) {
            var v;
            try {
                v = cb.evaluateScript(this.object);
            } catch (e) {
                kk.log("[ERROR] " + e);
            }
            if (v !== undefined) {
                fn(v);
            }
        } else {
            while (onKeys.length) {
                this.keyObserver.add(onKeys.shift(), cb, 0);
            }
        }

    };

    Data.prototype.off = function (keys, fn) {
        this.keyObserver.remove(keys, fn, 0);
    }

    Data.prototype.changedKeys = function (keys) {

        if (keys === undefined) {
            return;
        }

        if (typeof keys == 'string') {
            keys = keys.split(".");
        }

        if (keys instanceof Array) {
            var cbs = [];
            this.keyObserver.change(keys, cbs);
            cbs.sort(function(a,b){
                return a.priority - b.priority;
            });
            for (var i = 0; i < cbs.length; i++) {
                var cb = cbs[i];
                cb.run(this, keys);
            }
        }

    };

    Data.prototype.setParent = function(parent) {
        if(this.fnParent && this.parent) {
            this.parent.off([],this.fnParent);
            delete this.parent;
            delete this.fnParent;
        }

        if(parent) {
            this.parent = parent;
            var data = this;
            this.fnParent = function(value,keys) {
                if(value !== undefined) {
                    data.set(keys,Data.get(value,keys));
                }
            };
            parent.on([],this.fnParent,true);
            for(var key in parent.object){
                this.object[key] = parent.object[key];
            }
            this.changedKeys([]);
        }
        
    };

    Data.prototype.recycle = function() {
        if(this.fnParent && this.parent) {
            this.parent.off([],this.fnParent);
            delete this.parent;
            delete this.fnParent;
        }
    };

    kk.Data = Data;

})();