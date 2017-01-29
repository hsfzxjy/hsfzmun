import Form from 'util/form'
import API from 'util/rest'
import * as list from 'util/list'
import pageConfig from 'page-config'

const $commentBox = $("#comment-box")

const commentAPI = new API(`/api/articles/${pageConfig.articleId}/comments/`)

let commentList = new list.List({
    $box: $commentBox,
    api: commentAPI,
    tmpl: 'comment-item',
    $loadMore: '#load-more-comments'
})

new Form('#comment-form', commentAPI, 'post')
    .submitted(response => {
        response.ok(commentList.prepend.bind(commentList))
    })
