import 'trumbowyg'
import API from 'util/rest'
import Form from 'util/form'

let $content = $('#content').trumbowyg()

const getContent = $el => $el.data('trumbowyg').$ed.html()

let editForm = new Form('#edit-form', new API('/articles/api/articles/'), 'post')
    .payload(data =>
        data.tags = data.tags.split(/\s+/)
            .filter(name => name).map(name => ({name}))
    ).payload(data =>
        data.content = getContent($content)
    )
