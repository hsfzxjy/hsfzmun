define(['exports', 'mustache', 'jquery'], function (exports, _mustache) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.getTmpl = exports.verbatim = exports.AFTER = exports.BEFORE = undefined;
    exports.render = render;
    exports.renderBefore = renderBefore;
    exports.renderTo = renderTo;
    exports.renderInto = renderInto;
    exports.renderSwitch = renderSwitch;
    exports.renderEach = renderEach;
    exports.renderEachBefore = renderEachBefore;
    exports.renderEachTo = renderEachTo;
    exports.renderEachInto = renderEachInto;
    exports.renderEachSwitch = renderEachSwitch;

    var _mustache2 = _interopRequireDefault(_mustache);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var tmplCache = {};

    var tempTextarea = $('<textarea />');

    var BEFORE = exports.BEFORE = 'before';
    var AFTER = exports.AFTER = 'after';

    var verbatim = exports.verbatim = function verbatim() {
        _mustache2.default.tags = ['[[', ']]'];
    };

    var getTmpl = exports.getTmpl = function getTmpl(id) {
        if (tmplCache[id]) return tmplCache[id];

        var str = tmplCache[id] = tempTextarea.html($('#tmpl-' + id).html()).text();
        _mustache2.default.parse(str);
        return str;
    };

    function render(tmplId, data, partials) {
        if ($.isFunction(tmplId)) tmplId = tmplId(data);

        return _mustache2.default.render(getTmpl(tmplId), data, partials);
    }

    function renderBefore($target) {
        for (var _len = arguments.length, rest = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            rest[_key - 1] = arguments[_key];
        }

        return $(render.apply(undefined, rest)).prependTo($target);
    }

    function renderTo($target) {
        for (var _len2 = arguments.length, rest = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
            rest[_key2 - 1] = arguments[_key2];
        }

        return $(render.apply(undefined, rest)).appendTo($target);
    }

    function renderInto($target) {
        for (var _len3 = arguments.length, rest = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
            rest[_key3 - 1] = arguments[_key3];
        }

        $($target).html(render.apply(undefined, rest));
    }

    function renderSwitch(direction) {
        for (var _len4 = arguments.length, rest = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
            rest[_key4 - 1] = arguments[_key4];
        }

        return (direction === BEFORE ? renderBefore : renderTo).apply(undefined, rest);
    }

    function renderEach(tmplId, data, partials) {
        return data.map(function (item) {
            return render(tmplId, item, partials);
        }).join('');
    }

    function renderEachBefore($target) {
        for (var _len5 = arguments.length, rest = Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
            rest[_key5 - 1] = arguments[_key5];
        }

        return $(renderEach.apply(undefined, rest)).prependTo($target);
    }

    function renderEachTo($target) {
        for (var _len6 = arguments.length, rest = Array(_len6 > 1 ? _len6 - 1 : 0), _key6 = 1; _key6 < _len6; _key6++) {
            rest[_key6 - 1] = arguments[_key6];
        }

        return $(renderEach.apply(undefined, rest)).appendTo($target);
    }

    function renderEachInto($target) {
        for (var _len7 = arguments.length, rest = Array(_len7 > 1 ? _len7 - 1 : 0), _key7 = 1; _key7 < _len7; _key7++) {
            rest[_key7 - 1] = arguments[_key7];
        }

        $($target).html(renderEach.apply(undefined, rest));
    }

    function renderEachSwitch(direction) {
        for (var _len8 = arguments.length, rest = Array(_len8 > 1 ? _len8 - 1 : 0), _key8 = 1; _key8 < _len8; _key8++) {
            rest[_key8 - 1] = arguments[_key8];
        }

        return (direction === BEFORE ? renderEachBefore : renderEachTo).apply(undefined, rest);
    }
});
//# sourceMappingURL=../__maps__/util/tmpl.js.map
