from django.db import models
from django.conf import settings
from django.urls import reverse
from django.utils.translation import ugettext as _
from django.utils.html import format_html

from model_utils.fields import StatusField, MonitorField
from model_utils.models import StatusModel
from model_utils import Choices

from django.db.models.signals import post_save, m2m_changed
from django.dispatch import receiver

from notices.models import Notice
from users.models import User

from language.models import lang_manager, AbstractLanguage, lang_queryset

import re

Q = models.Q


class ArticleQuerySet(models.QuerySet):

    def search(self, keyword, empty_when_blank=True):
        if not keyword:
            return self.none() if empty_when_blank else self

        args = {s for s in re.split(r'[\s,]+', keyword) if s}

        query = Q()

        users = set(filter(lambda s: s.startswith('user:'), args))
        args -= users

        usernames = []

        for arg in users:
            username = arg.split(':', 1)[1]

            if username:
                usernames.append(username)

        if usernames:
            query &= Q(author__username__in=usernames)

        tags = set(filter(lambda s: s.startswith('tag:'), args))
        args -= tags

        tagnames = []

        for arg in tags:
            tag = arg.split(':', 1)[1]

            if tag:
                tagnames.append(tag)

        if tagnames:
            query &= Q(tags__name__in=tagnames)

        slugs = set(filter(lambda s: s.startswith('slug:'), args))
        args -= slugs

        slugnames = []

        for arg in slugs:
            slug = arg.split(':', 1)[1]

            if slug:
                slugnames.append(slug)

        if slugnames:
            query &= Q(tags__slug__in=slugnames)

        if args:
            regex = '(%s)' % '|'.join(args)
            query &= Q(title__iregex=regex) | Q(content__iregex=regex)
        print(query, keyword)
        return self.filter(query)

    def verified(self):
        return self.filter(status='verified')


class Article(StatusModel, AbstractLanguage):

    STATUS = Choices('verified', 'pending', 'rejected')

    title = models.CharField(max_length=255)
    content = models.TextField(blank=True)

    status = StatusField(default='pending')
    published = MonitorField(monitor='status', when=['verified'])
    edited = MonitorField(monitor='content')

    author = models.ForeignKey(settings.AUTH_USER_MODEL)

    tags = models.ManyToManyField('Tag', blank=True, related_name='articles')

    mentions = models.ManyToManyField(
        settings.AUTH_USER_MODEL, related_name='mentioned_articles',
        blank=True)

    attachments = models.ManyToManyField('files.Attachment', blank=True)

    is_article = models.BooleanField()

    objects = ArticleQuerySet.as_manager()
    lang_objects = lang_queryset(ArticleQuerySet).as_manager()

    def reject(self):
        self.status = 'rejected'
        self.save()

        Notice.objects.send(
            self.author,
            _('Administrator rejects your article {target.title}.'),
            target=self,
            category='verification',
            keyword=('article', 'reject', self.id)
        )

    def accept(self):
        self.status = 'verified'
        self.save()

        Notice.objects.send(
            self.author,
            _('Administrator verified your article {target.title}.'),
            target=self,
            category='verification',
            keyword=('article', 'verify', self.id)
        )

    def save(self, *args, **kwargs):
        self.is_article = bool(self.content)
        return super(Article, self).save(*args, **kwargs)

    def get_absolute_url(self):
        return reverse('articles:detail', kwargs={'article_id': self.id})

    def article_tag(self):
        if self.is_article:
            return format_html('''<a href="#{}">{}</a>''',
                               self.get_absolute_url(), self.title)
        else:
            return self.title

    class Meta:
        permissions = [
            ('can_verify', 'Can verify'),
        ]
        ordering = ('-published', '-edited')


class TagQuerySet(models.QuerySet):

    def deletable(self):
        return self.filter(slug='')

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
            .filter(acount__lte=1).deletable().delete()
        self.bulk_create(Tag(name=name) for name in to_create)
        return self.filter(name__in=new)


class Tag(AbstractLanguage):

    name = models.CharField(max_length=255, unique=True)
    slug = models.CharField(max_length=255)

    objects = TagQuerySet.as_manager()
    lang_objects = lang_queryset(TagQuerySet).as_manager()

    def __str__(self):
        return self.name


class Comment(models.Model):

    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name='posted_replies')
    article = models.ForeignKey('Article')
    content = models.TextField()
    posted = models.DateTimeField(auto_now_add=True)
    reply_to = models.ForeignKey(settings.AUTH_USER_MODEL, null=True)

    class Meta:
        ordering = ('-posted',)

    def get_absolute_url(self):
        return reverse('articles:detail',
                       kwargs={'article_id': self.article.id})


@receiver(post_save, sender=Article)
def post_verify_notice(sender, instance, created, **kwargs):
    if created and not instance.author.is_verifier:
        Notice.objects.send_bulk(
            User.objects.get_verifiers(),
            _('{target.author.nickname} '
              'posts an article {target.title} and requires verification.'),
            target=instance,
            category='verification'
        )


@receiver(m2m_changed, sender=Article.mentions.through)
def post_mention_notice(sender, action, pk_set, instance, **kwargs):
    if action == 'post_add':
        Notice.objects.send_bulk(
            instance.mentions.all(),
            _('{target.author.nickname} '
              'metions you in article {target.title}.'),
            target=instance,
            category='mentions'
        )


@receiver(post_save, sender=Comment)
def post_comment_notice(sender, instance, created, **kwargs):
    if created and instance.author.id != instance.article.author.id:
        Notice.objects.send(
            instance.article.author,
            _('{target.author.nickname} comments your '
                'article {target.article.title}.'),
            target=instance,
            category='comments',
            keyword=('comment', 'create', instance.article, instance.author)
        )


@receiver(post_save, sender=Comment)
def post_reply_notice(sender, instance, created, **kwargs):
    if created and instance.reply_to is not None \
            and instance.reply_to.id != instance.author.id:
        Notice.objects.send(
            instance.reply_to,
            _('{target.author.nickname} replies your comment in article '
              '{target.article.title}.'),
            target=instance,
            category='comments',
            keyword=('comment', 'reply', instance.author,
                     instance.reply_to, instance.article)
        )


def dummy():
    _('mentions')
    _('verification')
    _('comments')
    _('all')
