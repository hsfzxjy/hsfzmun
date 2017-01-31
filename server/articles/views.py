from django.shortcuts import render, get_object_or_404

from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet
from rest_framework.decorators import detail_route
from rest_framework.response import Response

from .models import Article, Comment, Tag
from .serializers import ArticleSerializer, CommentSerializer, TagSerializer
from files.serializers import AttachmentSerializer


class ArticleViewSet(ModelViewSet):

    serializer_class = ArticleSerializer
    queryset = Article.objects.all()

    @detail_route(methods=['POST'])
    def accept(self, *args, **kwargs):
        self.get_object().accept()

        return Response('OK')

    @detail_route(methods=['POST'])
    def reject(self, *args, **kwargs):
        self.get_object().reject()

        return Response('OK')


class TagViewSet(ModelViewSet):

    serializer_class = TagSerializer
    queryset = Tag.objects.all()
    pagination_class = None


class CommentViewSet(ModelViewSet):

    serializer_class = CommentSerializer
    queryset = Comment.objects.order_by('-posted')

    def get_queryset(self):
        article_id = self.kwargs.get('article_id', '')
        print(article_id)

        return self.queryset.filter(article=article_id) \
            if article_id else self.queryset


class AttachmentViewSet(ReadOnlyModelViewSet):

    serializer_class = AttachmentSerializer
    pagination_class = None

    def get_queryset(self):
        article = get_object_or_404(Article, pk=self.kwargs['article_id'])

        return article.attachments.all()


def article_detail(request, article_id):

    article = get_object_or_404(Article, pk=article_id)

    return render(request, 'articles/detail.html', {'article': article})


def article_edit(request, article_id):

    article = get_object_or_404(Article, pk=article_id)

    return render(request, 'articles/edit.html', {'article': article})
