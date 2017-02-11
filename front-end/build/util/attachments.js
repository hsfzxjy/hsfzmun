define(['exports', 'util/rest', 'util/tmpl', 'timeago', 'file-upload'], function (exports, _rest, _tmpl, _timeago) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.Upload = Upload;

    var _rest2 = _interopRequireDefault(_rest);

    var tmpl = _interopRequireWildcard(_tmpl);

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

    var _slicedToArray = function () {
        function sliceIterator(arr, i) {
            var _arr = [];
            var _n = true;
            var _d = false;
            var _e = undefined;

            try {
                for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
                    _arr.push(_s.value);

                    if (i && _arr.length === i) break;
                }
            } catch (err) {
                _d = true;
                _e = err;
            } finally {
                try {
                    if (!_n && _i["return"]) _i["return"]();
                } finally {
                    if (_d) throw _e;
                }
            }

            return _arr;
        }

        return function (arr, i) {
            if (Array.isArray(arr)) {
                return arr;
            } else if (Symbol.iterator in Object(arr)) {
                return sliceIterator(arr, i);
            } else {
                throw new TypeError("Invalid attempt to destructure non-iterable instance");
            }
        };
    }();

    // `ProxyFile` Class Definition

    function ProxyFile(_ref) {
        var uploader = _ref.uploader,
            _ref$data = _ref.data,
            data = _ref$data === undefined ? null : _ref$data,
            _ref$fileObject = _ref.fileObject,
            fileObject = _ref$fileObject === undefined ? null : _ref$fileObject;

        this._uploader = uploader;
        this._fileObject = fileObject;
        this._data = data;

        this._init();
    }

    ProxyFile.prototype = {
        _init: function _init() {
            this._uploading = !!this._fileObject;
            this._uploader.add(this);
            if (this._uploading) this._fileObject.proxyFile = this;

            this._render();
            this._setData();
        },
        _render: function _render() {
            this._$el = tmpl.renderBefore(this._uploader._$fileBox, this._uploader._tmpl, this._fileObject || this._data);

            this._$el.find('.file-cancel').click(this._destroy.bind(this));
        },
        _setData: function _setData() {
            var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

            if (data) {
                this._data = data;
                this._uploading = false;
            }
            if (!this._$el || !this._data) return;

            this._$el.find('.timeago').attr('datetime', this._data.created);
            timeago.bind();

            this._$formInput = $('<input type="hidden" />').attr('name', 'attachments[]').attr('value', this._data.id).appendTo(this._uploader._$form);
        },
        _destroy: function _destroy() {
            var _this = this;

            if (this._uploading) {
                this._fileObject.abort();
                this._uploader.remove(this);
            } else {
                new _rest2.default('/api/attachments/' + this._data.id + '/').delete().ok(function () {
                    _this._$formInput.remove();
                    _this._uploader.remove(_this);
                });
            }
            this._$el.remove();
        }
    };

    // `Upload` Class Definition

    function Upload(_ref2) {
        var $button = _ref2.$button,
            _ref2$$noFiles = _ref2.$noFiles,
            $noFiles = _ref2$$noFiles === undefined ? null : _ref2$$noFiles,
            $form = _ref2.$form,
            $progress = _ref2.$progress,
            initialAPI = _ref2.initialAPI,
            $fileBox = _ref2.$fileBox,
            tmpl = _ref2.tmpl;

        this._$button = $($button);
        this._$noFiles = $($noFiles);
        this._$form = $($form);

        this._$progress = $($progress);
        this._initialAPI = initialAPI;
        this._$fileBox = $($fileBox);
        this._proxyFiles = [];
        this._tmpl = tmpl;

        this._eventBus = $({});

        this._init();
    }

    Upload.prototype = {
        _init: function _init() {
            var _this2 = this;

            this._loadInitial();

            this._$button.find('input[type=file]').fileupload({
                url: '/api/attachments/',
                dataType: 'json',
                maxFileSize: 10000000
            }).on('fileuploadadd', function (e, data) {
                _this2._setButtonState(true);

                var file = data.files[0];
                file.abort = function () {
                    return data.abort();
                };

                new ProxyFile({
                    uploader: _this2,
                    fileObject: file
                });

                _this2._eventBus.trigger('start');
            }).on('fileuploaddone', function (e, _ref3) {
                var result = _ref3.result,
                    _ref3$files = _slicedToArray(_ref3.files, 1),
                    fileObject = _ref3$files[0];

                return _this2._uploaded(fileObject, result);
            }).on('fileuploadprogressall', function (e, _ref4) {
                var loaded = _ref4.loaded,
                    total = _ref4.total;
                return _this2._progress(parseInt(loaded / total * 100, 10));
            }).on('fileuploadalways', function () {
                _this2._setProgress(0);
                _this2._setButtonState(false);
                _this2._eventBus.trigger('always');
            });
        },
        _setButtonState: function _setButtonState(value) {
            var _this3 = this;

            setTimeout(function () {
                _this3._$button.toggleClass('disabled', value).find('input').prop('disabled', value);
            }, 100);
        },
        _loadInitial: function _loadInitial() {
            var _this4 = this;

            if (!this._initialAPI) return;
            new _rest2.default(this._initialAPI).get().ok(function (data) {
                data.forEach(function (item) {
                    return new ProxyFile({
                        uploader: _this4,
                        data: item
                    });
                });
            });
        },
        _setNoFiles: function _setNoFiles() {
            if (!this._$noFiles.length) return;

            var state = !this._proxyFiles.length;

            this._$noFiles[state ? 'show' : 'hide']();
        },
        _uploaded: function _uploaded(fileObject, data) {
            fileObject.proxyFile._setData(data);
            this._eventBus.trigger('uploaded', data);
        },
        _progress: function _progress(percent) {
            this._setProgress(percent);
        },
        _setProgress: function _setProgress(percent) {
            this._$progress.css('width', percent + '%');
        },
        on: function on(name, cb) {
            this._eventBus.on(name, function (e) {
                for (var _len = arguments.length, rest = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                    rest[_key - 1] = arguments[_key];
                }

                return cb.apply(undefined, rest);
            });
            return this;
        },
        abortAll: function abortAll() {
            this._proxyFiles.slice().forEach(function (file) {
                return file._destroy();
            });
        },
        add: function add(proxyFile) {
            this._proxyFiles.push(proxyFile);
            this._setNoFiles();
        },
        remove: function remove(proxyFile) {
            var index = this._proxyFiles.indexOf(proxyFile);
            if (index < 0) return;
            this._proxyFiles.splice(index, 1);
            this._setNoFiles();
        }
    };
});
//# sourceMappingURL=../__maps__/util/attachments.js.map
