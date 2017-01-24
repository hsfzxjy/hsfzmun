from django.conf.urls import url
from django.views.generic.base import TemplateView

from rest_framework.routers import DefaultRouter

from .views import ArticleViewSet

router = DefaultRouter()
router.register(r'^api/articles', ArticleViewSet)

urlpatterns = router.urls + [
    url(r'^new/$', TemplateView.as_view(
        template_name='articles/edit.html'), name='new'),
]
