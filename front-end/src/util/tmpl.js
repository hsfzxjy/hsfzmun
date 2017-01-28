import Mustache from 'mustache'
import 'jquery'

const tmplCache = {}

const tempTextarea = $('<textarea />')

export const getTmpl = id => {
    if (tmplCache[id]) return tmplCache[id]

    let str = tmplCache[id] = tempTextarea.html($(`#tmpl-${id}`).html()).text()
    Mustache.parse(str)
    return str
}

export function render (tmplId, data, partials) {
    if ($.isFunction(tmplId)) tmplId = tmplId(data)

    return Mustache.render(getTmpl(tmplId), data, partials)
}

export function renderTo ($target, ...rest) {
    return $(render(...rest)).appendTo($target)
}

export function renderInto ($target, ...rest) {
    $($target).html(render(...rest))
}

export function renderEach (tmplId, data, partials) {
    return data
        .map(item => render(tmplId, item, partials))
        .join('')
}

export function renderEachTo ($target, ...rest) {
    return $(renderEach(...rest)).appendTo($target)
}

export function renderEachInto ($target, ...rest) {
    $($target).html(renderEach(...rest))
}
