define(['util/websocket', 'util/rest', 'jquery'], function (_websocket, _rest) {
    'use strict';

    var _websocket2 = _interopRequireDefault(_websocket);

    var _rest2 = _interopRequireDefault(_rest);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var oldTitle = document.title;

    var counts = {
        notices: 0,
        chat: 0
    };

    function setCount(type, value) {
        counts[type] = value;
        $('.dot.chat').toggle(!!counts.chat);
        $('.dot.notices').toggle(!!counts.notices);
        var both = !!counts.chat || !!counts.notices;
        $('.dot.both').toggle(both);
        document.title = (both ? '（新消息） ' : '') + oldTitle;
    }

    var chatUtil = {
        getLastTime: function getLastTime() {
            return window.localStorage.getItem('last-time') || new Date().toISOString();
        }
    };

    var lastCreated = void 0;

    $(function () {
        _websocket2.default.connect();
        new _rest2.default('/api/messages/unread/count/').param('after', chatUtil.getLastTime()).get().ok(function (_ref) {
            var count = _ref.count;

            setCount('chat', count);
        });
    });

    _websocket2.default.subscribe('notices', function (count) {
        setCount('notices', count);
    });

    _websocket2.default.subscribe('chat', function (_ref2) {
        var created = _ref2.created;

        lastCreated = created;
        setCount('chat', counts.chat + 1);
    });

    setInterval(function () {
        if (lastCreated && new Date(lastCreated) <= new Date(chatUtil.getLastTime())) setCount('chat', 0);
    }, 1000);
});
//# sourceMappingURL=../__maps__/notices/index.js.map
