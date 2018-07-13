//图片
(function () {

    var Layout = function (element) {

        var size = { width: 0, height: 0 };

        if (element instanceof kk.ImageElement) {

            if (element.width.type == kk.Pixel.TYPE_AUTO || element.height.type == kk.Pixel.TYPE_AUTO) {

                var imageSize = element.getImageSize();

                if (element.width.type == kk.Pixel.TYPE_AUTO && element.height.type == kk.Pixel.TYPE_AUTO) {
                    size = imageSize;
                } else if (element.width.type == kk.Pixel.TYPE_AUTO) {
                    if (imageSize.height > 0) {
                        size.width = size.height * imageSize.width / imageSize.height;
                    } else {
                        size.width = 0;
                    }
                } else {
                    if (imageSize.width > 0) {
                        size.height = size.width * imageSize.height / imageSize.width;
                    } else {
                        size.height = 0;
                    }
                }

            } else {
                size.width = element.width.valueOf(element.frame.width, 0);
                size.height = element.width.valueOf(element.frame.height, 0);
            }

            var v = element.minWidth.valueOf(0, 0);

            if (size.width < v) {
                size.width = v;
            }

            v = element.maxWidth.valueOf(0, -1);

            if (v > 0 && size.width > v) {
                size.width = v;
            }

            v = element.minHeight.valueOf(0, 0);

            if (size.height < v) {
                size.height = v;
            }

            v = element.maxHeight.valueOf(0, -1);

            if (v > 0 && size.height > v) {
                size.height = v;
            }

            element.contentSize = size;
        }

        return size;
    };

    kk.ImageElement = function () {
        kk.ViewElement.apply(this, arguments);
        this._layout = Layout;
    };

    kk.ImageElement.prototype = kk.extend(kk.ViewElement.prototype, {

        viewChangedKey: function (view, key, value) {
            kk.ViewElement.prototype.viewChangedKey.apply(this, arguments);
            if (key == "src" || key == "default-src") {
                this.display();
            }
        },

        setView: function (view) {
            kk.ViewElement.prototype.setView.apply(this, arguments);
            if (view) {
                $(view).off("click");
            }
        },

        getImageSize: function () {

            var size = { width: 0, height: 0 };

            var v = this.get("src");

            if (v) {
                var image = this.app.getImage(v);
                if (image) {
                    size.width = image.width();
                    size.height = image.height();
                }
            }

            return size;
        },

        resizeImageView: function (view, image) {

            if (view && image && image.width() > 0 && image.height() > 0 && this.frame.width > 0 && this.frame.height > 0) {
                var gravity = this.get("gravity");
                if (gravity == 'resize') {
                    view.style.width = '100%';
                    view.style.height = '100%';
                    view.style.top = '0px';
                    view.style.left = '0px';
                } else {
                    var xScale = this.frame.width / image.width();
                    var yScale = this.frame.height / image.height();
                    var scale = (gravity == 'resizeAspect') ? Math.min(xScale, yScale) : Math.max(xScale, yScale);
                    var toWidth = image.width() * scale;
                    var toHeight = image.height() * scale;
                    var mleft = (this.frame.width - toWidth) * 0.5;
                    var mtop = (this.frame.height - toHeight) * 0.5;
                    view.style.width = toWidth + 'px';
                    view.style.height = toHeight + 'px';
                    view.style.top = mtop + 'px';
                    view.style.left = mleft + 'px';
                }
            }

        },

        display: function () {

            var view = this.getImageView();

            if (!view) {
                return;
            }

            var image;

            var v = this.get("src");

            if (v) {
                image = this.app.getImage(v);
            }

            if (!image) {
                v = this.get("default-src");
                if (v) {
                    image = this.app.getImage(v);
                }
            }

            if (image) {
                view.setAttribute("src", image.getURL());
                if (image.loaded) {
                    this.resizeImageView(view, image);
                } else {
                    var e = this;
                    image.onload = function () {
                        e.resizeImageView(view, image);
                    };
                }

            }

        },

        getImageView: function () {
            if (this.view) {
                return this.view.firstChild;
            }
        },

        createView: function () {
            var v = document.createElement("div");
            v.className = "kk-view kk-image";
            v.style.overflow = 'hidden';
            var img = document.createElement("img");
            img.style.position = 'absolute';
            img.style.width = '100%';
            v.appendChild(img);
            return v;
        },

        setLayout: function () {
            this._layout = Layout;
        },

    });

})();

