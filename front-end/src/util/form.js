import $ from 'jquery'

function Form ($el, api, action) {
    this._$el = $($el)
    this._api = api
    this._action = action
    this._init()
}

Form.prototype = {
    _init () {
        this._$el.submit(e => {
            e.preventDefault()
            this._onSubmit()
        })
        this._eventBus = $({})
    },
    payload (cb) {
        this._eventBus.on('finalize-payload', cb)
        return this
    },
    submitted (cb) {
        this._eventBus.on('submitted', cb)
        return this
    },
    _finalizePayload () {
        let payload = {}
        this._$el.serializeArray()
            .forEach(({name, value}) => payload[name] = value)
        this._eventBus.trigger('finalize-payload', payload)
        return payload
    },
    _onSubmit () {
        console.log(this._api)
        let response = this._api[this._action](this._finalizePayload())
        this._eventBus.trigger('submitted', response)
        response.paramerror(data => {

        })
    }
}

export default Form
