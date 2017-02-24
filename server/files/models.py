from django.db import models
from .utils import make_file_name

import os.path

image_extensions = ('.gif', '.jpg', '.jpeg', '.gif', '.bmp',
                    '.tiff', '.webp', '.png')


def is_image(file):
    ext = os.path.splitext(file)[1]
    return ext.lower() in image_extensions


def upload_to(instance, name):
    return make_file_name(name)


class Attachment(models.Model):

    file = models.FileField(upload_to=upload_to)
    created = models.DateTimeField(auto_now_add=True)
    is_image = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        self.is_image = is_image(self.file.name)
        return super(Attachment, self).save(*args, **kwargs)

    class Meta:
        ordering = ('-created',)

    @property
    def name(self):
        return os.path.basename(self.file.name)

    @property
    def url(self):
        return self.get_absolute_url()

    def get_absolute_url(self):
        return self.file.url
