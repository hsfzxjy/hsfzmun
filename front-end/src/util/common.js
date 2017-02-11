export function throttle (func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
        previous = options.leading === false ? 0 : Date.now();
        timeout = null;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
    };
    return function() {
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

export function debounce (func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
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

    return function() {
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

import 'jquery'

export function wait (condition, duration = 200) {
    let deferred = $.Deferred()

    function loop () {
        setTimeout(() => condition() ? deferred.resolve() : loop(), duration)
    }

    loop()
    return deferred
}

function Loading ($el, startAction, stopAction, timeout) {
    this._$el = $el
    this._startAction = startAction
    this._stopAction = stopAction
    this._timeout = timeout

    this._loading = false
}

Loading.prototype = {

    start () {
        if (this._loading) return
        this._startAction.bind(this._$el)()
        this._$el.prop('disabled', true)
        this._loading = true

        setTimeout(() => this.stop(), this._timeout)
    },

    stop () {
        if (!this._loading) return

        this._stopAction.bind(this._$el)()
        this._$el.prop('disabled', false)
        this._loading = false
    }
}

$.fn.loading = function (arg) {

    if ($.isPlainObject(arg)) { // Configuration
        let { start = $.noop, stop = $.noop, timeout = 5000 } = arg
        let obj = new Loading(this, start, stop, timeout)
        this.data('__loading', obj)
    } else { // Actions
        let obj = this.data('__loading')

        switch (arg) {
            case 'start':
                obj.start()
                break
            case 'stop':
                obj.stop()
                break
        }
    }

    return this
}

export function randomString () {
    return Math.random().toString(36).substring(7) + Date.now()
}

// Array polyfills

Array.prototype.remove = function () {
    let what, a = arguments, L = a.length, ax
    while (L && this.length) {
        what = a[--L]
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1)
        }
    }
    return this
}

// LocalStorage Polifills

Storage.prototype.setObj = function (key, obj) {
    return this.setItem(key, JSON.stringify(obj))
}

Storage.prototype.getObj = function (key) {
    return JSON.parse(this.getItem(key))
}

// Button Icons Toggler

$.fn.icons = function (name) {
    let icons = this.data('icons').split(' ').map(name => `fa-${name}`)
    this.removeClass(icons.join(' '))
        .addClass(`fa-${name}`)
}

$.fn.toggleIcon = function () {
    let icons = this.data('icons').split(' ').map(name => `fa-${name}`)
    let icon = icons[(this.hasClass(icons[0])) ? 1 : 0]
    this.removeClass(icons.join(' ')).addClass(icon)
}
