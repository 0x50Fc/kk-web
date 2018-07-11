//PagerView
(function () {


    kk.PagerViewElement = function () {
        kk.ScrollViewElement.apply(this, arguments);
        this.pageScrollX = 0;
        this.pageScrollV = 0;
        this.loop = true;
    };

    kk.PagerViewElement.prototype = kk.extend(kk.ScrollViewElement.prototype, {

        changedKey: function (key) {
            kk.ScrollViewElement.prototype.changedKey.apply(this, arguments);
            if (key == 'loop') {
                this.loop = this.get(key) == 'true';
            }
        },

        setView: function (view) {
            kk.ScrollViewElement.prototype.setView.apply(this, arguments);
            if (view && view.scrollView) {
                view.scrollView.style.overflowX = 'scroll';
                $(view.scrollView).on('mousewheel', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                });
            }
        },

        viewDidLayouted: function (view) {
            kk.ScrollViewElement.prototype.viewDidLayouted.apply(this, arguments);
            this.loopPageIndex(true);
        },

        pageSize: function () {
            if (this.frame.width > 0) {
                return parseInt(Math.ceil(this.contentSize.width / this.frame.width));
            }
            return 0;
        },

        pageIndex: function () {
            if (this.frame.width > 0 && this.view && this.view.scrollView) {
                return parseInt(this.view.scrollView.scrollLeft / this.frame.width);
            }
            return 0;
        },

        setPageIndex: function (index, animated, done) {
            var n = this.pageSize();
            if (index < n) {
                this.scrollTo(this.frame.width * index, 0, animated, done);
            } else {
                if (typeof done == 'function') {
                    done();
                }
            }
        },

        loopPageIndex: function (top) {

            var i = this.pageIndex();
            var n = this.pageSize();

            if (this.loop) {

                if (n >= 3) {
                    if (top) {
                        i = 1;
                        this.setPageIndex(1, false);
                    } else if (i == 0) {
                        i = n - 2;
                        this.setPageIndex(n - 2, false);
                    } else if (i == n - 1) {
                        i = 1;
                        this.setPageIndex(1, false);
                    }
                    n = n - 2;
                    i = i - 1;
                }
            }

            var e = new kk.ElementEvent(this);

            e.data = { pageIndex: i, pageCount: n };

            this.emit("pagechange", e);

        },

        updatePageScroll: function (animated) {

            var element = this;

            var done = function (canceled) {
                if (canceled === false) {
                    return;
                }
                element.loopPageIndex();
            };

            if (this.pageScrollV > 0) {
                var n = this.pageSize();
                var i = this.pageIndex();
                if (i + 1 < n) {
                    this.setPageIndex(i + 1, animated, done);
                } else {
                    this.setPageIndex(i, animated, done);
                }
            } else {
                this.setPageIndex(this.pageIndex(), animated, done);
            }

            this.pageScrollV = 0;
        },

        onScroll: function (x, y) {
            var v = x - this.pageScrollX;
            if (v != 0) {
                this.pageScrollX = x;
                this.pageScrollV = v;
            }
            kk.ScrollViewElement.prototype.onScroll.apply(this, arguments);
        },

        setTracking: function (v) {
            kk.ScrollViewElement.prototype.setTracking.apply(this, arguments);
            if (v) {
                this.pageScrollX = this.contentOffset.x;
            } else {
                this.updatePageScroll(true);
            }
        }
    });

})();

