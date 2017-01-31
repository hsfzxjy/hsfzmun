from django.conf.urls import url

from .views import NoticeList, NoticeViewSet

from api.routers import router

router.register(r'^notices', NoticeViewSet, base_name='notice')

urlpatterns = [
    url(r'^$', NoticeList.as_view(), name='list')
]
