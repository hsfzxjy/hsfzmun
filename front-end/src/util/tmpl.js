import Mustache from 'mustache'
import 'jquery'

const tmplCache = {}

const tempTextarea = $('<textarea />')

export const BEFORE = 'before'
export const AFTER = 'after'

export const verbatim = () => {
    Mustache.tags = ['[[', ']]']
}

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

export function renderBefore ($target, ...rest) {
    return $(render(...rest)).prependTo($target)
}

export function renderTo ($target, ...rest) {
    return $(render(...rest)).appendTo($target)
}

export function renderInto ($target, ...rest) {
    $($target).html(render(...rest))
}

export function renderSwitch (direction, ...rest) {
    return (direction === BEFORE ? renderBefore : renderTo)(...rest)
}

export function renderEach (tmplId, data, partials) {
    return data
        .map(item => render(tmplId, item, partials))
        .join('')
}

export function renderEachBefore ($target, ...rest) {
    return $(renderEach(...rest)).prependTo($target)
}

export function renderEachTo ($target, ...rest) {
    return $(renderEach(...rest)).appendTo($target)
}

export function renderEachInto ($target, ...rest) {
    $($target).html(renderEach(...rest))
}

export function renderEachSwitch (direction, ...rest) {
    return (direction === BEFORE ? renderEachBefore : renderEachTo)(...rest)
}
