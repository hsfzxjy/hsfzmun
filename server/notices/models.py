from django.db import models
from django.conf import settings

from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType


class NoticeQuerySet(models.QuerySet):

    def send(self, receiver, tmpl, *args, **kwargs):
        target = kwargs.get('target', None)
        url = kwargs.get('url', None)
        category = kwargs.get('category', '')

        if url is None:
            url = target.get_absolute_url()

        notice = Notice(receiver=receiver, target=target,
                        url=url, category=category)

        kwargs.update({'receiver': receiver, 'target': target})
        notice.message = tmpl.format(*args, **kwargs)
        notice.save()

        return notice

    def send_bulk(self, receivers, *args, **kwargs):
        results = [
            self.send(receiver, *args, **kwargs)
            for receiver in receivers
        ]

        return results

    def categories(self):
        return self.values_list('category', flat=True).distinct()


class Notice(models.Model):

    receiver = models.ForeignKey(settings.AUTH_USER_MODEL,
                                 related_name='received_notices')

    target_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    target_id = models.PositiveIntegerField()
    target = GenericForeignKey('target_type', 'target_id')

    created = models.DateTimeField(auto_now_add=True)
    has_read = models.BooleanField(default=False)

    message = models.TextField()

    url = models.URLField()
    category = models.CharField(max_length=255)

    objects = NoticeQuerySet.as_manager()

    def mark_as_read(self):
        self.has_read = True
        self.save()
