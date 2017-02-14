from django.apps import apps
from django.conf import settings
from django.utils.translation import override, gettext as _


def dummy():
    _('Instant Messages')
    _('Conference Files')
    _('Agreements & Treaties')
    _('Brief News')
    _('News')
    _('Reviews')
    _('Declaration')


tags_to_create = {'Instant Messages', 'Conference Files',
                  'Agreements & Treaties', 'Brief News',
                  'Reviews', 'Declaration'}


def create_tags(app_config, **kwargs):
    if not app_config.models_module:
        return

    try:
        Tag = apps.get_model('articles', 'Tag')
    except LookupError:
        return

    for lang_code, x in settings.LANGUAGES:
        with override(lang_code):
            created = Tag.objects.filter(name__in=map(
                _, tags_to_create)).values_list('slug', flat=True)
            to_create = [
                Tag(name=_(s), slug=s, lang_code=lang_code)
                for s in tags_to_create - set(created)
            ]
            Tag.objects.bulk_create(to_create)
