from django.shortcuts import get_object_or_404

from django.db import models
from django.urls import reverse
from django.utils.html import format_html
from django.utils.translation import gettext as _, override

from django.contrib.auth.models import BaseUserManager, \
    AbstractBaseUser, PermissionsMixin, Permission, Group

from language.models import lang_manager, AbstractLanguage


def get_group(name):
    with override('zh-hans'):
        return get_object_or_404(Group, name=_(name))


class UserManager(BaseUserManager):

    def create_user(self, username, nickname, password=None):
        user = self.model(
            username=username,
            nickname=nickname
        )

        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, nickname, password=None):
        user = self.model(
            username=username,
            nickname=nickname
        )

        user.is_superuser = True
        user.set_password(password)
        user.save(using=self._db)
        return user

    def get_verifiers(self):
        Q = models.Q
        perm = Permission.objects.get(codename='can_verify')
        return User.objects.filter(
            Q(groups__permissions=perm) |
            Q(user_permissions=perm) | Q(is_superuser=True) |
            Q(is_admin=True)).distinct()


class User(AbstractBaseUser, AbstractLanguage, PermissionsMixin):
    username = models.CharField(
        _('user name'),
        max_length=255,
        unique=True,
    )
    nickname = models.CharField(
        _('nick name'),
        max_length=255,
        unique=True,
    )
    description = models.TextField(_('description'), blank=True)
    is_active = models.BooleanField(_('active'), default=True)
    is_admin = models.BooleanField(_('is_admin'), default=False)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['nickname']

    objects = UserManager()
    lang_objects = lang_manager(UserManager)()

    def get_absolute_url(self):
        return reverse('users:profile', kwargs=dict(username=self.username))

    def user_tag(self):
        return format_html('<a href="{}">{}</a>',
                           self.get_absolute_url(), self.nickname)

    def get_full_name(self):
        return self.nickname

    def get_short_name(self):
        return self.nickname

    def __str__(self):
        return self.nickname

    @property
    def is_staff(self):
        return self.is_superuser or self.is_admin

    @property
    def is_verifier(self):
        return self.has_perm('articles.can_verify')

    @property
    def channel_group_name(self):
        return 'user_{}'.format(self.id)

    def session_name(self, chat_with):
        return 'user_{}_{}'.format(*sorted([self.id, chat_with.id]))

    @property
    def avatar_url(self):
        return reverse('avatar:bg', kwargs={
            'width': 48,
            'height': 48,
            'seed': 'user_{}_avatar'.format(self.id)
        })

    @property
    def initial_password(self):
        import hashlib

        return hashlib.sha224(self.username.encode('utf8')).hexdigest()[:8]

    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')
