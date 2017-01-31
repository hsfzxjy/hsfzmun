from rest_framework import serializers

from .models import Notice


class NoticeSerializer(serializers.ModelSerializer):

    class Meta:
        exclude = ('receiver', 'target_type', 'target_id')
        model = Notice
