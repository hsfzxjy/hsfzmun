from django.utils.translation import gettext as _
from django.contrib.auth import update_session_auth_hash

from .models import User
from rest_framework import serializers

from language.serializers import AbstractLanguageSerializer


class PasswordSerializer(serializers.Serializer):

    oldpass = serializers.CharField()
    newpass = serializers.CharField()
    newpass2 = serializers.CharField()

    def validate_oldpass(self, value):
        assert 'request' in self.context
        user = self.context['request'].user

        if not user.check_password(value):
            raise serializers.ValidationError(_('Old password mismatched.'))

        return value

    def validate(self, validated_data):
        newpass, newpass2 = validated_data[
            'newpass'], validated_data['newpass2']

        if newpass != newpass2:
            raise serializers.ValidationError(
                {'newpass2': _('New passwords mismatched.')})

        return validated_data

    def create(self, validated_data):
        assert 'request' in self.context
        request = self.context['request']
        user = request.user

        user.set_password(validated_data['newpass'])
        user.save()

        update_session_auth_hash(request, user)

        return {}


class UserSerializer(AbstractLanguageSerializer):

    avatar_url = serializers.CharField(read_only=True)
    description = serializers.CharField(write_only=True, required=False)
    url = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = ('username', 'nickname', 'id',
                  'avatar_url', 'description', 'url')

    def to_internal_value(self, data):
        if isinstance(data, (int, str)):
            return data

        return super(UserSerializer, self).to_internal_value(data)


def normalize_user(kwargs, field):
    if field in kwargs:
        kwargs[field] = User.objects.get(pk=kwargs[field])
