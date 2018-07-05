
kk.Event = function () {

};

kk.Event.prototype = kk.extend(Object.prototype, {

});

kk.EventEmitter = function () {
    this.events = {};
};

kk.EventEmitter.prototype = kk.extend(Object.prototype, {

    on: function (name, fn) {
        if (name && fn) {
            var fns = this.events[name];
            if (fns === undefined) {
                fns = [];
                this.events[name] = fns;
            }
            fns.push(fn);
        }
    },

    off: function (name, fn) {
        if (name && fn === undefined) {
            delete this.events[name];
        } else if (name === undefined && fn === undefined) {
            this.events = {};
        } else if (name) {
            var fns = this.events[name];
            if (fns) {
                var count = 0;
                for (var i = 0; i < fns.length; i++) {
                    var v = fns[i];
                    if (fn == v) {
                        delete fns[i];
                    } else if (v) {
                        count++;
                    }
                }
                if (count == 0) {
                    delete this.events[name];
                }
            }
        } else {
            var rm = [];
            for (var name in this.events) {
                var fns = this.events[name];
                var count = 0;
                for (var i = 0; i < fns.length; i++) {
                    var v = fns[i];
                    if (fn == v) {
                        delete fns[i];
                    } else if (v) {
                        count++;
                    }
                }
                if (count == 0) {
                    rm.push(name);
                }
            }

            for (var i = 0; i < rm.length; i++) {
                delete this.events[rm[i]];
            }
        }
    },

    emit: function (name, event) {
        if (name && event) {
            var fns = this.events[name];
            if (fns) {
                var vs = fns.slice();
                for (var i = 0; i < vs.length; i++) {
                    var fn = vs[i];
                    if (fn) {
                        var args = [];
                        for(var i=1;i<arguments.length;i++){
                            args.push(arguments[i]);
                        }
                        fn.apply(this, args)
                    }
                }
            }
        }
    },

    hasEvent: function (name) {
        return this.events[name] !== undefined;
    }
});
