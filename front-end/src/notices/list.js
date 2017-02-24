import 'timeago'
import { category } from 'notices-view-info'

import API from 'util/rest'

$('a[data-id]').on('click', e => {
    e.preventDefault()

    let $this = $(e.currentTarget)
    let id = $this.data('id'), url = $this.attr('href')
    new API(`/api/notices/${id}/mark_as_read/`).post()
        .ok(() => location.href = url)
})

$('#mark-as-read').on('click', e => {
    new API(`/api/notices/mark_all_as_read/`).param('category', category)
        .post().ok(() => {
            console.log('ok')
            $('.list-group-item-warning').removeClass('list-group-item-warning')
        })
})
