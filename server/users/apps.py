from django.apps import AppConfig
from django.db.models.signals import post_migrate
from django.utils.translation import ugettext_lazy as _

from .management import create_groups


class UsersConfig(AppConfig):
    name = 'users'
    verbose_name = _('users')

    def ready(self):
        post_migrate.connect(
            create_groups, dispatch_uid='users.management.create_groups')
