from django.conf.urls import url
from django.views.generic.base import TemplateView
from django.contrib.auth.decorators import login_required

from api.routers import router, add_urlpattern

from .views import DiscussionViewSet, UnreadMessagesList, HistoryMessagesList,\
    unread_count

router.register(r'^discussions', DiscussionViewSet, base_name='discussion')
add_urlpattern(url(r'^messages/unread/$', UnreadMessagesList.as_view(),
                   name='unread-messages'))
add_urlpattern(url(r'^messages/history/$',
                   HistoryMessagesList.as_view(), name='history-messages'))
add_urlpattern(url(r'^messages/unread/count/$',
                   unread_count, name='unread-count'))

urlpatterns = [
    url(r'^$', login_required(
        TemplateView.as_view(template_name='chat/index.html')), name='index')
]
