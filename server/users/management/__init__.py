from django.apps import apps
from django.utils.translation import override, gettext as _


def dummy():
    _('Verifiers')


groups_to_create = {'Verifiers': ['can_verify']}


def create_groups(app_config, **kwargs):
    if not app_config.models_module:
        return

    try:
        Permission = apps.get_model('auth', 'Permission')
        Group = apps.get_model('auth', 'Group')
    except LookupError:
        print('Lookup Error')
        return

    with override('zh-hans'):
        for name, perms_codename in groups_to_create.items():
            verbose_name = _(name)
            group, c_ = Group.objects.get_or_create(name=verbose_name)
            group.permissions.set(Permission.objects.filter(
                codename__in=perms_codename))
