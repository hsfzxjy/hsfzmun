def get_profile_views(request, user):
    current = request.user

    results = ['articles']

    if current.has_perm('users.change_user', user):
        results.extend(['settings', 'security'])
    if current.has_perm('is_admin'):
        results.append('admin')

    return results


def dummy():
    from django.utils.translation import gettext as _
    _('settings')
    _('security')
    _('articles')
    _('admin')
