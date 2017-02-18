from django.conf.urls import url
from django.views.generic.base import TemplateView

from api.routers import router, add_urlpattern

from .views import (ArticleViewSet, article_detail, TagViewSet,
                    CommentViewSet, article_edit, AttachmentViewSet,
                    ArticleFilterList, UserArticleList)


router.register(r'^articles', ArticleViewSet)
router.register(r'^comments', CommentViewSet)
router.register(r'^articles/(?P<article_id>\d+)/comments', CommentViewSet)
router.register(r'^tags', TagViewSet)
router.register(r'^articles/(?P<article_id>\d+)/attachments',
                AttachmentViewSet, base_name='article-attachments')

add_urlpattern(url(r'^articles/user/(?P<username>.+)/$',
                   UserArticleList.as_view(), name='user-articles'))

urlpatterns = [
    url(r'^new/$', TemplateView.as_view(
        template_name='articles/edit.html'), name='new'),
    url(r'^edit/(?P<article_id>\d+)/$', article_edit, name='edit'),
    url(r'^list/', TemplateView.as_view(
        template_name='articles/list.html'), name='list'),
    url(r'^detail/(?P<article_id>\d+)/$', article_detail, name='detail'),
    url(r'^search/$', ArticleFilterList.as_view(), name='search'),
]
