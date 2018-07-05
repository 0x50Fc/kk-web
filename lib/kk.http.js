
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

            $.ajax({
                dataType : options.type || 'json',
                type : options.method || 'GET',
                url : options.url,
                data : options.data,
                error : function(e) {
                    task.onfail(e);
                },
                success : function(data){
                    task.onload(data);
                }
            });

            return task;
        },

    };

})();
