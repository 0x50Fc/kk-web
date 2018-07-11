
(function () {

    kk.Window = function () {
        kk.Page.apply(this, arguments);
    };

    kk.Window.prototype = kk.extend(kk.Page.prototype, {

        createTopbar: function () {

        }

    });

})();

