import 'bootstrap'
import Mustache from 'mustache'
import * as tmpl from 'util/tmpl'
import API from 'util/rest'
import * as timeago from 'timeago'

// Helper Functions

function getParams (url = window.location.href) {
    let match
    let plus = /\+/g
    let search = /([^&=]+)=?([^&]*)/g
    let query = (url.split('?')[1] || '').split('#')[0]

    const decode = s => decodeURIComponent(s.replace(plus, " "))

    let result = {}
    while (match = search.exec(query))
        result[decode(match[1])] = decode(match[2])

    return result
}


// `Router` Class Definition

function Router () { this._init() }

Router.prototype = {

    _init () {
        this.url = ''
        this.params = {}
        this._eventBus = $({})
        // Listen `popstate` event
        $(window).on('popstate', this._fireRouteEvent.bind(this))
        // Trigger event when page loaded
        $(() => this._fireRouteEvent(true))
    },

    _fireRouteEvent (first = false) {
        this.url = location.pathname
        this.params = getParams()
        this._eventBus.trigger('route', [this.url, this.params, first])
    },

    go (url, title = '', trigger = true) {
        console.log('go', url)
        history.pushState(null, title, url)
        if (trigger) this._fireRouteEvent()
    },

    route (cb) {
        this._eventBus.on('route', (e, ...rest) => cb(...rest))
        return this
    }
}

const router = new Router()

// Page relevance

const $topNav = $('#article-top-nav'), $sideNav = $('#article-side-nav')

let $sideNavItems

const $tabContents = $('div.tab-content')

const getTabId = name => `tab-${name}`
const id = function () { return getTabId(this.name) }

export const articleListManager = {

    _listViews: {},

    activeName: '',

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
        const tmplSuffix = data => data.items ? 'stacked' : 'single'
        const navTmplId = prefix => data => `${prefix}-${tmplSuffix(data)}`
        const pack = item => ({ name: item[1], title: item[0], id })

        const menus = this._menus.map(item =>
            $.isArray(item[1]) ? {
                title: item[0],
                items: item[1].map(pack)
            } : pack(item)
        )

        tmpl.renderEachTo($topNav, navTmplId('article-top-nav'), menus)

        tmpl.renderEachTo($sideNav, navTmplId('article-side-nav'), menus)

        $sideNavItems = $('a', $sideNav)

        $sideNavItems.click(e => {
            e.preventDefault()
            this._showTab($(e.currentTarget).data('name'))
        })

        $topNav.find('a[data-name]').on('show.bs.tab', ({ target }) => {
            let name = $(target).data('name')
            if (!this._first) router.go(this._listViews[name].currentUrl(), '')
            this._first = false
        })
    },

    _registerRouteEvents () {
        router.route((url, params, first) => {
            let name = (/\/list\/(.+)\/$/.exec(url) || '')[1] || this._defaultName
            this.activeName = name
            this._first = first
            if (first) this._showTab(name)
        })
    },

    _showTab (name) {
        let sel = `a[data-name=${name}]`
        $(sel, $topNav).tab('show')
        $(`a`, $sideNav).removeClass('active')
        let $sideItem = $(sel, $sideNav).addClass('active')
    },

    _createListViews () {
        $.each(this._apis, (name, api) => {
            this._listViews[name] = new ArticleListView(name, api)
        })
    }
}

function ArticleListView (name, api) {
    this._currentAPI = this._api = (new API(api))
    this._name = name
    this._init()
}

ArticleListView.prototype = {

    _init () {
        this._first = true
        // Init tab panel
        this._$pane = tmpl.renderTo($tabContents, 'tab-pane', {
            name: this._name,
            id
        })
        this._registerPagerEvents()
        this._registerRouteEvents()
    },

    _registerRouteEvents () {
        router
            .route((url, params, first) => {
                if (articleListManager.activeName !== this._name) return
                if (this._first) this._load(this._api.param(params))
            })
    },

    _registerPagerEvents () {
        $(this._$pane).on('click', 'a.page-link', e => {
            e.preventDefault()
            let api = $(e.target).data('api')
            this._load(api)
            router.go(this.currentUrl(), '', false)
        })
    },

    currentUrl () {
        return `/articles/list/${this._name}/?${this._currentAPI.currentParamString()}`
    },

    _load (api) {
        this._first = false
        return (this._currentAPI = new API(api)).get().ok(data => {
            tmpl.renderInto(this._$pane, 'article-list-view', data, { article: tmpl.getTmpl('article') })
            timeago.bind()
        })
    }
}
