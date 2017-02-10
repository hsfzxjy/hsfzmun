from .models import Discussion, Message

from rest_framework import serializers
from files.serializers import AttachmentSerializer
from files.models import Attachment


class DiscussionSerializer(serializers.ModelSerializer):

    avatar_url = serializers.CharField(read_only=True)

    class Meta:
        model = Discussion
        fields = '__all__'


class MessageSerializer(serializers.ModelSerializer):

    attachments = AttachmentSerializer(
        many=True, validators=[], required=False)

    class Meta:
        model = Message
        fields = '__all__'

    def create(self, validated_data):
        attachments = validated_data.pop('attachments', [])

        message = Message.objects.create(**validated_data)

        message.attachments.set(Attachment.objects.filter(pk__in=attachments))

        return message
