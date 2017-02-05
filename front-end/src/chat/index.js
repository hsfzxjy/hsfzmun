import 'bootstrap'
import 'jquery'
import API from 'util/rest'
import pinyin from 'util/pinyin'
import user from 'user-info'
import * as tmpl from 'util/tmpl'

tmpl.verbatim()

// Util Functions

function sortByPinyin (array) {
    array.sort((a, b) => a.pinyin > b.pinyin ? 1 : a.pinyin < b.pinyin ? -1 : 0)
    return array
}

// Top nav icons

$('#sidebar ul.top-nav li a')
    .on('shown.bs.tab hidden.bs.tab', function ({ type }) {
        let $i = $(this).find('i'), iconBaseName = `fa-${$i.data('icon')}`
        $i
            .toggleClass(iconBaseName, type === 'shown')
            .toggleClass(`${iconBaseName}-o`, type === 'hidden')
    })

$('a[href="#user-contacts-pane"]').tab('show')

// Session Class Definition

const USER_SESSION = 'user', GROUP_SESSION = 'group'

function Session (type, object) {
    this._type = type
    this._object = object
    this._entries = []
}

Session.prototype = {

    addEntry ($el) {
        this._entries.push($el)
    }
}

// Manager Object Definition

const makeUserSessionName = u => {
    let ids = [user.id, u.id]
    ids.sort()
    return `user_${ids.join('_')}`
}

const Manager = {

    _users: [],
    _groups: [],
    _sessions: [],

    init () {
        this._loadUsers()
    },

    _loadUsers () {
        new API('/api/users/').get()
            .ok(results => {
                results.forEach(user => {
                    user.session_name = makeUserSessionName(user)
                    user.pinyin = pinyin.getFullChars(user.nickname).toLowerCase()
                })
                sortByPinyin(results)

                this._users = results
                this._createUserContacts()
            })
    },

    _createUserContacts () {
        tmpl.renderEachTo('#user-contacts-pane ul', 'user-contact', this._users)
    }
}

Manager.init()
