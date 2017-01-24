import 'trumbowyg'
import API from 'util/rest'
import Form from 'util/form'

$('#content').trumbowyg()

let editForm = new Form('#edit-form', new API('/articles/api/articles/'), 'post')
    .payload((e, data) =>
        data.tags = data.tags.split(/\s+/)
            .filter(name => name).map(name => ({name}))
    ).payload((e, data) =>
        data.content = $('#content').trumbowyg('html')
    )
