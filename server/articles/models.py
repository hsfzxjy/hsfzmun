from django.db import models
from django.conf import settings
from django.urls import reverse

from model_utils.fields import StatusField, MonitorField
from model_utils.models import StatusModel
from model_utils import Choices

from django.db.models.signals import post_save, m2m_changed
from django.dispatch import receiver

from notices.models import Notice
from users.models import User

from language.models import lang_manager, AbstractLanguage


class Article(StatusModel, AbstractLanguage):

    STATUS = Choices('verified', 'pending', 'rejected')

    title = models.CharField(max_length=255)
    content = models.TextField()

    status = StatusField(default='pending')
    published = MonitorField(monitor='status', when=['verified'])
    edited = MonitorField(monitor='content')
    views = models.PositiveIntegerField(default=0)

    author = models.ForeignKey(settings.AUTH_USER_MODEL)

    tags = models.ManyToManyField('Tag', blank=True, related_name='articles')

    mentions = models.ManyToManyField(
        settings.AUTH_USER_MODEL, related_name='mentioned_articles',
        blank=True)

    attachments = models.ManyToManyField('files.Attachment', blank=True)

    objects = lang_manager()

    def reject(self):
        self.status = 'rejected'
        self.save()

        Notice.objects.send(
            self.author,
            'Administrator rejects your article {target.title}.',
            target=self,
            category='verification'
        )

    def accept(self):
        self.status = 'verified'
        self.save()

        Notice.objects.send(
            self.author,
            'Administrator verified your article {target.title}.',
            target=self,
            category='verification'
        )

    def get_absolute_url(self):
        return reverse('articles:detail', kwargs={'article_id': self.id})

    class Meta:
        permissions = [
            ('can_verify', 'Can verify'),
        ]


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
        self.filter(name__in=to_remove)\
            .annotate(acount=models.Count('articles'))\
            .filter(acount__lte=1).delete()
        self.bulk_create(Tag(name=name) for name in to_create)
        return self.filter(name__in=new)


class Tag(models.Model):

    name = models.CharField(max_length=255, unique=True)

    objects = TagQuerySet.as_manager()

    def __str__(self):
        return self.name


class Comment(models.Model):

    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name='posted_replies')
    article = models.ForeignKey('Article')
    content = models.TextField()
    posted = models.DateTimeField(auto_now_add=True)
    reply_to = models.ForeignKey(settings.AUTH_USER_MODEL, null=True)

    def get_absolute_url(self):
        return reverse('articles:detail',
                       kwargs={'article_id': self.article.id})


@receiver(post_save, sender=Article)
def post_verify_notice(sender, instance, created, **kwargs):
    if created and not instance.author.is_verifier:
        Notice.objects.send_bulk(
            User.objects.get_verifiers(),
            '{target.author.nickname} '
            'posts an article {target.title} and requires verification.',
            target=instance,
            category='verification'
        )


@receiver(m2m_changed, sender=Article.mentions.through)
def post_mention_notice(sender, action, pk_set, instance, **kwargs):
    if action == 'post_add':
        Notice.objects.send_bulk(
            instance.mentions.all(),
            '{target.author.nickname} '
            'metions you in article {target.title}.',
            target=instance,
            category='mentions'
        )


@receiver(post_save, sender=Comment)
def post_comment_notice(sender, instance, created, **kwargs):
    if created:
        Notice.objects.send(
            instance.article.author,
            '{target.author} comments your article {target.article.title}.',
            target=instance,
            category='comments'
        )


@receiver(post_save, sender=Comment)
def post_reply_notice(sender, instance, created, **kwargs):
    if created and instance.reply_to is not None:
        Notice.objects.send(
            instance.reply_to,
            '{target.author} replies your comment in article '
            '{target.article.title}.',
            target=instance,
            category='comments'
        )
