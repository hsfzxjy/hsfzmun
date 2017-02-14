"""hsfzmun URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.10/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url, include
from django.contrib import admin
from django.views.generic.base import TemplateView
from django.conf import settings

from django.conf.urls.static import static

urlpatterns = [
    url(r'^$', TemplateView.as_view(template_name='core/index.html'),
        name='index'),
    url(r'^admin/', admin.site.urls),
    url(r'^avatars/', include('panavatar.urls', namespace='avatar')),
    url(r'^lang/', include('language.urls', namespace="language")),
    url(r'^users/', include('users.urls', namespace="users")),
    url(r'^articles/', include('articles.urls', namespace='articles')),
    url(r'^files/', include('files.urls', namespace='files')),
    url(r'^n/', include('notices.urls', namespace='notices')),
    url(r'^chat/', include('chat.urls', namespace='chat')),
    url(r'^api/', include('api.urls', namespace="api")),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
