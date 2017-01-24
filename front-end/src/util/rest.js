import 'jquery'

$.ajaxSetup({
    cache: false,
    dataType: 'json'
})

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
    400: 'paramerror',
    401: 'unauthorized',
    403: 'forbidden',
    404: 'notfound',
    200: 'ok',
    500: 'servererror'
}
function API (url) {
    this.url = url
    this.params = {}
    this.contentType = JSON_TYPE
}
API.prototype = {
    param (name, value) {
        if ($.isPlainObject(name))
            $.extend(this.params, name)
        else
            this.params[name] = value
        return this
    },
    json () {
        this.contentType = JSON_TYPE
    },
    formdata () {
        this.contentType = undefined
    },
    _request (method, payload) {
        if (this.contentType === JSON_TYPE)
            payload = JSON.stringify(payload)
        return this._processResponse($.ajax({
            url: this.url,
            type: method,
            contentType: this.contentType,
            data: payload
        }))
    },
    _processResponse (response) {
        $.each(STATUSES, (code, name) => {
            console.log(code, name)
            let callbacks = $.Callbacks()
            response[name] = cb => {
                callbacks.add(cb)
                return response
            }
            response.always(() => {
                if (response.status === code) {
                    let data
                    try {
                        data = JSON.parse(response.responseText)
                    } catch (e) {
                        data = null
                    }
                    callbacks.fireWith(response, [data, response])
                }
            })
        })

        return response
    }
}

$(['get', 'post', 'put', 'patch', 'remove']).each((_, name) =>
    API.prototype[name] = function (payload) {
        return this._request(name, payload)
    }
)

export default API
