
(function () {

    var HttpTask = function (options) {
        this.options = options;
    };

    HttpTask.prototype = kk.extend(Object.prototype, {

        onload: function (data, err) {
            if (!this.options) {
                return;
            }

            if (typeof this.options.onload) {
                this.options.onload(data, err);
            }

        },

        onfail: function (err) {
            if (!this.options) {
                return;
            }

            if (typeof this.options.onfail) {
                this.options.onfail(err);
            }
        },

        cancel: function () {
            delete this.options;
        }
    });

    kk.http = {

        send: function (options) {

            var task = new HttpTask(options);

            var data = options.data;
            var contentType;

            if (options.method == 'POST' && typeof data == 'object') {
                var formData = new FormData();
                var isMutilpart = false;
                for (var key in data) {
                    var v = data[key];
                    if (v instanceof File) {
                        formData.append(key, v);
                        isMutilpart = true;
                    } else {
                        formData.append(key, v + '');
                    }
                }
                if (isMutilpart) {
                    contentType = false;
                    data = {};
                } else {
                    contentType = 'application/x-www-form-urlencoded; charset=UTF-8';
                }
            }

            $.ajax({
                dataType: options.type || 'json',
                type: options.method || 'GET',
                url: options.url,
                data: data,
                headers: options.headers,
                contentType: contentType,
                error: function (e) {
                    task.onfail(e);
                },
                success: function (data) {
                    task.onload(data);
                }
            });

            return task;
        },

    };

})();
