from django.conf.urls import url
from django.views.generic.base import TemplateView

from rest_framework.routers import DefaultRouter

from .views import ArticleViewSet, article_detail, CommentViewSet

router = DefaultRouter()
router.register(r'^api/articles', ArticleViewSet)
router.register(r'^api/comments', CommentViewSet)

urlpatterns = router.urls + [
    url(r'^new/$', TemplateView.as_view(
        template_name='articles/edit.html'), name='new'),
    url(r'^list/', TemplateView.as_view(
        template_name='articles/list.html'), name='list'),
    url(r'^detail/(?P<article_id>\d+)/$', article_detail, name='detail'),
]
