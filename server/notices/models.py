from django.db import models
from django.conf import settings

from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType


class Notice(models.Model):

    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='received_notices')
    actor = models.ForeignKey(settings.AUTH_USER_MODEL)
    action = models.CharField(max_length=100)

    target_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    target_id = models.PositiveIntegerField()
    target = GenericForeignKey('target_type', 'target_id')

    created = models.DateTimeField(auto_now_add=True)
    has_read = models.BooleanField(default=False)
