import 'timeago'
import Form from 'util/form'
import API from 'util/rest'

new Form('#comment-form', new API('/articles/api/comments/'), 'post')
