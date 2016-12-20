from django.db import models
from django.conf import settings

from model_utils.fields import StatusField, MonitorField
from model_utils.models import StatusModel
from model_utils import Choices


class Article(StatusModel):

    STATUS = Choices('verified', 'pending', 'rejected')

    title = models.CharField(max_length=255)
    content = models.TextField()

    status = StatusField(default='pending')
    published = MonitorField(monitor='status', when=['published'])
    edited = MonitorField(monitor='content')
    views = models.PositiveIntegerField(default=0)

    author = models.ForeignKey(settings.AUTH_USER_MODEL)

    tags = models.ManyToManyField('Tag')


class Tag(models.Model):

    name = models.CharField(max_length=255)


class Reply(models.Model):

    author = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='posted_replies')
    article = models.ForeignKey('Article')
    content = models.TextField()
    posted = models.DateTimeField(auto_now_add=True)
    reply_to = models.ForeignKey(settings.AUTH_USER_MODEL, null=True)
