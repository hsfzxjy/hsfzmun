import 'jquery'

export default function EventEmitter () {
    this._eventBus = $({})
}

EventEmitter.prototype = {

    on (name, cb) {
        this._eventBus.on(name, (_, ...rest) => cb(...rest))
    },

    emit (name, args) {
        this._eventBus.trigger(name, args)
    }
}
