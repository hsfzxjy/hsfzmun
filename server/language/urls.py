from django.conf.urls import url

from .views import set_language

urlpatterns = [
    url(r'^set/(?P<lang_code>[a-zA-Z\-]+)/$', set_language, name='set')
]
