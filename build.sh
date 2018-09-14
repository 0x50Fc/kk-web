#!/bin/sh

cd lib

uglifyjs kk.js kk.extend.js kk.data.js kk.storage.js kk.date.js kk.event.js kk.http.js kk.app.js kk.element.js kk.element.view.js \
    kk.element.image.js kk.element.text.js kk.element.button.js kk.element.webview.js kk.element.scrollview.js kk.element.slideview.js \
    kk.element.pagerview.js kk.element.app.js kk.element.page.js kk.element.webview.js \
    kk.element.input.js kk.element.select.js kk.element.body.js kk.element.textarea.js \
    kk.element.animation.js kk.page.js kk.window.js  \
    kk.app.choose.js \
    -o ../bin/kk.min.js

cd ..

cd ace

uglifyjs kk.element.editor.js -o ../bin/kk.ace.min.js

cd ..

uglifyjs startup.js -o ./bin/startup.min.js
