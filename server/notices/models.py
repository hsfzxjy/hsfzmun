from django.db import models
from django.conf import settings

from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

from django.utils import timezone

from .consumers import send_unread


def make_keyword(args):
    args = map(str, (arg.id if isinstance(
        arg, models.Model) else arg for arg in args))
    return '_'.join(args)


class NoticeQuerySet(models.QuerySet):

    def send(self, receiver, tmpl, *args, **kwargs):
        keyword = make_keyword(kwargs.pop('keyword', []))

        if keyword:
            affected = self.filter(keyword=keyword, receiver=receiver)\
                .update(has_read=False, created=timezone.now())

            if affected:
                return

        target = kwargs.get('target', None)
        url = kwargs.get('url', None)
        category = kwargs.get('category', '')

        if url is None:
            url = target.get_absolute_url()

        notice = Notice(receiver=receiver, target=target,
                        url=url, category=category, keyword=keyword)

        kwargs.update({'receiver': receiver, 'target': target})
        notice.message = tmpl.format(*args, **kwargs)
        notice.save()

        send_unread(receiver)

        return notice

    def send_bulk(self, receivers, *args, **kwargs):
        results = [
            self.send(receiver, *args, **kwargs)
            for receiver in receivers
        ]

        return results

    def categories(self):
        return self.order_by().values_list('category', flat=True).distinct()

    def mark_all_as_read(self, category='all'):
        qs = self
        if category != 'all':
            qs = qs.filter(category=category)

        qs.update(has_read=True)

        return qs


class Notice(models.Model):

    receiver = models.ForeignKey(settings.AUTH_USER_MODEL,
                                 related_name='received_notices')

    target_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    target_id = models.PositiveIntegerField()
    target = GenericForeignKey('target_type', 'target_id')

    created = models.DateTimeField(auto_now_add=True)
    has_read = models.BooleanField(default=False)

    message = models.TextField()
    keyword = models.CharField(max_length=255)

    url = models.URLField()
    category = models.CharField(max_length=255)

    objects = NoticeQuerySet.as_manager()

    def mark_as_read(self):
        self.has_read = True
        self.save()
        send_unread(self.receiver)

    class Meta:
        ordering = ('has_read', '-created')
