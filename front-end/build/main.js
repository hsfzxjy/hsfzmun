define('__tether', ['tether'], function (Tether) {
    window.Tether = Tether
})

var TIMEAGO_I18N_MAP = {
    'zh-hans': 'zh-CN',
    'en-us': 'en'
}

requirejs.config({
    baseUrl: '/static',
    waitSeconds: 30,
    paths: {
        jquery: 'jquery/jquery',
        tether: 'tether/js/tether.min',
        bootstrap: 'bootstrap/js/bootstrap.min',
        _trumbowyg: 'trumbowyg/trumbowyg.min',
        _trumbowygUpload: 'trumbowyg/plugins/upload/trumbowyg.upload',
        mustache: 'mustache/mustache.min',
        _timeago: 'timeago/jquery.timeago',
        _timeagoLocale: 'timeago/locales/jquery.timeago.' + TIMEAGO_I18N_MAP[i18nInfo.langCode],
        'file-upload': 'file-upload/js/jquery.fileupload',
        'jquery-ui/ui/widget': 'file-upload/js/vendor/jquery.ui.widget',
        'tagator': 'tagator/fm.tagator.jquery',
        'pinyin': 'pinyin/web-pinyin',
        'sticky': 'sticky/jquery.sticky'
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
        _trumbowyg: {
            deps: ['jquery']
        },
        _trumbowygUpload: {
            deps: ['_trumbowyg']
        },
        _timeago: {
            deps: ['jquery']
        },
        _timeagoLocale: {
            deps: ['_timeago']
        },
        tagator: {
            deps: ['jquery']
        }
    }
})

define('sticky-util', ['exports', 'sticky'], function (exports) {
    function bind (sel) {
        var $el = $(sel)
        var top = $el.data('s-top'), bottom = $el.data('s-bottom'), zIndex = $el.data('s-z-index')

        $el.sticky({
            topSpacing: top,
            bottomSpacing: bottom,
            responsiveWidth: true,
            zIndex: zIndex,
            autoHeight: $el.data('s-auto-height')
        })
    }

    exports.bind = bind
    $(function () {
        $('.sticky').each(function () {
            bind(this)
        })
    })
})

require(['sticky-util'])

define('trumbowyg', ['_trumbowyg', '_trumbowygUpload'])

require(['bootstrap'], function () {
    $(function () {
        $('.dropdown-toggle').dropdown()
    })
})

define('timeago', ['exports', '_timeagoLocale'], function (exports) {
    function bind () {
        $('time.timeago').timeago()
    }
    exports.bind = bind
    $(function () { bind() })
})
