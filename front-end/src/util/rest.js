import 'jquery'

$.ajaxSetup({
    cache: false,
    dataType: 'json'
})

// Helper Functions

function updateQueryStringParameter (uri, key, value) {
    let re = new RegExp(`([?&])${key}=.*?(&|$|#)`, "i")
    let separator = uri.indexOf('?') !== -1 ? "&" : "?"
    return (uri.match(re)) ? uri.replace(re, `$1${key}=${value}$2`) : `${uri}${separator}${key}=${value}`
}

// Setup CSRF Token

function getCookie (name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        let cookies = document.cookie.split(';')
        for (let i = 0; i < cookies.length; i++) {
            let cookie = jQuery.trim(cookies[i])
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1))
                break
            }
        }
    }
    return cookieValue
}
let csrftoken = getCookie('csrftoken')

function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method))
}

$.ajaxSetup({
    beforeSend: function (xhr, settings) {
        if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken)
        }
    }
})

// `API` Definition

const JSON_TYPE = 'application/json'
const STATUSES = {
    paramerror: [400],
    unauthorized: [401],
    forbidden: [403],
    notfound: [404],
    ok: [200, 201, 204],
    servererror: [500]
}
function API (url) {
    if (url instanceof API) {
        this.url = url.url
        this.params = $.extend({}, url.params)
        this.contentType = url.contentType
    } else {
        this.url = url
        this.params = {}
        this.contentType = JSON_TYPE
    }
}
API.prototype = {

    param (name, value) {
        let newObj = new API(this)

        if ($.isPlainObject(name))
            $.extend(newObj.params, name)
        else
            newObj.params[name] = value

        return newObj
    },
    json () {
        this.contentType = JSON_TYPE
    },
    formdata () {
        this.contentType = undefined
    },
    currentUrl () {
        let url = this.url
        $.each(this.params, (key, value) =>
            url = updateQueryStringParameter(url, key, value)
        )
        return url
    },
    currentParamString () {
        let url = this.currentUrl()
        return (url.split('?')[1] || '')
    },
    _request (method, payload) {
        if (this.contentType === JSON_TYPE)
            payload = JSON.stringify(payload)

        $.each(this.params, (key, value) =>
            this.url = updateQueryStringParameter(this.url, key, value)
        )

        return this._processResponse($.ajax({
            url: this.url,
            type: method,
            contentType: this.contentType,
            data: payload
        }))
    },
    _processResponse (response) {
        $.each(STATUSES, (name, codes) => {
            let callbacks = $.Callbacks()
            // bind shortcuts to response
            response[name] = cb => {
                callbacks.add(cb)
                return response
            }
            // fire callbacks according to status code
            response.always(() => {
                if (codes.indexOf(response.status) >= 0) {
                    callbacks.fire(response.responseJSON || {}, response)
                }
            })
        })

        return response
    }
}

$(['get', 'post', 'put', 'patch', 'delete']).each((_, name) =>
    API.prototype[name] = function (payload) {
        return this._request(name, payload)
    }
)

export default API
