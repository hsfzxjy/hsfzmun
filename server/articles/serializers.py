from rest_framework import serializers
from .models import Article, Tag, Comment

from operator import itemgetter


class TagSerializer(serializers.ModelSerializer):

    name = serializers.CharField()

    class Meta:
        model = Tag
        fields = ['name']

    def validate(self, data):
        return data


class ArticleSerializer(serializers.ModelSerializer):

    tags = TagSerializer(many=True)

    def validate_tags(self, value):
        return value

    def create(self, validated_data):
        tag_list = list(
            map(itemgetter('name'), validated_data.pop('tags', []))
        )
        article = Article.objects.create(**validated_data)
        article.tags.add(*Tag.objects.create_from_list(tag_list))

        return article

    class Meta:
        model = Article
        fields = '__all__'


class CommentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Comment
        fields = '__all__'
