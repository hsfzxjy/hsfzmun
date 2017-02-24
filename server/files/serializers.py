from rest_framework import serializers

from .models import Attachment


class AttachmentSerializer(serializers.ModelSerializer):

    name = serializers.CharField(read_only=True)
    url = serializers.CharField(read_only=True)
    file = serializers.FileField(write_only=True)

    class Meta:
        model = Attachment
        #exclude = ('file',)
        fields = '__all__'

    def to_internal_value(self, data):
        if isinstance(data, (int, str)):
            return int(data)

        return super(AttachmentSerializer, self).to_internal_value(data)
