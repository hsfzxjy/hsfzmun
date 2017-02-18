define(['util/rest', 'util/pinyin', 'user-info', 'util/tmpl', 'util/websocket', 'util/form', 'util/attachments', 'util/common', 'bootstrap', 'jquery'], function (_rest, _pinyin, _userInfo, _tmpl, _websocket, _form, _attachments, _common) {
    'use strict';

    var _rest2 = _interopRequireDefault(_rest);

    var _pinyin2 = _interopRequireDefault(_pinyin);

    var _userInfo2 = _interopRequireDefault(_userInfo);

    var tmpl = _interopRequireWildcard(_tmpl);

    var _websocket2 = _interopRequireDefault(_websocket);

    var _form2 = _interopRequireDefault(_form);

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

    // Global variables

    var $sidebar = $('#sidebar'),
        $chatview = $('#chat-view');
    var $textarea = $('#input-bar textarea');
    var $title = $('div.top-bar .title');
    var $cover = $('#chat-view div.cover');
    var $submitButton = $('#input-bar button[type=submit]');
    var $loadHistoryButton = $('#load-history');
    var $messagePane = $('#message-pane');
    var $chatList = $('#chat-pane ul');
    var $searchInput = $('#search-box');
    var $searchPane = $('#search-pane');
    var $messageNotifier = $('#message-notifier');

    // Submit Button State

    $textarea.on('input change', function () {
        return $submitButton.prop('disabled', !$textarea.val());
    });

    // Search

    $searchInput.on('focus', function () {
        $searchPane.show();
    }).on('input', function () {
        var reg = new RegExp($searchInput.val());

        $searchPane.find('li').each(function () {
            var $this = $(this),
                pinyin = $this.data('py');

            $this.toggle(reg.test(pinyin));
        });
    });

    $('html').click(function (_ref) {
        var target = _ref.target;

        if ($searchPane.is(':visible') && !$(target).closest('#searchPane, #search-box').length) $searchPane.hide();
    });

    // Scroll Utils

    function scrollToBottom() {
        $messagePane.scrollTop($messagePane[0].scrollHeight);
    }

    function isBottomed() {
        return $messagePane.scrollTop() + $messagePane.height() > $loadHistoryButton.height() + 10 + $messageBox.outerHeight();
    }

    $messagePane.scroll((0, _common.throttle)(function () {
        if (isBottomed()) $messagePane.trigger('bottomed');
    }, 100));

    // Notifier Utils

    function showNotifier(message) {
        if (!message.is_me && (!isBottomed() || message.session_name !== manager.currentSession.session_name)) $messageNotifier.html(message.digest).data('session_name', message.session_name).show();
    }

    function hideNotifier(message) {
        $messageNotifier.hide();
    }

    $messagePane.on('bottomed', function () {
        if (manager.currentSession.session_name === $messageNotifier.data('session_name')) $messageNotifier.hide();
    });

    $messageNotifier.click(function () {
        manager.activate(manager._sessions[$messageNotifier.data('session_name')]);
        scrollToBottom();
        hideNotifier();
    });

    // Util for Input Bar

    function clearInput() {
        $textarea.val('').change();
        $form.find('input[name="attachments[]"]').remove();
    }

    // Input Form

    var $form = $('#input-bar form');

    var form = new _form2.default($form, null, null).payload(function (data) {
        return data.uid = (0, _common.randomString)();
    });

    // Upload Attachments

    var $controlButton = $('#upload-file-button .control-button');

    var uploader = new _attachments.Upload({
        $button: '#upload-file-button',
        $form: $form,
        $progress: '#input-bar .progress .progress-bar'
    }).on('start', function () {
        $controlButton.show().find('i').icons('times');
    }).on('always', function () {
        return $controlButton.fadeOut();
    }).on('uploaded', function () {
        return manager.submit();
    });

    $controlButton.click(function () {
        return uploader.abortAll();
    });

    // Top nav icons

    $('#sidebar ul.top-nav li a').on('shown.bs.tab hidden.bs.tab', function (_ref2) {
        var type = _ref2.type;

        var $i = $(this).find('i'),
            iconBaseName = 'fa-' + $i.data('icon');
        $i.toggleClass(iconBaseName, type === 'shown').toggleClass(iconBaseName + '-o', type === 'hidden');
    });

    // sidebar & chat-view toggler

    function toggleView(showView) {
        var argSide = showView === undefined ? undefined : showView,
            argChat = showView === undefined ? undefined : !showView;
        $sidebar.toggleClass('hidden-sm-down', argSide);
        $chatview.toggleClass('hidden-sm-down', argChat);
    }

    $('body').on('click', '.toggle-view', toggleView);

    // Session Class Definition

    var USER_SESSION = 'user',
        GROUP_SESSION = 'group';

    function Session(type, object) {
        this.session_name = object.session_name;
        this._type = type;
        this._object = object;
        this._entries = [];
        this._messages = [];
        this._historyAPI = new _rest2.default('/api/messages/history/').param('session_name', object.session_name).param('before', this._earliestTime());
        this._unreadCount = 0;
    }

    Session.prototype = {
        _decorateMessage: function _decorateMessage(message) {
            message.sender = manager._users.filter(function (u) {
                return u.id === message.sender;
            })[0];
            message.is_me = message.sender.id === _userInfo2.default.userId;
            message.direction = message.is_me ? 'right' : 'left';
            message.digest = (message.is_me ? '' : message.sender.nickname + ': ') + message.content.slice(0, 20).replace(/\s/g, '');
        },
        _earliestTime: function _earliestTime() {
            if (!this._messages.length) return manager.getLastTime();
            return this._messages[0].created;
        },
        loadHistory: function loadHistory() {
            var _this = this;

            if (!this._historyAPI) return;
            new _rest2.default(this._historyAPI).get().ok(function (_ref3) {
                var results = _ref3.results,
                    next = _ref3.next;

                results.forEach(function (message) {
                    _this._decorateMessage(message);
                    _this._messages.unshift(message);
                });

                if (_this.isActive()) _this.renderHistory(results);

                _this._historyAPI = next;
                if (!next) $loadHistoryButton.hide();
            });
        },
        renderHistory: function renderHistory(messages) {
            var oldHeight = $messageBox.height();
            messageRenderer.renderMessages(messages.reverse(), tmpl.BEFORE);
            $messagePane.scrollTop($messageBox.height() - oldHeight);
        },
        addEntry: function addEntry($el) {
            var _this2 = this;

            this._entries.push($el);

            $el.click(function () {
                return manager.activate(_this2);
            });
        },
        extraFields: function extraFields() {
            var result = { session_name: this._object.session_name };

            if (this._type === USER_SESSION) result.receiver = this._object.id;

            return result;
        },
        receivedMessage: function receivedMessage(message) {
            this._decorateMessage(message);
            this._messages.push(message);
            if (this.isActive()) messageRenderer.renderMessage(message, tmpl.AFTER);
            var item = chatList.getItem(this);
            item.receivedMessage(message);
            if (!this.isActive()) {
                this._incUnread();
                item.setUnread(true);
            }
            showNotifier(message);
        },
        _incUnread: function _incUnread() {
            this._unreadCount++;
            unreadManager.inc(1);
        },
        _clearUnread: function _clearUnread() {
            unreadManager.dec(this._unreadCount);
            this._unreadCount = 0;
        },
        isActive: function isActive() {
            return this === manager.currentSession;
        },
        activate: function activate() {
            $title.html(this._object.title);
            messageRenderer.clear();
            messageRenderer.renderMessages(this._messages, tmpl.AFTER);
            $messagePane.scrollTop($messageBox.height());
            var item = chatList.getItem(this);
            if (this._historyAPI) $loadHistoryButton.show();
            this._clearUnread();
            item.setUnread(false);
        }
    };

    // ChatListItem Class Definition

    function ChatListItem(session) {
        this._session = session;
        this._init();
    }

    ChatListItem.prototype = {
        _init: function _init() {
            this._createElement();
        },
        _createElement: function _createElement() {
            this._$el = tmpl.renderBefore($chatList, 'chat', this._session._object);
            this._session.addEntry(this._$el);
        },
        topElement: function topElement() {
            this._$el.detach().prependTo($chatList);
        },
        receivedMessage: function receivedMessage(message) {
            chatList.top(this._session);
            this._$el.find('.message-digest').html(message.digest);
        },
        setUnread: function setUnread(value) {
            this._$el.find('.dot').toggle(value);
        }
    };

    // chatList Object Definition

    var chatList = {

        _chatItems: {},
        _names: [],

        getItem: function getItem(session) {
            var item = this._chatItems[session.session_name];

            if (item !== undefined) return item;
            item = this._chatItems[session.session_name] = new ChatListItem(session);
            this._names.unshift(session.session_name);
            this._storeNames();
            return item;
        },
        top: function top(session) {
            var item = this.getItem(session),
                name = session.session_name;

            item.topElement();
            this._names.remove(name).unshift(name);
            this._storeNames();
        },
        _storeNames: function _storeNames() {
            window.localStorage.setObj('chat-items', this._names);
        },
        recover: function recover() {
            var _this3 = this;

            this._names = window.localStorage.getObj('chat-items') || [];

            this._names.slice().reverse().forEach(function (session_name) {
                _this3.getItem(manager._sessions[session_name]);
            });
        }
    };

    // messageRenderer Object Definition

    var $messageBox = $('#message-box');

    var messageRenderer = {
        clear: function clear() {
            $messageBox.html('');
        },
        renderMessages: function renderMessages(messages, direction) {
            tmpl.renderEachSwitch(direction, $messageBox, 'message', messages);
        },
        renderMessage: function renderMessage(message, direction) {
            this.renderMessages([message], direction);
        }
    };

    // manager Object Definition

    var makeUserSessionName = function makeUserSessionName(u) {
        var ids = [_userInfo2.default.userId, u.id];
        ids.sort();
        return 'user_' + ids.join('_');
    };
    var makeGroupSessionName = function makeGroupSessionName(g) {
        return 'discussion_' + g.id;
    };

    var manager = {

        _users: [],
        _groups: [],
        _sessions: {},

        _usersLoaded: false,
        _groupsLoaded: false,

        currentSession: null,

        init: function init() {
            var _this4 = this;

            this._loadUsers();
            this._loadGroups();

            (0, _common.wait)(function () {
                return _this4._groupsLoaded && _this4._usersLoaded;
            }).then(function () {
                chatList.recover();
                _websocket2.default.connect();
            });

            this._bindEventListeners();
            this._bindSocketListeners();
        },
        _loadUnreadMessages: function _loadUnreadMessages() {
            var _this5 = this;

            new _rest2.default('/api/messages/unread/').param('after', this.getLastTime()).get().ok(function (results) {
                return _this5.receivedMessages(results);
            });
        },
        _bindEventListeners: function _bindEventListeners() {
            var _this6 = this;

            $submitButton.loading({
                start: function start() {
                    this.find('i').removeClass('fa-send-o').addClass('fa-spin fa-circle-o-notch');
                },
                stop: function stop() {
                    this.find('i').removeClass('fa-spin fa-circle-o-notch').addClass('fa-send-o');
                }
            }).click(this.submit.bind(this));

            $loadHistoryButton.click(function () {
                return _this6.currentSession.loadHistory();
            });
        },
        _bindSocketListeners: function _bindSocketListeners() {
            var _this7 = this;

            _websocket2.default.subscribe('chat', function (message) {
                if (message.uid === $submitButton.data('waiting-uid')) _this7.submitted();
                _this7.receivedMessages([message]);
            }).open(function () {
                return _this7._loadUnreadMessages();
            });
        },
        receivedMessages: function receivedMessages(messages) {
            messages.forEach(this.receivedMessage.bind(this));
        },
        receivedMessage: function receivedMessage(message) {
            this._updateLastTime(message.created);
            this._sessions[message.session_name].receivedMessage(message);
        },
        _updateLastTime: function _updateLastTime(time) {
            window.localStorage.setItem('last-time', time);
        },
        getLastTime: function getLastTime() {
            return window.localStorage.getItem('last-time') || new Date().toISOString();
        },
        submitted: function submitted() {
            $submitButton.loading('stop');
            clearInput();
            setTimeout(function () {
                return scrollToBottom();
            }, 150);
        },
        submit: function submit() {
            var payload = form.getPayload();
            $submitButton.loading('start').data('waiting-uid', payload.uid);
            _websocket2.default.send(payload);
        },
        _loadUsers: function _loadUsers() {
            var _this8 = this;

            return this._loadContact({
                api: '/api/users/',
                sessionName: makeUserSessionName,
                title: 'nickname',
                store: '_users',
                $list: '#user-contacts-pane ul',
                type: USER_SESSION
            }).ok(function () {
                return _this8._usersLoaded = true;
            });
        },
        _loadContact: function _loadContact(_ref4) {
            var _this9 = this;

            var api = _ref4.api,
                _ref4$pipe = _ref4.pipe,
                pipe = _ref4$pipe === undefined ? function (x) {
                return x;
            } : _ref4$pipe,
                store = _ref4.store,
                $list = _ref4.$list,
                type = _ref4.type,
                title = _ref4.title,
                sessionName = _ref4.sessionName;

            return new _rest2.default(api).get().ok(function (results) {
                var entries = $();
                _this9[store] = results;

                results.forEach(function (object) {
                    pipe(object);
                    object.title = object[title];
                    object.pinyin = _pinyin2.default.getFullChars(object.title).toLowerCase();
                    object.session_name = sessionName(object);

                    var session = _this9._createSession(object, type);
                    var entry = $(tmpl.render('contact', object));
                    var searchEntry = entry.clone().appendTo($searchPane.find('ul'));

                    session.addEntry(searchEntry);
                    session.addEntry(entry);
                    entries = entries.add(entry);
                });

                entries.sort(function (x, y) {
                    var pyx = '' + $(x).data('py'),
                        pyy = '' + $(y).data('py');

                    return pyx > pyy ? 1 : pyx === pyy ? 0 : -1;
                }).appendTo($list);
            });
        },
        _createSession: function _createSession(object, type) {
            var session = this._sessions[object.session_name];

            if (session === undefined) {
                session = this._sessions[object.session_name] = new Session(type, object);
            }

            return session;
        },
        _loadGroups: function _loadGroups() {
            var _this10 = this;

            return this._loadContact({
                api: '/api/discussions/',
                sessionName: makeGroupSessionName,
                title: 'name',
                store: '_groups',
                $list: '#group-contacts-pane ul',
                type: GROUP_SESSION
            }).ok(function () {
                return _this10._groupsLoaded = true;
            });
        },
        activate: function activate(session) {
            $cover.toggle(session === null);
            if (this.currentSession === session) return;
            this.currentSession = session;
            if (this.currentSession === null) return;

            clearInput();
            tmpl.renderInto('#input-bar div.extra-fields', 'extra-fields', session.extraFields());
            session.activate();
            toggleView(true);
        }
    };

    manager.init();

    // unreadManager Definition

    var unreadManager = {

        _count: 0,

        inc: function inc(number) {
            this._count += number;
            this._syncState();
        },
        dec: function dec(number) {
            this._count -= number;
            this._syncState();
        },
        _syncState: function _syncState() {
            if (this._count < 0) this._count = 0;

            $('.global.dot').toggle(this._count !== 0);
        }
    };
});
//# sourceMappingURL=../__maps__/chat/index.js.map
