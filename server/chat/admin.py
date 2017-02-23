from django.contrib import admin

from .models import Discussion
from users.models import User

from django import forms
from django.utils.translation import ugettext as _


class DiscussionAdminForm(forms.ModelForm):

    members = forms.ModelMultipleChoiceField(
        User.objects.all(),
        label=_('members'),
        widget=admin.widgets.FilteredSelectMultiple(_('members'), False),
        required=False
    )

    def __init__(self, *args, **kwargs):
        super(DiscussionAdminForm, self).__init__(*args, **kwargs)
        if self.instance.pk:
            self.initial['members'] = self.instance.members.values_list(
                'pk', flat=True)

    def save(self, *args, **kwargs):
        instance = super(DiscussionAdminForm, self).save(*args, **kwargs)
        if instance.pk:
            instance.members.clear()
            instance.members.add(*self.cleaned_data['members'])
        return instance


@admin.register(Discussion)
class DiscussionAdmin(admin.ModelAdmin):

    form = DiscussionAdminForm
