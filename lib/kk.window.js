
(function () {

    kk.Window = function () {
        kk.Page.apply(this, arguments);
    };

    kk.Window.prototype = kk.extend(kk.Page.prototype, {

        createTopbar: function () {

        },

        installTopbar : function() {

        },

        createElement: function () {
            this.element = new kk.BodyElement();
            this.element.setAttrs({ width: '100%', height: '100%', padding: '-20px 0px 0px 0px' });
            return this.element;
        },

    });

})();

