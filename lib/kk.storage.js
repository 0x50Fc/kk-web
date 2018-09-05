

(function(kk){

    kk.Storage = function(name) {
        this._name = name;
        this._object = {};

        var v = window.localStorage.getItem(name);

        if(v) {
            this._object = JSON.parse(v);
        }

        if(typeof this._object != 'object') {
            this._object = {};
        }
    };

    kk.Storage.globalStorage = new kk.Storage("__G");

    kk.Storage.prototype = kk.extend(kk.Data.IObject.prototype,{

        get : function(key) {
            return this._object[key];
        },

        set : function(key,value) {
            if(value === undefined) {
                delete this._object[key];
            } else {
                this._object[key] = value;
            }
        },

        save : function() {
            window.localStorage.setItem(this._name,JSON.stringify(this._object));
        }
    });


})(kk);
