# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-02-23 11:13
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0011_auto_20170222_1826'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='is_active',
            field=models.BooleanField(default=True, verbose_name='状态'),
        ),
    ]
