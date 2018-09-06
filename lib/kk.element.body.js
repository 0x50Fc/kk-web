//BODY
(function () {


    kk.BodyElement = function () {
        kk.ViewElement.apply(this, arguments);
    };

    kk.BodyElement.prototype = kk.extend(kk.ViewElement.prototype, {

        viewDidLayouted: function (view) {
            this.setNeedUpdateBackgroundView();
        },

        obtainView: function (view, addSubview) {

            if (this.view == view) {
                this.obtainChildrenView();
                return;
            }

            this.recycleView();

            if (this.frame.width <= 0 || this.frame.height <= 0) {
                return;
            }

            var v = view;

            this.setView(v);

            var keys = this.keys();
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                var value = this.get(key);
                this.viewChangedKey(v, key, value);
            }

            this.viewDidLayouted(v);

            this.obtainChildrenView();

            this.viewWillAppear(v);

            this.viewDidAppear(v);
        },

        recycleView: function () {

            if (this.view) {
                this.onRecycleView(this.view);
                this.viewWillDisappear(this.view);
                this.viewDidDisappear(this.view);
                this.setView(null);
            }

            var e = this.firstChild;
            while (e) {
                if (e instanceof kk.ViewElement) {
                    e.recycleView();
                }
                e = e.nextSibling;
            }
        },

        viewChangedKey: function (view, key, value){
            if(key == "z-index") {
                var e = this.firstChild;
                while (e) {
                    e.set(key,value);
                    e = e.nextSibling;
                }
                return;
            }
            kk.ViewElement.prototype.viewChangedKey.apply(this,arguments);
        },

    });

})();

