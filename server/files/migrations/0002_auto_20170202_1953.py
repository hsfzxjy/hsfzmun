# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-02-02 11:53
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('files', '0001_initial'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='attachment',
            options={'ordering': ('-created',)},
        ),
    ]
