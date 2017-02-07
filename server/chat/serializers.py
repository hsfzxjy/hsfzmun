from .models import Discussion

from rest_framework import serializers


class DiscussionSerializer(serializers.ModelSerializer):

    avatar_url = serializers.CharField(read_only=True)

    class Meta:
        model = Discussion
        fields = '__all__'
