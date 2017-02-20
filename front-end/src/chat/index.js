import 'bootstrap'
import 'jquery'
import API from 'util/rest'
import pinyin from 'util/pinyin'
import user from 'user-info'
import * as tmpl from 'util/tmpl'
import socket from 'util/websocket'
import Form from 'util/form'
import { Upload } from 'util/attachments'

import { throttle, randomString, wait } from 'util/common'

tmpl.verbatim()

// Global variables

const $sidebar = $('#sidebar'), $chatview = $('#chat-view')
const $textarea = $('#input-bar textarea')
const $title = $('div.top-bar .title')
const $cover = $('#chat-view div.cover')
const $submitButton = $('#input-bar button[type=submit]')
const $loadHistoryButton = $('#load-history')
const $messagePane = $('#message-pane')
const $chatList = $('#chat-pane ul')
const $searchInput = $('#search-box')
const $searchPane = $('#search-pane')
const $messageNotifier = $('#message-notifier')

// Submit Button State

$textarea.on('input change', () => $submitButton.prop('disabled', !$textarea.val()))

// Search

$searchInput.on('focus', () => {
    $searchPane.show()
}).on('input', () => {
    let reg = new RegExp($searchInput.val())

    $searchPane.find('li').each(function () {
        let $this = $(this), pinyin = $this.data('py')

        $this.toggle(reg.test(pinyin))
    })
})

$('html').click(({ target }) => {
    if ($searchPane.is(':visible') && !$(target).closest('#searchPane, #search-box').length) $searchPane.hide()
})

// Scroll Utils

function scrollToBottom () {
    $messagePane.scrollTop($messagePane[0].scrollHeight)
}

function isBottomed () {
    return $messagePane.scrollTop() + $messagePane.height() > $loadHistoryButton.height() + 10 + $messageBox.outerHeight()
}

$messagePane.scroll(throttle(() => {
    if (isBottomed())
        $messagePane.trigger('bottomed')
}, 100))

// Notifier Utils

function showNotifier (message) {
    if (!message.is_me && (!isBottomed() || manager.isCurrentSessionName(message.session_name)))
        $messageNotifier.html(message.digest).data('session_name', message.session_name).show()
}

function hideNotifier (message) {
    $messageNotifier.hide()
}

$messagePane.on('bottomed', () => {
    if (manager.isCurrentSessionName($messageNotifier.data('session_name')))
        $messageNotifier.hide()
})

$messageNotifier.click(() => {
    manager.activate(manager._sessions[$messageNotifier.data('session_name')])
    scrollToBottom()
    hideNotifier()
})

// Util for Input Bar

function clearInput () {
    $textarea.val('').change()
    $form.find('input[name="attachments[]"]').remove()
}

// Input Form

const $form = $('#input-bar form')

const form = new Form($form, null, null).payload(data => data.uid = randomString())

// Upload Attachments

const $controlButton = $('#upload-file-button .control-button')

const uploader = new Upload({
    $button: '#upload-file-button',
    $form,
    $progress: '#input-bar .progress .progress-bar'
}).on('start', () => {
    $controlButton.show().find('i').icons('times')
}).on('always', () => $controlButton.fadeOut())
.on('uploaded', () => manager.submit())

$controlButton.click(() => uploader.abortAll())

// Top nav icons

$('#sidebar ul.top-nav li a')
    .on('shown.bs.tab hidden.bs.tab', function ({ type }) {
        let $i = $(this).find('i'), iconBaseName = `fa-${$i.data('icon')}`
        $i
            .toggleClass(iconBaseName, type === 'shown')
            .toggleClass(`${iconBaseName}-o`, type === 'hidden')
    })

// sidebar & chat-view toggler

function toggleView (showView) {
    let argSide = showView === undefined ? undefined : showView, argChat = showView === undefined ? undefined : !showView
    $sidebar.toggleClass('hidden-sm-down', argSide)
    $chatview.toggleClass('hidden-sm-down', argChat)
}

$('body').on('click', '.toggle-view', toggleView)

// Session Class Definition

const USER_SESSION = 'user', GROUP_SESSION = 'group'

function Session (type, object) {
    this.session_name = object.session_name
    this._type = type
    this._object = object
    this._entries = []
    this._messages = []
    this._historyAPI = new API('/api/messages/history/')
        .param('session_name', object.session_name)
        .param('before', this._earliestTime())
    this._unreadCount = 0
}

Session.prototype = {

    _decorateMessage (message) {
        message.sender = manager._users.filter(u => u.id === message.sender)[0]
        message.is_me = message.sender.id === user.userId
        message.direction = message.is_me ? 'right' : 'left'
        message.digest = (message.is_me ? '' : `${message.sender.nickname}: `) + message.content.slice(0, 20).replace(/\s/g, '')
    },

    _earliestTime () {
        if (!this._messages.length) return manager.getLastTime()
        return this._messages[0].created
    },

    loadHistory () {
        if (!this._historyAPI) return
        new API(this._historyAPI).get()
            .ok(({ results, next }) => {
                results.forEach(message => {
                    this._decorateMessage(message)
                    this._messages.unshift(message)
                })

                if (this.isActive()) this.renderHistory(results)

                this._historyAPI = next
                if (!next) $loadHistoryButton.hide()
            })
    },

    renderHistory (messages) {
        let oldHeight = $messageBox.height()
        messageRenderer.renderMessages(messages.reverse(), tmpl.BEFORE)
        $messagePane.scrollTop($messageBox.height() - oldHeight)
    },

    addEntry ($el) {
        this._entries.push($el)

        $el.click(() => manager.activate(this))
    },

    extraFields () {
        let result = { session_name: this._object.session_name }

        if (this._type === USER_SESSION) result.receiver = this._object.id

        return result
    },

    receivedMessage (message) {
        this._decorateMessage(message)
        this._messages.push(message)
        if (this.isActive()) messageRenderer.renderMessage(message, tmpl.AFTER)
        let item = chatList.getItem(this)
        item.receivedMessage(message)
        if (!this.isActive()) {
            this._incUnread()
            item.setUnread(true)
        }
        showNotifier(message)
    },

    _incUnread () {
        this._unreadCount++
        unreadManager.inc(1)
    },

    _clearUnread () {
        unreadManager.dec(this._unreadCount)
        this._unreadCount = 0
    },

    isActive () {
        return this === manager.currentSession
    },

    activate () {
        $title.html(this._object.title)
        messageRenderer.clear()
        messageRenderer.renderMessages(this._messages, tmpl.AFTER)
        $messagePane.scrollTop($messageBox.height())
        let item = chatList.getItem(this)
        if (this._historyAPI) $loadHistoryButton.show()
        this._clearUnread()
        item.setUnread(false)
    }
}

// ChatListItem Class Definition

function ChatListItem (session) {
    this._session = session
    this._init()
}

ChatListItem.prototype = {

    _init () {
        this._createElement()
    },

    _createElement () {
        this._$el = tmpl.renderBefore($chatList, 'chat', this._session._object)
        this._session.addEntry(this._$el)
    },

    topElement () {
        this._$el.detach().prependTo($chatList)
    },

    receivedMessage (message) {
        chatList.top(this._session)
        this._$el.find('.message-digest').html(message.digest)
    },

    setUnread (value) {
        this._$el.find('.dot').toggle(value)
    }
}

// chatList Object Definition

const chatList = {

    _chatItems: {},
    _names: [],

    getItem (session) {
        let item = this._chatItems[session.session_name]

        if (item !== undefined) return item
        item = this._chatItems[session.session_name] = new ChatListItem(session)
        this._names.unshift(session.session_name)
        this._storeNames()
        return item
    },

    top (session) {
        let item = this.getItem(session), name = session.session_name

        item.topElement()
        this._names.remove(name).unshift(name)
        this._storeNames()
    },

    _storeNames () {
        window.localStorage.setObj('chat-items', this._names)
    },

    recover () {
        this._names = window.localStorage.getObj('chat-items') || []

        this._names.slice().reverse().forEach(session_name => {
            this.getItem(manager._sessions[session_name])
        })
    }
}


// messageRenderer Object Definition

const $messageBox = $('#message-box')

const messageRenderer = {

    clear () {
        $messageBox.html('')
    },

    renderMessages (messages, direction) {
        tmpl.renderEachSwitch(direction, $messageBox, 'message', messages)
    },

    renderMessage (message, direction) {
        this.renderMessages([message], direction)
    }
}

// manager Object Definition

const makeUserSessionName = u => {
    let ids = [user.userId, u.id]
    ids.sort()
    return `user_${ids.join('_')}`
}
const makeGroupSessionName = g => `discussion_${g.id}`

const manager = {

    _users: [],
    _groups: [],
    _sessions: {},

    _usersLoaded: false,
    _groupsLoaded: false,

    currentSession: null,

    init () {
        this._loadUsers()
        this._loadGroups()

        wait(() => this._groupsLoaded && this._usersLoaded).then(() => {
            chatList.recover()
            socket.connect()
        })

        this._bindEventListeners()
        this._bindSocketListeners()
    },

    _loadUnreadMessages () {
        new API('/api/messages/unread/').param('after', this.getLastTime()).get()
            .ok(results => this.receivedMessages(results))
    },

    _bindEventListeners () {
        $submitButton
            .loading({
                start: function () { this.find('i').removeClass('fa-send-o').addClass('fa-spin fa-circle-o-notch') },
                stop: function () { this.find('i').removeClass('fa-spin fa-circle-o-notch').addClass('fa-send-o') }
            })
            .click(this.submit.bind(this))

        $loadHistoryButton
            .click(() => this.currentSession.loadHistory())
    },

    _bindSocketListeners () {
        socket.subscribe('chat', message => {
            if (message.uid === $submitButton.data('waiting-uid')) this.submitted()
            this.receivedMessages([message])
        }).open(() => this._loadUnreadMessages())
    },

    receivedMessages (messages) {
        messages.forEach(this.receivedMessage.bind(this))
    },

    receivedMessage (message) {
        this._updateLastTime(message.created)
        this._sessions[message.session_name].receivedMessage(message)
    },

    _updateLastTime (time) {
        window.localStorage.setItem('last-time', time)
    },

    getLastTime () {
        return window.localStorage.getItem('last-time') || new Date().toISOString()
    },

    submitted () {
        $submitButton.loading('stop')
        clearInput()
        setTimeout(() => scrollToBottom(), 150)
    },

    submit () {
        let payload = form.getPayload()
        $submitButton.loading('start').data('waiting-uid', payload.uid)
        socket.send(payload)
    },

    _loadUsers () {
        return this._loadContact({
            api: '/api/users/',
            sessionName: makeUserSessionName,
            title: 'nickname',
            store: '_users',
            $list: '#user-contacts-pane ul',
            type: USER_SESSION
        }).ok(() => this._usersLoaded = true)
    },

    _loadContact ({ api, pipe = x => x, store, $list, type, title, sessionName }) {
        return new API(api).get()
            .ok(results => {
                let entries = $()
                this[store] = results

                results.forEach(object => {
                    pipe(object)
                    object.title = object[title]
                    object.pinyin = pinyin.getFullChars(object.title).toLowerCase()
                    object.session_name = sessionName(object)

                    let session = this._createSession(object, type)
                    let entry = $(tmpl.render('contact', object))
                    let searchEntry = entry.clone().appendTo($searchPane.find('ul'))

                    session.addEntry(searchEntry)
                    session.addEntry(entry)
                    entries = entries.add(entry)
                })

                entries.sort((x, y) => {
                    let pyx = '' + $(x).data('py'), pyy = '' + $(y).data('py')

                    return pyx > pyy ? 1 : pyx === pyy ? 0 : -1
                }).appendTo($list)
            })
    },

    _createSession (object, type) {
        let session = this._sessions[object.session_name]

        if (session === undefined) {
            session = this._sessions[object.session_name] = new Session(type, object)
        }

        return session
    },

    _loadGroups () {
        return this._loadContact({
            api: '/api/discussions/',
            sessionName: makeGroupSessionName,
            title: 'name',
            store: '_groups',
            $list: '#group-contacts-pane ul',
            type: GROUP_SESSION
        }).ok(() => this._groupsLoaded = true)
    },

    isCurrentSessionName (sessionName) {
        return this.currentSession && this.currentSession.session_name === sessionName
    },

    activate (session) {
        $cover.toggle(session === null)
        if (this.currentSession === session) return
        this.currentSession = session
        if (this.currentSession === null) return

        clearInput()
        tmpl.renderInto('#input-bar div.extra-fields', 'extra-fields', session.extraFields())
        session.activate()
        toggleView(true)
    }
}

manager.init()

// unreadManager Definition

const unreadManager = {

    _count: 0,

    inc (number) {
        this._count += number
        this._syncState()
    },

    dec (number) {
        this._count -= number
        this._syncState()
    },

    _syncState () {
        if (this._count < 0) this._count = 0

        $('.global.dot').toggle(this._count !== 0)
    }
}
