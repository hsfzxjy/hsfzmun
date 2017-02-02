import Form from 'util/form'
import API from 'util/rest'
import * as list from 'util/list'
import pageConfig from 'page-config'
import user from 'user-info'

function setReplyTo (data) {
    $('#comment-form input[name=reply_to]').remove()
    $('<input>')
        .attr({ type: 'hidden', name: 'reply_to', value: data.id })
        .prependTo('#comment-form')
    $('#comment-form textarea').attr('placeholder', `@${data.nickname}`)
    $('#cancel-reply').removeClass('hidden-xs-up')
    location.href = '#comment-title'
}

function clearReplyTo () {
    $('#comment-form input[name=reply_to]').remove()
    $('#cancel-reply').addClass('hidden-xs-up')
    $('#comment-form textarea').attr('placeholder', ``)
}

$('#cancel-reply').click(clearReplyTo)

const $commentBox = $("#comment-box")

const commentAPI = new API(`/api/articles/${pageConfig.articleId}/comments/`)

let commentList = new list.List({
    $box: $commentBox,
    api: commentAPI,
    tmpl: 'comment-item',
    $loadMore: '#load-more-comments'
}).results(results => results.forEach(item => {
    item.can_reply = user.authenticated && item.author.id !== user.userId
}))

$commentBox.on('click', '.btn-reply', function () {
    setReplyTo($(this).data())
})

new Form('#comment-form', commentAPI, 'post')
    .submitted(response => {
        response.ok(commentList.prepend.bind(commentList))
            .ok(clearReplyTo)
    })

// Verification

$('#accept, #reject').on('click', function () {
    let action = $(this).attr('id')
    new API(`/api/articles/${pageConfig.articleId}/${action}/`)
        .post().ok(() => {
            $(this).parent().remove()
        })
})
