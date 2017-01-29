import 'trumbowyg'
import Form from 'util/form'
import { articleId } from 'page-config'

let $content = $('#content').trumbowyg({
    btnsDef: {
        // Customizables dropdowns
        image: {
            dropdown: ['insertImage', 'upload', 'base64', 'noembed'],
            ico: 'insertImage'
        }
    },
    btns: [
        ['viewHTML'],
        ['undo', 'redo'],
        ['formatting'],
        'btnGrp-design',
        ['link'],
        ['image'],
        'btnGrp-justify',
        'btnGrp-lists',
        ['foreColor', 'backColor'],
        ['preformatted'],
        ['horizontalRule'],
        ['fullscreen']
    ],
    'plugins': {
        upload: {
            serverPath: '/files/image/',
            fileFieldName: 'image',
            urlPropertyName: 'url'
        }
    }
})

const getContent = $el => $el.data('trumbowyg').$ed.html()
const api = articleId ? `/api/articles/${articleId}/` : '/api/articles/'
const action = articleId ? 'patch' : 'post'

let editForm = new Form('#edit-form', api, action)
    .payload(data =>
        data.tags = data.tags.split(/\s+/).filter(name => name)
    ).payload(data =>
        data.content = getContent($content)
    ).submitted(response =>
        response.ok(({ url }) => location.href = url)
    )

// File Uploads

import { Upload } from 'util/attachments'

new Upload({
    $button: '#attachments',
    $progress: '.progress .progress-bar',
    $fileBox: '#file-box',
    $form: '#edit-form',
    tmpl: 'file-item',
    $noFiles: '.no-files',
    initialAPI: articleId ? `/api/articles/${articleId}/attachments/`: undefined
})
