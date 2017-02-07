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

        // $el.click(() => console.log(this._object.session_name))
    }
}

// Manager Object Definition

const makeUserSessionName = u => {
    let ids = [user.userId, u.id]
    ids.sort()
    return `user_${ids.join('_')}`
}
const makeGroupSessionName = g => `discussion_${g.id}`

const Manager = {

    _users: [],
    _groups: [],
    _sessions: {},

    init () {
        this._loadUsers()
        this._loadGroups()
    },

    _loadUsers () {
        this._loadContact({
            api: '/api/users/',
            pipe: user => {
                user.session_name = makeUserSessionName(user)
                user.pinyin = pinyin.getFullChars(user.nickname).toLowerCase()
            },
            store: '_users',
            $list: '#user-contacts-pane ul',
            type: USER_SESSION
        })
    },

    _loadContact ({ api, pipe = x => x, store, $list, type }) {
        new API(api).get()
            .ok(results => {
                let entries = $()
                this[store] = results

                results.forEach(object => {
                    pipe(object)

                    let session = this._createSession(object, type)
                    let entry = $(tmpl.render('contact', object))

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
        this._loadContact({
            api: '/api/discussions/',
            pipe: group => {
                group.session_name = makeGroupSessionName(group)
                group.pinyin = pinyin.getFullChars(group.name).toLowerCase()
            },
            store: '_groups',
            $list: '#group-contacts-pane ul',
            type: GROUP_SESSION
        })
    }
}

Manager.init()
