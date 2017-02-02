from django.db import models
from .utils import make_file_name

import os.path


def upload_to(instance, name):
    return make_file_name(name)


class Attachment(models.Model):

    file = models.FileField(upload_to=upload_to)
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-created',)

    @property
    def name(self):
        return os.path.basename(self.file.name)
