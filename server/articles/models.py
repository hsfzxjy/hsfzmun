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

    tags = models.ManyToManyField('Tag', blank=True, related_name='articles')


class TagQuerySet(models.QuerySet):

    def existed(self, tag_list):
        return self.filter(name__in=tag_list).values_list('name', flat=True)

    def create_from_list(self, tag_list):
        existed = self.existed(tag_list)
        to_create = set(tag_list) - set(existed)
        self.bulk_create(Tag(name=name) for name in to_create)
        return self.filter(name__in=tag_list)

    def update_from_list(self, old, new):
        old, new = set(old), set(new)
        to_remove, to_create = old - new, new - old - set(self.existed(new))
        self.filter(name__in=to_remove, articles__count=0).delete()
        self.bulk_create(Tag(name=name) for name in to_create)
        return self.filter(name__in=new)


class Tag(models.Model):

    name = models.CharField(max_length=255, unique=True)

    objects = TagQuerySet.as_manager()


class Comment(models.Model):

    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name='posted_replies')
    article = models.ForeignKey('Article')
    content = models.TextField()
    posted = models.DateTimeField(auto_now_add=True)
    reply_to = models.ForeignKey(settings.AUTH_USER_MODEL, null=True)
