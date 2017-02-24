define(['exports', 'util/tmpl', 'jquery'], function (exports, _tmpl) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var tmpl = _interopRequireWildcard(_tmpl);

    function _interopRequireWildcard(obj) {
        if (obj && obj.__esModule) {
            return obj;
        } else {
            var newObj = {};

            if (obj != null) {
                for (var key in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
                }
            }

            newObj.default = obj;
            return newObj;
        }
    }

    $.ajaxSetup({
        cache: false,
        dataType: 'json'
    });

    // Helper Functions

    function updateQueryStringParameter(uri, key, value) {
        var re = new RegExp('([?&])' + key + '=.*?(&|$|#)', "i");
        var separator = uri.indexOf('?') !== -1 ? "&" : "?";
        return uri.match(re) ? uri.replace(re, '$1' + key + '=' + value + '$2') : '' + uri + separator + key + '=' + value;
    }

    // Setup CSRF Token

    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === name + '=') {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    var csrftoken = getCookie('csrftoken');

    function csrfSafeMethod(method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method)
        );
    }

    $.ajaxSetup({
        beforeSend: function beforeSend(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });

    // `API` Definition

    var JSON_TYPE = 'application/json';
    var STATUSES = {
        paramerror: [400],
        unauthorized: [401],
        forbidden: [403],
        notfound: [404],
        ok: [200, 201, 204],
        servererror: [500]
    };
    function API(url) {
        if (url instanceof API) {
            this.url = url.url;
            this.params = $.extend({}, url.params);
            this.contentType = url.contentType;
            this._$container = url._$container;
        } else {
            this.url = url;
            this.params = {};
            this.contentType = JSON_TYPE;
        }
    }
    API.prototype = {
        param: function param(name, value) {
            var newObj = new API(this);

            if ($.isPlainObject(name)) $.extend(newObj.params, name);else newObj.params[name] = value;

            return newObj;
        },
        json: function json() {
            this.contentType = JSON_TYPE;
        },
        formdata: function formdata() {
            this.contentType = undefined;
        },
        currentUrl: function currentUrl() {
            var url = this.url;
            $.each(this.params, function (key, value) {
                return url = updateQueryStringParameter(url, key, value);
            });
            return url;
        },
        currentParamString: function currentParamString() {
            var url = this.currentUrl();
            return url.split('?')[1] || '';
        },
        _toggleMask: function _toggleMask(value) {
            if (this._$container) this._$container.find('.mask').toggle(value);
        },
        _request: function _request(method, payload) {
            var _this = this;

            if (this.contentType === JSON_TYPE) payload = JSON.stringify(payload);

            $.each(this.params, function (key, value) {
                return _this.url = updateQueryStringParameter(_this.url, key, value);
            });

            this._toggleMask(true);

            return this._processResponse($.ajax({
                url: this.url,
                type: method,
                contentType: this.contentType,
                data: payload
            })).ok(function (data) {
                if (!_this._$container) return;
                if ($.isArray(data.results)) {
                    _this._$container.find('.empty-placeholder').toggle(!data.results.length);
                }
            }).always(function () {
                _this._toggleMask(false);
            });
        },
        container: function container(el) {
            var newObj = new API(this);
            newObj._$container = $(el);
            tmpl.renderBefore(newObj._$container, 'empty', {});
            tmpl.renderBefore(newObj._$container, 'mask', {});
            return newObj;
        },
        _processResponse: function _processResponse(response) {
            $.each(STATUSES, function (name, codes) {
                var callbacks = $.Callbacks();
                // bind shortcuts to response
                response[name] = function (cb) {
                    callbacks.add(cb);
                    return response;
                };
                // fire callbacks according to status code
                response.always(function () {
                    if (codes.indexOf(response.status) >= 0) {
                        callbacks.fire(response.responseJSON || {}, response);
                    }
                });
            });

            return response;
        }
    };

    $(['get', 'post', 'put', 'patch', 'delete']).each(function (_, name) {
        return API.prototype[name] = function (payload) {
            return this._request(name, payload);
        };
    });

    exports.default = API;
});
//# sourceMappingURL=../__maps__/util/rest.js.map
