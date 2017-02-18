define(['exports', 'ws-config', 'util/common', 'jquery'], function (exports, _wsConfig, _common) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _wsConfig2 = _interopRequireDefault(_wsConfig);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var socket = void 0;
    var eventBus = $({});

    var _connect = (0, _common.throttle)(function () {
        socket = new WebSocket('ws://' + location.host + _wsConfig2.default);
        socket.addEventListener('open', function (event) {
            return eventBus.trigger('open', event);
        });
        socket.addEventListener('close', function (event) {
            return eventBus.trigger('close', event);
        });
        socket.addEventListener('error', function (event) {
            return eventBus.trigger('error', event);
        });
        socket.addEventListener('message', function (_ref) {
            var data = _ref.data;

            var object = JSON.parse(data);
            eventBus.trigger('message', object);

            if (object !== null && object.type !== undefined && object.data !== undefined) eventBus.trigger('message-' + object.type, object.data);
        });
        // Reconnect
        socket.addEventListener('close', _connect);
    }, 10000);

    function on(name, cb) {
        eventBus.on(name, function (e) {
            for (var _len = arguments.length, rest = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                rest[_key - 1] = arguments[_key];
            }

            return cb.apply(undefined, rest);
        });
    }

    exports.default = {
        message: function message(cb) {
            on('message', cb);
            return this;
        },
        subscribe: function subscribe(type, cb) {
            on('message-' + type, cb);
            return this;
        },
        open: function open(cb) {
            on('open', cb);
            return this;
        },
        close: function close(cb) {
            on('close', cb);
            return this;
        },
        error: function error(cb) {
            on('error', cb);
            return this;
        },
        send: function send(data) {
            socket.send(JSON.stringify(data));
        },
        connect: function connect() {
            _connect();
        }
    }.close(function () {
        for (var _len2 = arguments.length, rest = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            rest[_key2] = arguments[_key2];
        }

        return console.log(rest);
    }).error(function () {
        for (var _len3 = arguments.length, rest = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
            rest[_key3] = arguments[_key3];
        }

        return console.log(rest);
    }).open(function () {
        for (var _len4 = arguments.length, rest = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
            rest[_key4] = arguments[_key4];
        }

        return console.log(rest);
    });
});
//# sourceMappingURL=../__maps__/util/websocket.js.map
