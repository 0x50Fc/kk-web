
(function (kk) {

    kk.addOpenlib(function (app) {

        app.data.on(["choose", "image"], function (data) {

            var input = document.getElementById("kk-app-choose-file");

            if(!input) {
                input = document.createElement("input");
                input.type = 'file';
                input.style.display = 'none';
                document.body.appendChild(input);
            }

            input.accept = data.accept || '';

            $(input)
                .off("change")
                .on("change", function (e) {
                
                if(data.keys) {

                    var v = data.data;

                    if(typeof v != 'object') {
                        v = {};
                    }

                    var files = [];

                    for(var i=0;i<this.files.length;i++){
                        files.push(this.files[i]);
                    }

                    v['files'] = files;

                    app.data.set(data.keys,v);

                }

                $(this).off("chnage");
            }).click();

        });


    });

})(kk);
