from django.conf.urls import url

from .views import upload_image, AttachmentViewSet
from api.routers import router

router.register(r'^attachments', AttachmentViewSet)

urlpatterns = [
    url(r'^image/$', upload_image, name='upload-image'),
]
