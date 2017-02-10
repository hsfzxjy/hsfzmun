import websocketPath from 'ws-config'
import { throttle } from 'util/common'
import 'jquery'

let socket
const eventBus = $({})

let connect = throttle(function () {
    socket = new WebSocket(`ws://${location.host}${websocketPath}`)
    socket.addEventListener('open', (event) => eventBus.trigger('open', event))
    socket.addEventListener('close', (event) => eventBus.trigger('close', event))
    socket.addEventListener('error', (event) => eventBus.trigger('error', event))
    socket.addEventListener('message', ({ data }) => {
        let object = JSON.parse(data)
        eventBus.trigger('message', object)

        if (object !== null && object.type !== undefined && object.data !== undefined)
            eventBus.trigger(`message-${object.type}`, object.data)
    })
    // Reconnect
    socket.addEventListener('close', connect)
}, 10000)

function on (name, cb) {
    console.log('hi')
    eventBus.on(name, (e, ...rest) => cb(...rest))
}

export default {

    message (cb) {
        on('message', cb)
        return this
    },

    subscribe (type, cb) {
        on(`message-${type}`, cb)
        return this
    },

    open (cb) {
        on('open', cb)
        return this
    },

    close (cb) {
        on('close', cb)
        return this
    },

    error (cb) {
        on('error', cb)
        return this
    },

    send (data) {
        socket.send(JSON.stringify(data))
    },

    connect () {
        connect()
    }

}.close((...rest) => console.log(rest)).error((...rest) => console.log(rest)).open((...rest) => console.log(rest))
