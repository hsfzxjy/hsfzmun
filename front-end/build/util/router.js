define(['exports', 'util/events', 'urllib', 'jquery'], function (exports, _events) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _events2 = _interopRequireDefault(_events);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    // `Router` Class Definition

    function Router() {
        this._init();
    }

    $.extend(Router.prototype, {
        _init: function _init() {
            var _this = this;

            this.url = '';
            this.params = {};
            this._eventBus = new _events2.default();
            // Listen `popstate` event
            $(window).on('popstate', this._fireRouteEvent.bind(this));
            // Trigger event when page loaded
            $(function () {
                return _this._fireRouteEvent(true);
            });
        },
        _fireRouteEvent: function _fireRouteEvent() {
            var first = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

            var url = new Url(location.href);
            this.url = url.path;
            this.params = url.query;
            this._eventBus.emit('route', [this.url, this.params, first]);
            console.log('fire');
        },
        go: function go(url) {
            var title = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
            var trigger = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

            console.log('go', url);
            history.pushState(null, title, url);
            if (trigger) this._fireRouteEvent();
        },
        route: function route(cb) {
            console.log('bind');
            this._eventBus.on('route', cb);
            return this;
        }
    });

    var router = new Router();

    exports.default = router;
});
//# sourceMappingURL=../__maps__/util/router.js.map
