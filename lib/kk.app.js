kk.apps = [];

kk.Image = function (app, url, ver) {
    this.image = new Image();
    this.loaded = false;

    var v = this;

    var fn = function () {
        v.loaded = true;
        var event = new kk.Event();
        event.image = v;
        app.emit("image", event);
    };

    this.image.onload = fn;
    this.image.onerror = fn;
    this.image.src = url + '?v=' + ver;
};

kk.Image.prototype = kk.extend(kk.EventEmitter.prototype, {
    getURL: function () {
        return this.image.src;
    }
});

kk.Script = function (app, url, ver) {
    var key = "kk:" + url + '?v=' + ver;
    if (window.localStorage) {
        this.content = window.localStorage.getItem(key);
    }
    if (!this.content) {
        var v = this;
        kk.http.send({
            method: 'GET',
            type: 'text',
            url: url + "?v=" + ver,
            onload: function (data) {
                v.content = data;
                v.loaded = true;
                if (window.localStorage) {
                    window.localStorage.setItem(key, data);
                }
                var event = new kk.Event();
                event.script = v;
                app.emit("script", event);
            },
            onfail: function (data) {
                v.loaded = true;
                var event = new kk.Event();
                event.script = v;
                app.emit("script", event);
            }
        });
    } else {
        this.loaded = true;
    }
};

kk.log = function (text) {
    console.info("[KK] [" + kk.date.format(new Date(), 'yyyy-MM-dd hh:mm:ss') + "] " + text);
};

kk.Application = function () {
    kk.EventEmitter.apply(this);
    this.data = new kk.Data();
    this.UnitPX = 1.0;
    this.UnitRPX = 0.5;
    this.UnitVW = 1.0;
    this.UnitVH = 1.0;
    this.images = {};
    this.scripts = {};
    this.pages = [];
    this.resizeId = false;
    this.modules = {};

    var app = this;

    this.data.on(["action", "open"], function (data) {
        app.onAction(data);
    });
};

kk.getApp = function () {
    var n = kk.apps.length;
    if (n > 0) {
        return kk.apps[n - 1];
    }
};

kk.pushApp = function (app) {
    kk.apps.push(app);
};

kk.popApp = function () {
    return kk.apps.pop();
};

kk.Application.prototype = kk.extend(kk.EventEmitter.prototype, {

    run: function (url, view) {
        var a = document.createElement("a");
        a.href = url;
        this.baseURL = a.href;
        var i = this.baseURL.lastIndexOf("/");
        if (i > 0) {
            this.baseURL = this.baseURL.substr(0, i + 1);
        }
        this.view = view ? view : document.body;

        var width = this.view.clientWidth;
        var height = this.view.clientHeight;

        this.UnitRPX = Math.min(width, height) / 750.0;
        this.UnitVH = height * 0.01;
        this.UnitVW = width * 0.01;

        var app = this;
        kk.http.send({
            method: 'GET',
            url: url,
            onload: function (data) {
                app.open(data, url);
            },
            onfail: function (e) {
                var event = new kk.Event();
                event.errmsg = e + '';
                app.emit("error", event);
            }
        });

        (function (view, app) {
            var w = view.width();
            var h = view.height();
            app.resizeId = setInterval(function () {
                if (view.width() != w || view.height() != h) {
                    w = view.width();
                    h = view.height();
                    app.resize(w, h);
                }
            }, 1000 / 30);
        })($(this.view), this);
    },

    getScript: function (path) {
        var v = this.scripts[path];
        if (v && v.loaded) {
            return v.content;
        }
    },

    getImage: function (path) {

        if (!path) {
            return;
        }

        var i = path.lastIndexOf(".");
        var ext = "";

        if (i >= 0) {
            ext = path.substr(i);
            path = path.substr(0, i);
        }

        var s = 3;

        while (s > 0) {

            var name;

            if (s == 1) {
                name = path + ext;
            } else {
                name = path + "@" + s + "x" + ext;
            }

            var v = this.images[name];

            if (v && v.loaded) {
                return v;
            }

            s--;
        }

    },

    require: function (path) {
        var m = this.modules[path];
        if (m === undefined) {
            m = { exports: {} };
            this.modules[path] = m;
            var v = this.getScript(path);
            if (v) {
                var fn = eval('(function(module,exports,app,http,print){' + v + '})');
                if (typeof fn == 'function') {
                    fn(m, m.exports, this.data, kk.http, kk.log);
                }
            }
        }
        return m.exports;
    },

    exec: function (path, librarys) {

        var script = this.getScript(path);

        if (!script) {
            return;
        }

        if (!librarys) {
            librarys = {};
        }

        if (!librarys["app"]) {
            librarys["app"] = this.data;
        }

        if (!librarys["http"]) {
            librarys["http"] = kk.http;
        }

        if (!librarys["print"]) {
            librarys["print"] = kk.log;
        }

        var app = this;

        librarys["kk"] = {
            platform: 'web',
            require: function (path) {
                if (path.startsWith("./")) {
                    path = path.substr(2);
                }
                return app.require(path);
            }
        };

        var args = [];
        var code = ['(function('];

        for (var key in librarys) {
            if (args.length != 0) {
                code.push(',');
            }
            code.push(key);
            args.push(librarys[key]);
        }

        code.push("){ ");
        code.push(script);
        code.push(" })");

        var fn = eval(code.join(''));

        kk.pushApp(this);

        fn.apply(null, args);

        kk.popApp();

    },

    main: function () {
        this.exec("main.js", {});
    },

    done: function () {

        var done = true;

        for (var key in this.scripts) {
            var v = this.scripts[key];
            if (!v.loaded) {
                done = false;
                break;
            }
        }

        if (done) {
            for (var key in this.images) {
                var v = this.images[key];
                if (!v.loaded) {
                    done = false;
                    break;
                }
            }
        }

        if (done) {
            var event = new kk.Event();
            event.app = this;
            this.emit("load", event);
            this.main();
        }

    },

    open: function (appInfo, url) {

        var items = appInfo.res;
        if (items) {
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                if (item.path && item.ver) {
                    if (item.path.endsWith(".js")) {
                        var v = new kk.Script(this, this.baseURL + item.path, item.ver);
                        this.scripts[item.path] = v;
                    } else if (item.path.endsWith(".jpg") || item.path.endsWith(".png") || item.path.endsWith(".gif")) {
                        var v = new kk.Image(this, this.baseURL + item.path, item.ver);
                        this.images[item.path] = v;
                    }
                }
            }
        }
        this.done();
    },

    emit: function (name, event) {
        kk.EventEmitter.prototype.emit.apply(this, arguments);
        if (name == "script" || name == "image") {
            this.done();
        }
    },

    onAction: function (action) {
        kk.pushApp(this);

        if (action.back) {
            var vs = action.back.split("/");
            while (vs.length > 0) {
                var v = vs.pop();
                if (v == '..') {
                    var page = this.pages.pop();
                    if (page) {
                        page.recycle();
                    }
                }
            }
        }

        if (action.path) {
            var page = new kk.Page(this);
            page.open(action.path);
            if(action.type == 'window') {
                this.openWindow(page);
            } else {
                this.openPage(page);
            }
        } else if (action.url) {
            window.location = action.url;
        }

        kk.popApp();
    },

    recycle: function () {
        this.data.off();
        if (this.resizeId) {
            clearInterval(this.resizeId);
            delete this.resizeId;
        }
    },

    getCurPage: function () {
        if (this.pages.length > 0) {
            return this.pages[this.pages.length - 1];
        }
    },

    openWindow : function(page,animated) {
        page.obtainView(this.view);
        page.data.on(["action", "close"], function (data) {
            if(data.afterDelay) {
                setTimeout(function(){
                    page.recycleView();
                },data.afterDelay);
            } else {
                page.recycleView();
            }
        });
    },

    openPage: function (page, animated) {
        var v = this.getCurPage();
        if (v) {
            v.recycleView(this.view);
        }
        page.obtainView(this.view);
        this.pages.push(page);
        var app = this;
        page.data.on(["action", "close"], function (data) {
            app.back(data && data.animated);
        });
    },

    back: function (animated) {
        if (this.pages.length == 1) {
            var event = new kk.Event();
            event.animated = animated;
            this.emit("close", event);
            return;
        }
        var v = this.pages.pop();
        if (v) {
            v.recycle();
        }
        v = this.getCurPage();
        if (v) {
            v.obtainView(this.view);
        }
    },

    resize: function (width, height) {
        var v = this.getCurPage();
        if (v) {
            this.UnitRPX = Math.min(width, height) / 750.0;
            this.UnitVH = height * 0.01;
            this.UnitVW = width * 0.01;
            kk.pushApp(this);
            v.resize(width, height);
            kk.popApp();
        }
    }

});
