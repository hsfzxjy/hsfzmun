import 'timeago'

import API from 'util/rest'

$('a[data-id]').on('click', e => {
    e.preventDefault()

    let $this = $(e.currentTarget)
    let id = $this.data('id'), url = $this.attr('href')
    new API(`/api/notices/${id}/mark_as_read/`).post()
        .ok(() => location.href = url)
})
