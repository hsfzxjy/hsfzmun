define('__tether', ['tether'], (Tether) => {
    window.Tether = Tether
})

requirejs.config({
    baseUrl: '/static',
    paths: {
        jquery: 'jquery/jquery.slim.min',
        tether: 'tether/js/tether.min',
        bootstrap: 'bootstrap/js/bootstrap.min'
    },
    shim: {
        'jquery': {
            exports: 'jQuery'
        },
        'bootstrap': {
            deps: ['jquery', '__tether']
        },
        'tether': {
            exports: 'Tether'
        }
    }
})

require(['bootstrap'])
