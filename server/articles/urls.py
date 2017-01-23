from django.conf.urls import url
from django.views.generic.base import TemplateView

urlpatterns = [
    url(r'^new/$', TemplateView.as_view(
        template_name='articles/edit.html'), name='new'),
]
