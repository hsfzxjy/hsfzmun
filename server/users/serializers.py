from .models import User
from rest_framework import serializers


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ('username', 'nickname', 'id')

    def to_internal_value(self, data):
        if isinstance(data, (int, str)):
            return data

        return super(UserSerializer, self).to_internal_value(data)


def normalize_user(kwargs, field):
    if field in kwargs:
        kwargs[field] = User.objects.get(pk=kwargs[field])
