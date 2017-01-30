from rest_framework import serializers
from .models import Article, Tag, Comment

from files.models import Attachment
from users.models import User
from files.serializers import AttachmentSerializer
from users.serializers import UserSerializer


class TagSerializer(serializers.ModelSerializer):

    name = serializers.CharField()

    class Meta:
        model = Tag
        fields = ['name']

    def to_internal_value(self, data):
        if isinstance(data, (int, str)):
            return data

        return super(TagSerializer, self).to_internal_value(data)


class ArticleSerializer(serializers.ModelSerializer):

    tags = TagSerializer(many=True)
    attachments = AttachmentSerializer(
        many=True, validators=[], required=False)
    mentions = UserSerializer(many=True, validators=[], required=False)
    url = serializers.CharField(source='get_absolute_url', read_only=True)

    def create(self, validated_data):
        tag_list = validated_data.pop('tags', [])
        attachments = validated_data.pop('attachments', [])
        mentions = validated_data.pop('mentions', [])

        article = Article.objects.create(**validated_data)

        article.tags.add(*Tag.objects.create_from_list(tag_list))
        article.attachments.set(Attachment.objects.filter(
            pk__in=attachments))
        article.mentions.set(User.objects.filter(
            nickname__in=mentions).only('id'), bulk=True)

        return article

    def update(self, instance, validated_data):
        tag_list = validated_data.pop('tags', [])
        attachments = validated_data.pop('attachments', [])
        old_tags = instance.tags.values_list('name', flat=True)

        article = super(ArticleSerializer, self).update(
            instance, validated_data)

        article.tags.set(Tag.objects.update_from_list(
            old_tags, tag_list), clear=True)
        article.attachments.set(Attachment.objects.filter(
            pk__in=attachments))

        return article

    class Meta:
        model = Article
        fields = '__all__'


class CommentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Comment
        fields = '__all__'
