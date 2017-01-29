from django.conf.urls import url
from django.views.generic.base import TemplateView

from api.routers import router

from .views import (ArticleViewSet, article_detail,
                    CommentViewSet, article_edit, AttachmentViewSet)


router.register(r'^articles', ArticleViewSet)
router.register(r'^comments', CommentViewSet)
router.register(r'^articles/(?P<article_id>\d+)/comments', CommentViewSet)
router.register(r'^articles/(?P<article_id>\d+)/attachments',
                AttachmentViewSet, base_name='article-attachments')

urlpatterns = [
    url(r'^new/$', TemplateView.as_view(
        template_name='articles/edit.html'), name='new'),
    url(r'^edit/(?P<article_id>\d+)/$', article_edit, name='edit'),
    url(r'^list/', TemplateView.as_view(
        template_name='articles/list.html'), name='list'),
    url(r'^detail/(?P<article_id>\d+)/$', article_detail, name='detail'),
]
