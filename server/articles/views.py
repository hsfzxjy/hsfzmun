from django.shortcuts import render, get_object_or_404

from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet
from rest_framework.generics import ListAPIView
from rest_framework.decorators import detail_route
from rest_framework.response import Response
from rest_framework.renderers import TemplateHTMLRenderer

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


class ArticleFilterList(ListAPIView):

    serializer_class = ArticleSerializer
    renderer_classes = (TemplateHTMLRenderer,)
    template_name = 'articles/search.html'

    def get_queryset(self):
        keyword = self.request.query_params.get('keyword', '')
        self.keyword = keyword
        return Article.objects.search(keyword)

    def list(self, *args, **kwargs):
        response = super(ArticleFilterList, self).list(*args, **kwargs)
        response.data['keyword'] = self.keyword

        return response


class TagViewSet(ModelViewSet):

    serializer_class = TagSerializer
    queryset = Tag.objects.all()
    permission_classes = ()
    pagination_class = None


class CommentViewSet(ModelViewSet):

    serializer_class = CommentSerializer
    queryset = Comment.objects.order_by('-posted')

    def get_queryset(self):
        article_id = self.kwargs.get('article_id', '')

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
