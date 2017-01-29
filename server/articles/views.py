from django.shortcuts import render, get_object_or_404

from rest_framework.viewsets import ModelViewSet

from .models import Article, Comment
from .serializers import ArticleSerializer, CommentSerializer


class ArticleViewSet(ModelViewSet):

    serializer_class = ArticleSerializer
    queryset = Article.objects.all()


class CommentViewSet(ModelViewSet):

    serializer_class = CommentSerializer
    queryset = Comment.objects.order_by('-posted')

    def get_queryset(self):
        article_id = self.kwargs.get('article_id', '')
        print(article_id)

        return self.queryset.filter(article=article_id) \
            if article_id else self.queryset


def article_detail(request, article_id):

    article = get_object_or_404(Article, pk=article_id)

    return render(request, 'articles/detail.html', {'article': article})
