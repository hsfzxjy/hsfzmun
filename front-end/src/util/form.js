import $ from 'jquery'

// Helper Functions

const elHasNames = (el, keys) => keys.some(name => name == $(el).attr('name'))

function getFormPayload ($form) {
    let payload = {}
    $form.serializeArray()
        .forEach(({name, value}) => payload[name] = value)
    return payload
}

function getFeedBackElement (el) {
    let $el = $(el)
    let $siblings = $el.siblings('.form-control-feedback')
    return $siblings.length
        ? $siblings
        : $(`<div class="form-control-feedback" />`).insertAfter($el)
}

function setErrors ($form, data) {
    const keys = Object.keys(data)
    $('.form-group input', $form)
        .filter((_, el) => elHasNames(el, keys))
    .each((_, el) => {
        let $el = $(el)
        let name = $el.attr('name')
        getFeedBackElement($el).html(data[name].join(' '))
        $el.parent().addClass('has-danger')
    })
}

// `Form` Class Definition

function Form ($el, api, action) {
    this._$el = $($el),
    this._$submitButtons = $('[type=submit]', this._$el)
    this._api = api
    this._action = action
    this._init()
}

Form.prototype = {
    _init () {
        this._$el.submit(e => {
            e.preventDefault()
            e.stopPropagation()
            this._onSubmit()
        })
        this._eventBus = $({})
    },
    payload (cb) {
        this._eventBus.on('finalize-payload', (e, ...rest) => cb(...rest))
        return this
    },
    submitted (cb) {
        this._eventBus.on('submitted', (e, ...rest) => cb(...rest))
        return this
    },
    _finalizePayload () {
        let payload = getFormPayload(this._$el)
        this._eventBus.trigger('finalize-payload', payload)
        return payload
    },
    _toggleButtons (value) {
        this._$submitButtons.prop('disabled', value)
    },
    _onSubmit () {
        this._toggleButtons(true)

        let response = this._api[this._action](this._finalizePayload())
        this._eventBus.trigger('submitted', response)

        response
            .always(() => this._toggleButtons(false))
            .paramerror(data => setErrors(this._$el, data))
    }
}

export default Form
