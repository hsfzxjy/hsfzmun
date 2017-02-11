define(['exports', 'timeago', 'util/rest', 'util/tmpl'], function (exports, _timeago, _rest, _tmpl) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.AFTER = exports.BEFORE = undefined;
    exports.List = List;

    var timeago = _interopRequireWildcard(_timeago);

    var _rest2 = _interopRequireDefault(_rest);

    var tmpl = _interopRequireWildcard(_tmpl);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

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

    var BEFORE = exports.BEFORE = tmpl.BEFORE;
    var AFTER = exports.AFTER = tmpl.AFTER;

    function List(_ref) {
        var $box = _ref.$box,
            $loadMore = _ref.$loadMore,
            tmpl = _ref.tmpl,
            api = _ref.api,
            _ref$direction = _ref.direction,
            direction = _ref$direction === undefined ? AFTER : _ref$direction;

        this._$box = $($box);
        this._$loadMore = $($loadMore);
        this._api = api;
        this._tmpl = tmpl;
        this._direction = direction;
        this._eventBus = $({});

        this._init();
    }

    List.prototype = {
        _init: function _init() {
            this._load(this._api);
            this._registerNextEvents();
        },
        _registerNextEvents: function _registerNextEvents() {
            var _this = this;

            if (!this._$loadMore.length) return;
            this._$loadMore.click(function () {
                return _this._next && _this._load(_this._next);
            });
        },
        _load: function _load(api) {
            var _this2 = this;

            new _rest2.default(api).get().ok(function (_ref2) {
                var next = _ref2.next,
                    results = _ref2.results;

                _this2._eventBus.trigger('results', [results]);
                _this2._buildItems(results, _this2._direction);
                _this2._setNext(next);
            });
        },
        results: function results(cb) {
            this._eventBus.on('results', function (e) {
                for (var _len = arguments.length, rest = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                    rest[_key - 1] = arguments[_key];
                }

                return cb.apply(undefined, rest);
            });
            return this;
        },
        _setNext: function _setNext(next) {
            this._next = next;
            if (!next) this._$loadMore.hide();
        },
        _buildItem: function _buildItem(item, direction) {
            var result = tmpl.renderSwitch(direction, this._$box, this._tmpl, item);
            timeago.bind();
            return result;
        },
        _buildItems: function _buildItems(items, direction) {
            var result = tmpl.renderEachSwitch(direction, this._$box, this._tmpl, items);
            timeago.bind();
        },
        append: function append(item) {
            return this._buildItem(item, AFTER);
        },
        prepend: function prepend(item) {
            return this._buildItem(item, BEFORE);
        }
    };
});
//# sourceMappingURL=../__maps__/util/list.js.map
