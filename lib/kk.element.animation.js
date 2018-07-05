//动画
(function () {


    kk.AnimationElement = function () {
        kk.ViewElement.apply(this, arguments);
    };

    kk.AnimationElement.prototype = kk.extend(kk.Element.prototype, {

        startAnimation : function(element,view,fn) {

            var from = {};
            var to = {};
            var app = element.app;

            var e = this.firstChild;

            while(e) {

                var name = e.get("#name");
                
                if(name == "anim:opacity") {

                    from.opacity = parseFloat(e.get("from"));
                    to.opacity = parseFloat(e.get("to"));

                } else if(name == "anim:transform") {

                    from.transform = kk.Transform.parse(e.get("from"));
                    to.transform =  kk.Transform.parse(e.get("to"));

                }

                e = e.nextSibling;
            }
            
            $(view).css(from).animate(to,parseInt(this.get("duration")) || 300,'liner',function(){
                kk.pushApp(app);
                if(typeof fn == 'function') {
                    fn();
                }
                kk.popApp();
            });

        }

    });

})();

