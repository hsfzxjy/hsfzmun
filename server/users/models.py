from django.db import models

from django.contrib.auth.models import BaseUserManager, \
    AbstractBaseUser, PermissionsMixin, Permission


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
            Q(user_permissions=perm) | Q(is_superuser=True)).distinct()


class User(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(
        verbose_name='user name',
        max_length=255,
        unique=True,
    )
    nickname = models.CharField(
        verbose_name='nick name',
        max_length=255,
        unique=True,
    )
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['nickname']

    objects = UserManager()

    def get_full_name(self):
        return self.nickname

    def get_short_name(self):
        return self.nickname

    def __str__(self):
        return self.nickname

    @property
    def is_staff(self):
        return True

    @property
    def is_verifier(self):
        return self.has_perm('articles.can_verify')
