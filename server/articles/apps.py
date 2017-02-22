from django.apps import AppConfig
from django.db.models.signals import post_migrate
from django.utils.translation import ugettext_lazy as _

from .management import create_tags


class ArticlesConfig(AppConfig):
    name = 'articles'
    verbose_name = _('articles')

    def ready(self):
        post_migrate.connect(
            create_tags, dispatch_uid='articles.management.create_tags')
