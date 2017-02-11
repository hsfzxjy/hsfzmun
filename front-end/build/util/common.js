define(['exports', 'jquery'], function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.throttle = throttle;
    exports.debounce = debounce;
    exports.wait = wait;
    exports.randomString = randomString;
    function throttle(func, wait, options) {
        var context, args, result;
        var timeout = null;
        var previous = 0;
        if (!options) options = {};
        var later = function later() {
            previous = options.leading === false ? 0 : Date.now();
            timeout = null;
            result = func.apply(context, args);
            if (!timeout) context = args = null;
        };
        return function () {
            var now = Date.now();
            if (!previous && options.leading === false) previous = now;
            var remaining = wait - (now - previous);
            context = this;
            args = arguments;
            if (remaining <= 0 || remaining > wait) {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }
                previous = now;
                result = func.apply(context, args);
                if (!timeout) context = args = null;
            } else if (!timeout && options.trailing !== false) {
                timeout = setTimeout(later, remaining);
            }
            return result;
        };
    }

    function debounce(func, wait, immediate) {
        var timeout, args, context, timestamp, result;

        var later = function later() {
            var last = Date.now() - timestamp;

            if (last < wait && last >= 0) {
                timeout = setTimeout(later, wait - last);
            } else {
                timeout = null;
                if (!immediate) {
                    result = func.apply(context, args);
                    if (!timeout) context = args = null;
                }
            }
        };

        return function () {
            context = this;
            args = arguments;
            timestamp = Date.now();
            var callNow = immediate && !timeout;
            if (!timeout) timeout = setTimeout(later, wait);
            if (callNow) {
                result = func.apply(context, args);
                context = args = null;
            }

            return result;
        };
    }

    function wait(condition) {
        var duration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 200;

        var deferred = $.Deferred();

        function loop() {
            setTimeout(function () {
                return condition() ? deferred.resolve() : loop();
            }, duration);
        }

        loop();
        return deferred;
    }

    function Loading($el, startAction, stopAction, timeout) {
        this._$el = $el;
        this._startAction = startAction;
        this._stopAction = stopAction;
        this._timeout = timeout;

        this._loading = false;
    }

    Loading.prototype = {
        start: function start() {
            var _this = this;

            if (this._loading) return;
            this._startAction.bind(this._$el)();
            this._$el.prop('disabled', true);
            this._loading = true;

            setTimeout(function () {
                return _this.stop();
            }, this._timeout);
        },
        stop: function stop() {
            if (!this._loading) return;

            this._stopAction.bind(this._$el)();
            this._$el.prop('disabled', false);
            this._loading = false;
        }
    };

    $.fn.loading = function (arg) {

        if ($.isPlainObject(arg)) {
            var _arg$start = arg.start,
                start = _arg$start === undefined ? $.noop : _arg$start,
                _arg$stop = arg.stop,
                stop = _arg$stop === undefined ? $.noop : _arg$stop,
                _arg$timeout = arg.timeout,
                timeout = _arg$timeout === undefined ? 5000 : _arg$timeout;

            var obj = new Loading(this, start, stop, timeout);
            this.data('__loading', obj);
        } else {
            // Actions
            var _obj = this.data('__loading');

            switch (arg) {
                case 'start':
                    _obj.start();
                    break;
                case 'stop':
                    _obj.stop();
                    break;
            }
        }

        return this;
    };

    function randomString() {
        return Math.random().toString(36).substring(7) + Date.now();
    }

    // Array polyfills

    Array.prototype.remove = function () {
        var what = void 0,
            a = arguments,
            L = a.length,
            ax = void 0;
        while (L && this.length) {
            what = a[--L];
            while ((ax = this.indexOf(what)) !== -1) {
                this.splice(ax, 1);
            }
        }
        return this;
    };

    // LocalStorage Polifills

    Storage.prototype.setObj = function (key, obj) {
        return this.setItem(key, JSON.stringify(obj));
    };

    Storage.prototype.getObj = function (key) {
        return JSON.parse(this.getItem(key));
    };

    // Button Icons Toggler

    $.fn.icons = function (name) {
        var icons = this.data('icons').split(' ').map(function (name) {
            return 'fa-' + name;
        });
        this.removeClass(icons.join(' ')).addClass('fa-' + name);
    };

    $.fn.toggleIcon = function () {
        var icons = this.data('icons').split(' ').map(function (name) {
            return 'fa-' + name;
        });
        var icon = icons[this.hasClass(icons[0]) ? 1 : 0];
        this.removeClass(icons.join(' ')).addClass(icon);
    };
});
//# sourceMappingURL=../__maps__/util/common.js.map
