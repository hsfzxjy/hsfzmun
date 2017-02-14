from django.db import models

from django.utils.translation import get_language


class AbstractLanguageQuerySet(models.QuerySet):

    def lang(self, lang_name=None):
        if lang_name is None:
            lang_name = get_language()

        return self.filter(models.Q(lang_code__iexact=lang_name) |
                           models.Q(lang_code__iexact='all'))


class AbstractLanguage(models.Model):

    lang_code = models.CharField(max_length=10, default='all')

    class Meta:
        abstract = True


def lang_manager(manager_cls=None):
    if manager_cls is None:
        manager_cls = models.Manager

    class WrappedManager(manager_cls):

        def get_queryset(self):
            return super(WrappedManager, self).get_queryset().lang()

    return WrappedManager.from_queryset(AbstractLanguageQuerySet)
