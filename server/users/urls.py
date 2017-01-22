from django.conf.urls import url
from django.contrib.auth.views import login, logout

from rest_framework.routers import DefaultRouter
from .views import UserViewSet, profile, my_profile

router = DefaultRouter()
router.register(r'a', UserViewSet)

urlpatterns = router.urls + [
    url(r'^login/$', login, name='login'),
    url(r'^logout/$', logout, name='logout'),
    url(r'^profile/$', my_profile, name='my-profile'),
    url(r'^profile/(?P<username>[\d\w_-]+)/$', profile, name='my-profile')
]
