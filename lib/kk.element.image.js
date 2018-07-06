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
        this.layout = Layout;
    };

    kk.ImageElement.prototype = kk.extend(kk.ViewElement.prototype, {

        viewChangedKey: function (view, key, value) {
            kk.ViewElement.prototype.viewChangedKey.apply(this, arguments);
            if (key == "src" || key == "default-src") {
                this.display();
            }
        },

        setView : function(view) {
            kk.ViewElement.prototype.setView.apply(this,arguments);
            if(view) {
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

        display: function () {

            var view = this.getImageView();

            if (!view) {
                return;
            }


            var v = this.get("src");

            if (v) {
                image = this.app.getImage(v);
                if (image) {
                    view.setAttribute("src", image.getURL());
                    return;
                }
            }

            v = this.get("default-src");

            if (v) {
                image = this.app.getImage(v);
                if (image) {
                    view.setAttribute("src", image.getURL());
                }
            }

        },

        getImageView : function() {
            if(this.view) {
                return this.view.firstChild;
            }
        },

        createView: function () {
            var v = document.createElement("div");
            v.className = "kk-view kk-image";
            v.style.overflow = 'hidden';
            var img = document.createElement("img");
            img.style.width = '100%';
            v.appendChild(img);
            return v;
        },

        setLayout: function () {
            this._layout = Layout;
        }

    });

})();

