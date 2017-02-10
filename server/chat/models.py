from users.models import User
from django.db import models

from django.urls import reverse


class Discussion(models.Model):

    name = models.CharField(max_length=255)
    members = models.ManyToManyField(User, related_name='discussions')

    @property
    def channel_group_name(self):
        return 'discussion_{}'.format(self.id)

    def session_name(self, *args, **kwargs):
        return self.channel_group_name

    @property
    def avatar_url(self):
        return reverse('avatar:bg', kwargs={
            'width': 64,
            'height': 64,
            'seed': 'discussion_{}_avatar'.format(self.id)
        })


class MessageQuerySet(models.QuerySet):

    def filter_user(self, user):
        Q = models.Q
        return self.filter(
            Q(sender=user) |
            Q(receiver=user) |
            Q(session_name__in=map(lambda d: d.session_name(),
                                   user.discussions.only('id')))
        )


class Message(models.Model):

    sender = models.ForeignKey(User, related_name='messages_sent')
    receiver = models.ForeignKey(
        User, null=True, related_name='messages_received')
    content = models.TextField(blank=True)
    session_name = models.CharField(max_length=255, db_index=True)
    uid = models.CharField(max_length=255)
    created = models.DateTimeField(auto_now_add=True)

    attachments = models.ManyToManyField('files.Attachment', blank=True)

    class Meta:
        ordering = ('-created',)

    objects = MessageQuerySet.as_manager()
