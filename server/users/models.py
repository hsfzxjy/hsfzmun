from django.db import models

from django.contrib.auth.models import BaseUserManager, AbstractBaseUser, Group


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

        user.is_admin = True
        user.set_password(password)
        user.save(using=self._db)
        return user


class User(AbstractBaseUser):
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
    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)

    groups = models.ManyToManyField(Group)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['nickname']

    objects = UserManager()

    def get_full_name(self):
        return self.nickname

    def get_short_name(self):
        return self.nickname

    def __str__(self):
        return self.nickname

    def has_perm(self, perm, obj=None):
        return True

    def has_module_perms(self, app_label):
        return True

    @property
    def is_staff(self):
        return self.is_admin
