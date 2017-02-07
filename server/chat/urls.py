from django.conf.urls import url
from django.views.generic.base import TemplateView

from api.routers import router

from .views import DiscussionViewSet

router.register(r'^discussions', DiscussionViewSet, base_name='discussion')

urlpatterns = [
    url(r'^$', TemplateView.as_view(template_name='chat/index.html'),
        name='index')
]
