import 'bootstrap'
import Mustache from 'mustache'
import * as tmpl from 'util/tmpl'
import API from 'util/rest'

// Helper Functions

function getParams () {
    let match
    let plus = /\+/g
    let search = /([^&=]+)=?([^&]*)/g
    let query = window.location.search.substring(1)

    const decode = s => decodeURIComponent(s.replace(pl, " "))

    let result = {}
    while (match = search.exec(query))
        result[decode(match[1])] = decode(match[2])

    return result
}


// `Router` Class Definition

function Router () { this._init() }

Router.prototype = {

    _init () {
        this._eventBus = $({})
        // Listen `popstate` event
        $(window).on('popstate', this._fireRouteEvent.bind(this))
        // Trigger event when page loaded
        $(this._fireRouteEvent.bind(this))
    },

    _fireRouteEvent () {
        this._eventBus.trigger('route', location.pathname, getParams())
    },

    go (url, title = '') {
        history.pushState(null, title, url)
    },

    route (cb) {
        this._eventBus.on('route', (e, ...rest) => cb(...rest))
        return this
    }
}

const router = new Router()

// Page relevance

const $topNav = $('#article-top-nav'), $sideNav = $('#article-side-nav')

const $tabContents = $('div.tab-content')

const getTabId = name => `tab-${name}`

export const articleListManager = {

    _listViews: {},

    /**
     *
     * @param  {list} menus e.g. [['title1', 'name1'], ['title2',[['title3', 'name3']]]]
     * @param  {flat dict} apis  {'name1': API1, 'name2': API2, 'name3': API3}
     * @return {undefined}
     */
    config (menus, apis, defaultName = '') {
        this._menus = menus
        this._apis = apis
        this._defaultName = defaultName
        this._registerRouteEvents()
        this._createMenus()
        this._createListViews()
    },

    _createMenus () {
        const tmplSuffix = data => $.isArray(data.data[1]) ? 'stacked' : 'single'
        const navTmplId = prefix => data => `${prefix}-${tmplSuffix(data)}`
        const id = function () { return getTabId(this[1] || this.data[1]) }

        const packedData = {
            data: this._menus,
            dataPipe: data => ({ data, id })
        }

        tmpl.renderEachTo($topNav, navTmplId('article-top-nav'), packedData)

        tmpl.renderEachTo($sideNav, navTmplId('article-side-nav'), packedData)

        $('a[data-toggle="tab"]').on('show.bs.tab', function (e) {
            router.go(`/articles/list/${$(this).data('name')}/`)
        })
    },

    _registerRouteEvents () {
        router.route(url => {
            let name = (/\/list\/(.+)\/$/.exec(url) || '')[1] || this._defaultName
            this._listViews[name].activate()
        })
    },

    _createListViews () {
        $.each(this._apis, (name, api) => {
            this._listViews[name] = new ArticleListView(name, api)
        })
    }
}

function ArticleListView (name, api) {
    this._api = api
    this._name = name
    this._init()
}

ArticleListView.prototype = {

    _init () {
        // Init tab panel
        this._$pane = tmpl.renderTo($tabContents, 'tab-pane', {
            name: this._name,
            id: function () { return getTabId(this.name) }
        })
    },

    _load (api) {
        return new API(api).get().ok(data => {
            tmpl.renderInto(this._$pane, 'article-list-view', data, { article: tmpl.getTmpl('article') })
        })
    },

    activate () {
        $(`a[data-name=${this._name}]`).tab('show')
        this._load(this._api)
    }
}
