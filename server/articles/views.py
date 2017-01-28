from django.shortcuts import render, get_object_or_404

from rest_framework.viewsets import ModelViewSet

from .models import Article, Comment
from .serializers import ArticleSerializer, CommentSerializer


class ArticleViewSet(ModelViewSet):

    serializer_class = ArticleSerializer
    queryset = Article.objects.all()


class CommentViewSet(ModelViewSet):

    serializer_class = CommentSerializer
    queryset = Comment.objects.all()


def article_detail(request, article_id):

    article = get_object_or_404(Article, pk=article_id)

    return render(request, 'articles/detail.html', {'article': article})
