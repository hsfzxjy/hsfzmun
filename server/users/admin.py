from django import forms
from django.urls import reverse
from django.shortcuts import redirect
from django.contrib import messages
from django.utils.translation import gettext as _
from django.contrib import admin
from django.contrib.auth.models import Group
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin, GroupAdmin

from django_object_actions import DjangoObjectActions

from .models import User, get_group


class UserCreationForm(forms.ModelForm):
    """A form for creating new users. Includes all the required
    fields, plus a repeated password."""
    password1 = forms.CharField(label=_('Password'),
                                widget=forms.PasswordInput)
    password2 = forms.CharField(
        label=_('Password confirmation'), widget=forms.PasswordInput)

    class Meta:
        model = User
        fields = ('username', 'nickname', 'lang_code')

    def clean_password2(self):
        # Check that the two password entries match
        password1 = self.cleaned_data.get("password1")
        password2 = self.cleaned_data.get("password2")
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError("Passwords don't match")
        return password2

    def save(self, commit=True):
        # Save the provided password in hashed format
        user = super(UserCreationForm, self).save(commit=False)
        user.set_password(self.cleaned_data["password1"])
        if commit:
            user.save()
        return user


class UserChangeForm(forms.ModelForm):
    """A form for updating users. Includes all the fields on
    the user, but replaces the password field with admin's
    password hash display field.
    """

    class Meta:
        model = User
        fields = ('username', 'nickname',
                  'is_active', 'is_superuser')


@admin.register(User)
class UserAdmin(DjangoObjectActions, BaseUserAdmin):
    form = UserChangeForm
    add_form = UserCreationForm

    list_display = ('username', 'nickname', 'is_superuser', 'is_admin')
    list_filter = ('is_superuser',)
    fieldsets = (
        (None, {'fields': ('username', 'nickname',)}),
        (_('Permissions'), {'fields': ('is_superuser', 'is_admin', )}),
        (_('Profile'), {'fields': ('description',)})
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'nickname',
                       'password1', 'password2', 'lang_code', )}
         ),
        (_('Permissions'), {
            'fields': ('is_superuser', 'is_admin')
        })
    )
    search_fields = ('nickname',)
    ordering = ('nickname',)
    filter_horizontal = ()

    def reset_password(self, request, obj):
        obj.set_password(obj.initial_password)
        obj.save()

        messages.info(request, _('Password has reset to {}').format(
            obj.initial_password))

    reset_password.label = _('reset password')

    def set_verifiers(self, request, obj):
        return redirect(
            reverse('admin:auth_group_change',
                    args=(get_group('Verifiers').pk,))
        )

    set_verifiers.label = _('set verifiers')

    change_actions = ['reset_password', 'set_verifiers']
    changelist_actions = ['set_verifiers']


admin.site.unregister(Group)


class GroupAdminForm(forms.ModelForm):

    users = forms.ModelMultipleChoiceField(
        User.objects.all(),
        label=_('users'),
        widget=admin.widgets.FilteredSelectMultiple(_('users'), False),
        required=False
    )

    def __init__(self, *args, **kwargs):
        super(GroupAdminForm, self).__init__(*args, **kwargs)
        if self.instance.pk:
            self.initial['users'] = self.instance.user_set.values_list(
                'pk', flat=True)

    def save(self, *args, **kwargs):
        instance = super(GroupAdminForm, self).save(*args, **kwargs)
        if instance.pk:
            instance.user_set.clear()
            instance.user_set.add(*self.cleaned_data['users'])
        return instance


@admin.register(Group)
class GroupAdmin(GroupAdmin):

    form = GroupAdminForm

    exclude = ('permissions', 'name')
