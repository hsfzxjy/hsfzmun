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
from django.conf import settings

from django.conf.urls.static import static
from django.views.generic import TemplateView

from .views import index

import panavatar.djangoview
from django.views.decorators.cache import cache_page

avatar_patterns = [
    url(r'^(?P<width>\d+)x(?P<height>\d+).svg$',
        panavatar.djangoview.generate_image_svg, name='bg'),
    url(r'^(?P<width>\d+)x(?P<height>\d+)/(?P<seed>.+).svg$',
        cache_page(60 * 24)(panavatar.djangoview.generate_image_svg),
        name='bg'),
]

urlpatterns = [
    url(r'^$', index, name='index'),
    url(r'^about/$', TemplateView.as_view(template_name='core/about.html'),
        name='about'),
    url(r'^admin/', admin.site.urls),
    url(r'^avatars/', include(avatar_patterns, namespace='avatar')),
    url(r'^lang/', include('language.urls', namespace="language")),
    url(r'^users/', include('users.urls', namespace="users")),
    url(r'^articles/', include('articles.urls', namespace='articles')),
    url(r'^files/', include('files.urls', namespace='files')),
    url(r'^n/', include('notices.urls', namespace='notices')),
    url(r'^chat/', include('chat.urls', namespace='chat')),
    url(r'^api/', include('api.urls', namespace="api")),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
