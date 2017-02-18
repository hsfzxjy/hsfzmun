profile_views = ('settings', 'security', 'articles')

def dummy():
    from django.utils.translation import gettext as _
    _('settings')
    _('security')
    _('articles')
