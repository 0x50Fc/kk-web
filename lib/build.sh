#!/bin/sh

uglifyjs kk.js kk.extend.js kk.data.js kk.date.js kk.event.js kk.http.js kk.app.js kk.element.js kk.element.view.js \
    kk.element.image.js kk.element.text.js kk.element.button.js kk.element.webview.js kk.element.scrollview.js kk.element.slideview.js \
    kk.element.animation.js kk.page.js kk.window.js kk.element.pagerview.js \
    -o ../bin/kk.min.js
