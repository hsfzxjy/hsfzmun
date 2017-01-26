define('__tether', ['tether'], function (Tether) {
    window.Tether = Tether
})

requirejs.config({
    baseUrl: '/static',
    paths: {
        jquery: 'jquery/jquery',
        tether: 'tether/js/tether.min',
        bootstrap: 'bootstrap/js/bootstrap.min',
        trumbowyg: 'trumbowyg/trumbowyg',
        mustache: 'mustache/mustache.min'
    },
    shim: {
        jquery: {
            exports: 'jQuery'
        },
        bootstrap: {
            deps: ['jquery', '__tether']
        },
        tether: {
            exports: 'Tether'
        },
        summernote: {
            deps: ['bootstrap']
        },
        trumbowyg: {
            deps: ['jquery']
        }
    }
})

require(['bootstrap'], function () {
    $(function () {
        $('.dropdown-toggle').dropdown()
    })
})
