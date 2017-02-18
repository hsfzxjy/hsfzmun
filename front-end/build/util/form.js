define(['exports', 'jquery', 'util/rest'], function (exports, _jquery, _rest) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = _interopRequireDefault(_jquery);

    var _rest2 = _interopRequireDefault(_rest);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    // Helper Functions

    var elHasNames = function elHasNames(el, keys) {
        return keys.some(function (name) {
            return name == (0, _jquery2.default)(el).attr('name');
        });
    };

    function getFormPayload($form) {
        var payload = {};
        $form.serializeArray().forEach(function (_ref) {
            var name = _ref.name,
                value = _ref.value;

            var matched = /^(.*)\[\]$/.exec(name);
            if (matched) name = matched[1];

            if (payload[name] === undefined) payload[name] = matched ? [value] : value;else if (!_jquery2.default.isArray(payload[name])) payload[name] = [payload[name], value];else payload[name].push(value);
        });
        return payload;
    }

    function getFeedBackElement(el) {
        var $el = (0, _jquery2.default)(el);
        var $siblings = $el.siblings('.form-control-feedback');
        return $siblings.length ? $siblings.show() : (0, _jquery2.default)('<div class="form-control-feedback" />').insertAfter($el);
    }

    function setErrors($form, data) {
        var keys = Object.keys(data);
        (0, _jquery2.default)('.form-group input, .form-group textarea', $form).filter(function (_, el) {
            return elHasNames(el, keys);
        }).each(function (_, el) {
            var $el = (0, _jquery2.default)(el);
            var name = $el.attr('name');
            getFeedBackElement($el).html(data[name].join && data[name].join(' '));
            $el.parent().addClass('has-danger');
        });
    }

    function clearErrors($form) {
        (0, _jquery2.default)('.form-control-feedback', $form).hide();
        (0, _jquery2.default)('.form-group', $form).removeClass('has-danger');
    }

    function clearFormValues($form) {
        $form.find('input[type=text], textarea').val('');
    }

    // `Form` Class Definition

    function Form($el, api, action) {
        var clearForm = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

        this._$el = (0, _jquery2.default)($el);
        this._$submitButtons = (0, _jquery2.default)('[type=submit]', this._$el);
        this._api = new _rest2.default(api);
        this._action = action;
        this._clearForm = clearForm;
        this._init();
    }

    Form.prototype = {
        _init: function _init() {
            var _this = this;

            this._$el.submit(function (e) {
                e.preventDefault();
                e.stopPropagation();
                _this._onSubmit();
            });
            this._eventBus = (0, _jquery2.default)({});
        },
        payload: function payload(cb) {
            this._eventBus.on('finalize-payload', function (e) {
                for (var _len = arguments.length, rest = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                    rest[_key - 1] = arguments[_key];
                }

                return cb.apply(undefined, rest);
            });
            return this;
        },
        submitted: function submitted(cb) {
            this._eventBus.on('submitted', function (e) {
                for (var _len2 = arguments.length, rest = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                    rest[_key2 - 1] = arguments[_key2];
                }

                return cb.apply(undefined, rest);
            });
            return this;
        },
        getPayload: function getPayload() {
            var payload = getFormPayload(this._$el);
            this._eventBus.trigger('finalize-payload', payload);
            return payload;
        },
        _toggleButtons: function _toggleButtons(value) {
            this._$submitButtons.prop('disabled', value);
        },
        _onSubmit: function _onSubmit() {
            var _this2 = this;

            this._toggleButtons(true);
            clearErrors(this._$el);

            var response = this._api[this._action](this.getPayload());
            this._eventBus.trigger('submitted', response);

            response.always(function () {
                return _this2._toggleButtons(false);
            }).paramerror(function (data) {
                return setErrors(_this2._$el, data);
            }).ok(function () {
                if (_this2._clearForm) clearFormValues(_this2._$el);
            });
        }
    };

    exports.default = Form;
});
//# sourceMappingURL=../__maps__/util/form.js.map
