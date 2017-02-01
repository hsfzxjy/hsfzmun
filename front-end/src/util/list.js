import * as timeago from 'timeago'
import API from 'util/rest'
import * as tmpl from 'util/tmpl'

export const BEFORE = tmpl.BEFORE
export const AFTER = tmpl.AFTER

export function List ({ $box, $loadMore, tmpl, api, direction = AFTER }) {
    this._$box = $($box)
    this._$loadMore = $($loadMore)
    this._api = api
    this._tmpl = tmpl
    this._direction = direction
    this._eventBus = $({})

    this._init()
}

List.prototype = {

    _init () {
        this._load(this._api)
        this._registerNextEvents()
    },

    _registerNextEvents () {
        if (!this._$loadMore.length) return
        this._$loadMore.click(() => this._next && this._load(this._next))
    },

    _load (api) {
        new API(api).get().ok(({ next, results }) => {
            this._eventBus.trigger('results', [results])
            this._buildItems(results, this._direction)
            this._setNext(next)
        })
    },

    results (cb) {
        this._eventBus.on('results', (e, ...rest) => cb(...rest))
        return this
    },

    _setNext (next) {
        this._next = next
        if (!next) this._$loadMore.hide()
    },

    _buildItem (item, direction) {
        let result = tmpl.renderSwitch(direction, this._$box, this._tmpl, item)
        timeago.bind()
        return result
    },

    _buildItems (items, direction) {
        let result = tmpl.renderEachSwitch(direction, this._$box, this._tmpl, items)
        timeago.bind()
    },

    append (item) {
        return this._buildItem(item, AFTER)
    },

    prepend (item) {
        return this._buildItem(item, BEFORE)
    }
}
