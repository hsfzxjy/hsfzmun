from django.conf.urls import url
from django.contrib.auth.views import login, logout

from api.routers import router, add_urlpattern
from .views import (UserViewSet, profile, my_profile,
                    user_nicknames, UserBulkCreationView, change_password)

router.register(r'users', UserViewSet)

add_urlpattern(
    url(r'^user_nicknames/$', user_nicknames, name='user-nicknames'))
add_urlpattern(
    url(r'^change_password/$', change_password, name='change-password'))

urlpatterns = [
    url(r'^login/$', login, name='login'),
    url(r'^logout/$', logout, name='logout'),
    url(r'^bulk-creation/$',
        UserBulkCreationView.as_view(), name='bulk-create'),
    url(r'^profile/$', my_profile, name='my-profile'),
    url(r'^profile/(?P<username>[\d\w_-]+)/$', profile, name='profile')
]
