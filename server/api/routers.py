from rest_framework.routers import DefaultRouter

router = DefaultRouter()

urlpatterns = []


def add_urlpattern(urlpattern):
    urlpatterns.append(urlpattern)
