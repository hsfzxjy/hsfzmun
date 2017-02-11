define(['exports', 'mustache', 'util/tmpl', 'util/rest', 'timeago', 'bootstrap'], function (exports, _mustache, _tmpl, _rest, _timeago) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.articleListManager = undefined;

    var _mustache2 = _interopRequireDefault(_mustache);

    var tmpl = _interopRequireWildcard(_tmpl);

    var _rest2 = _interopRequireDefault(_rest);

    var timeago = _interopRequireWildcard(_timeago);

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

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    tmpl.verbatim();

    // Helper Functions

    function getParams() {
        var url = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : window.location.href;

        var match = void 0;
        var plus = /\+/g;
        var search = /([^&=]+)=?([^&]*)/g;
        var query = (url.split('?')[1] || '').split('#')[0];

        var decode = function decode(s) {
            return decodeURIComponent(s.replace(plus, " "));
        };

        var result = {};
        while (match = search.exec(query)) {
            result[decode(match[1])] = decode(match[2]);
        }return result;
    }

    // `Router` Class Definition

    function Router() {
        this._init();
    }

    Router.prototype = {
        _init: function _init() {
            var _this = this;

            this.url = '';
            this.params = {};
            this._eventBus = $({});
            // Listen `popstate` event
            $(window).on('popstate', this._fireRouteEvent.bind(this));
            // Trigger event when page loaded
            $(function () {
                return _this._fireRouteEvent(true);
            });
        },
        _fireRouteEvent: function _fireRouteEvent() {
            var first = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

            this.url = location.pathname;
            this.params = getParams();
            this._eventBus.trigger('route', [this.url, this.params, first]);
        },
        go: function go(url) {
            var title = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
            var trigger = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

            history.pushState(null, title, url);
            if (trigger) this._fireRouteEvent();
        },
        route: function route(cb) {
            this._eventBus.on('route', function (e) {
                for (var _len = arguments.length, rest = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                    rest[_key - 1] = arguments[_key];
                }

                return cb.apply(undefined, rest);
            });
            return this;
        }
    };

    var router = new Router();

    // Page relevance

    var $topNav = $('#article-top-nav'),
        $sideNav = $('#article-side-nav');

    var $sideNavItems = void 0;

    var $tabContents = $('div.tab-content');

    var getTabId = function getTabId(name) {
        return 'tab-' + name;
    };
    var id = function id() {
        return getTabId(this.name);
    };

    var articleListManager = exports.articleListManager = {

        _listViews: {},

        activeName: '',

        /**
         *
         * @param  {list} menus e.g. [['title1', 'name1'], ['title2',[['title3', 'name3']]]]
         * @param  {flat dict} apis  {'name1': API1, 'name2': API2, 'name3': API3}
         * @return {undefined}
         */
        config: function config(menus, apis) {
            var defaultName = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

            this._menus = menus;
            this._apis = apis;
            this._defaultName = defaultName;
            this._registerRouteEvents();
            this._createMenus();
            this._createListViews();
        },
        _createMenus: function _createMenus() {
            var _this2 = this;

            var tmplSuffix = function tmplSuffix(data) {
                return data.items ? 'stacked' : 'single';
            };
            var navTmplId = function navTmplId(prefix) {
                return function (data) {
                    return prefix + '-' + tmplSuffix(data);
                };
            };
            var pack = function pack(item) {
                return { name: item[1], title: item[0], id: id };
            };

            var menus = this._menus.map(function (item) {
                return $.isArray(item[1]) ? {
                    title: item[0],
                    items: item[1].map(pack)
                } : pack(item);
            });

            tmpl.renderEachTo($topNav, navTmplId('article-top-nav'), menus);

            tmpl.renderEachTo($sideNav, navTmplId('article-side-nav'), menus);

            $sideNavItems = $('a', $sideNav);

            $sideNavItems.click(function (e) {
                e.preventDefault();
                _this2._showTab($(e.currentTarget).data('name'));
            });

            $('a[data-name]').on('click', function (_ref) {
                var target = _ref.target;

                var name = $(target).data('name');
                router.go(_this2._listViews[name].currentUrl(), '');
            });

            $('a[data-name]', $topNav).click(function (_ref2) {
                var target = _ref2.target;

                var name = $(target).data('name');
                $('a', $sideNav).removeClass('active');
                var $sideItem = $('a[data-name=' + name + ']', $sideNav).addClass('active');
            });
        },
        _registerRouteEvents: function _registerRouteEvents() {
            var _this3 = this;

            router.route(function (url, params, first) {
                var name = (/\/list\/(.+)\/$/.exec(url) || '')[1] || _this3._defaultName;
                _this3.activeName = name;
                if (first) _this3._showTab(name);
            });
        },
        _showTab: function _showTab(name) {
            var sel = 'a[data-name=' + name + ']';
            $(sel, $topNav).tab('show');
            $('a', $sideNav).removeClass('active');
            var $sideItem = $(sel, $sideNav).addClass('active');
        },
        _createListViews: function _createListViews() {
            var _this4 = this;

            $.each(this._apis, function (name, api) {
                _this4._listViews[name] = new ArticleListView(name, api);
            });
        }
    };

    function ArticleListView(name, api) {
        this._currentAPI = this._api = new _rest2.default(api);
        this._name = name;
        this._init();
    }

    ArticleListView.prototype = {
        _init: function _init() {
            this._first = true;
            // Init tab panel
            this._$pane = tmpl.renderTo($tabContents, 'tab-pane', {
                name: this._name,
                id: id
            });
            this._registerPagerEvents();
            this._registerRouteEvents();
        },
        _registerRouteEvents: function _registerRouteEvents() {
            var _this5 = this;

            router.route(function (url, params) {
                if (articleListManager.activeName !== _this5._name) return;
                if (_this5._first) _this5._load(_this5._api.param(params));
            });
        },
        _registerPagerEvents: function _registerPagerEvents() {
            var _this6 = this;

            $(this._$pane).on('click', 'a.page-link', function (e) {
                e.preventDefault();
                var api = $(e.target).data('api');
                _this6._load(api);
                router.go(_this6.currentUrl(), '', false);
            });
        },
        currentUrl: function currentUrl() {
            return '/articles/list/' + this._name + '/?' + this._currentAPI.currentParamString();
        },
        _load: function _load(api) {
            var _this7 = this;

            this._first = false;
            return (this._currentAPI = new _rest2.default(api)).get().ok(function (data) {
                tmpl.renderInto(_this7._$pane, 'article-list-view', data, { article: tmpl.getTmpl('article') });
                timeago.bind();
            });
        }
    };
});
//# sourceMappingURL=../__maps__/articles/list.js.map
