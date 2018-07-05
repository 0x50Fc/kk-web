//按钮
(function () {


    kk.ButtonElement = function () {
        kk.ViewElement.apply(this, arguments);
    };

    kk.ButtonElement.prototype = kk.extend(kk.ViewElement.prototype, {

        setView: function (view) {
            if(this.view) {
                $(this.view).off("click");
            }
            kk.ViewElement.prototype.setView.apply(this,arguments);
            if(this.view) {
                var element = this;
                $(this.view).on("click",function(){
                    var e = new kk.ElementEvent(element);
                    e.data = element.data();
                    element.emit("tap",e);
                });
            }
        }

    });

})();

