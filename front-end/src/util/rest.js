import 'jquery'

const JSON_TYPE = 'application/json'
const STATUSES = {
    400: 'paramerror',
    401: 'unauthorized',
    403: 'forbidden',
    404: 'notfound',
    200: 'ok',
    500: 'servererror'
}
export default function API (url) {
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
        return this._processResponse($.ajax({
            url: this.url,
            type: method,
            contentType: this.contentType,
            data: payload
        }))
    },
    _processResponse (response) {
        $(STATUSES).each((code, name) => {
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

$(['get', 'post', 'put', 'patch', 'remove']).each(name =>
    API.prototype[name] = function (payload) {
        return this._request(name, payload)
    }
)
