define(['exports', 'jquery'], function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = EventEmitter;
    function EventEmitter() {
        this._eventBus = $({});
    }

    EventEmitter.prototype = {
        on: function on(name, cb) {
            this._eventBus.on(name, function (_) {
                for (var _len = arguments.length, rest = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                    rest[_key - 1] = arguments[_key];
                }

                return cb.apply(undefined, rest);
            });
        },
        emit: function emit(name, args) {
            this._eventBus.trigger(name, args);
        }
    };
});
//# sourceMappingURL=../__maps__/util/events.js.map
