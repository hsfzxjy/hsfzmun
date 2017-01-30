import 'urllib'

import EventEmitter from 'util/events'
import 'jquery'

// `Router` Class Definition

function Router () { this._init() }

$.extend(Router.prototype, {

    _init () {
        this.url = ''
        this.params = {}
        this._eventBus = new EventEmitter()
        // Listen `popstate` event
        $(window).on('popstate', this._fireRouteEvent.bind(this))
        // Trigger event when page loaded
        $(() => this._fireRouteEvent(true))
    },

    _fireRouteEvent (first = false) {
        let url = new Url(location.href)
        this.url = url.path
        this.params = url.query
        this._eventBus.emit('route', [this.url, this.params, first])
        console.log('fire')
    },

    go (url, title = '', trigger = true) {
        console.log('go', url)
        history.pushState(null, title, url)
        if (trigger) this._fireRouteEvent()
    },

    route (cb) {
        console.log('bind')
        this._eventBus.on('route', cb)
        return this
    }
})

let router = new Router()

export default router
