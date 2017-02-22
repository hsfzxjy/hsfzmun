from django.db import models

from django.utils.translation import get_language, gettext as _


class AbstractLanguageQuerySet(models.QuerySet):

    def lang(self, lang_name=None):
        if lang_name is None:
            lang_name = get_language()

        return self.filter(models.Q(lang_code__iexact=lang_name) |
                           models.Q(lang_code__iexact='all'))


class AbstractLanguage(models.Model):

    LANG_CODE_CHOICES = (
        ('en-us', _('English')),
        ('zh-hans', _('Chinese')),
        ('all', _('All')),
    )

    lang_code = models.CharField(_('language code'), max_length=10,
                                 default='all', choices=LANG_CODE_CHOICES)

    class Meta:
        abstract = True


def lang_manager(manager_cls=None):
    if manager_cls is None:
        manager_cls = models.Manager

    class WrappedManager(manager_cls):

        def get_queryset(self):
            return super(WrappedManager, self).get_queryset().lang()

    return WrappedManager.from_queryset(AbstractLanguageQuerySet)


def lang_queryset(queryset_cls=None):
    if queryset_cls is None:
        queryset_cls = models.QuerySet

    class WrappedQuerySet(queryset_cls, AbstractLanguageQuerySet):
        pass

    return WrappedQuerySet
