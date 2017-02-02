from rest_framework.serializers import ModelSerializer
from django.utils.translation import get_language


class AbstractLanguageSerializer(ModelSerializer):

    def __init__(self, *args, **kwargs):
        super(AbstractLanguageSerializer, self).__init__(*args, **kwargs)

        if hasattr(self, 'initial_data') \
                and isinstance(self.initial_data, dict) \
                and 'lang_code' not in self.initial_data:

            self.initial_data['lang_code'] = get_language()
