import socket from 'util/websocket'
import 'jquery'
import API from 'util/rest'

let oldTitle = document.title

let counts = {
    notices: 0,
    chat: 0
}

function setCount(type, value) {
    counts[type] = value
    $('.dot.chat').toggle(!!counts.chat)
    $('.dot.notices').toggle(!!counts.notices)
    let both = !!counts.chat || !!counts.notices
    $('.dot.both').toggle(both)
    document.title = (both ? '（新消息） ' : '') + oldTitle
}

const chatUtil = {

    getLastTime () {
        return window.localStorage.getItem('last-time') || new Date().toISOString()
    }
}

let lastCreated

$(() => {
    socket.connect()
    new API('/api/messages/unread/count/').param('after', chatUtil.getLastTime()).get()
        .ok(({count}) => {
            setCount('chat', count)
        })
})

socket.subscribe('notices', count => {
    setCount('notices', count)
})

socket.subscribe('chat', ({created}) => {
    lastCreated = created
    setCount('chat', counts.chat+1)
})

setInterval(() => {
    if (lastCreated && new Date(lastCreated) <= new Date(chatUtil.getLastTime()))
        setCount('chat', 0)
}, 1000)
