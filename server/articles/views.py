from django.shortcuts import render, get_object_or_404

from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet, GenericViewSet
from rest_framework.mixins import RetrieveModelMixin
from rest_framework.generics import ListAPIView
from rest_framework.decorators import detail_route
from rest_framework.response import Response
from rest_framework.renderers import TemplateHTMLRenderer

from .models import Article, Comment, Tag
from .serializers import ArticleSerializer, CommentSerializer, TagSerializer
from files.serializers import AttachmentSerializer


class UserArticleList(ListAPIView):

    serializer_class = ArticleSerializer
    permission_classes = ()

    def get_queryset(self):
        username = self.kwargs.get('username', '')
        qs = Article.objects.filter(author__username=username)
        user = self.request.user
        if not (user.is_authenticated() and user.username == username):
            qs = qs.verified()

        return qs


class SearchViewMixin(object):

    empty_when_blank = True
    permission_classes = ()

    def get_queryset(self):
        keyword = self.request.query_params.get('keyword', '')
        self.keyword = keyword
        return Article.objects.search(
            keyword,
            empty_when_blank=self.empty_when_blank).verified()


class ArticleViewSet(SearchViewMixin, ModelViewSet):

    serializer_class = ArticleSerializer
    queryset = Article.objects.all()

    empty_when_blank = False


class ArticleVerificationViewSet(RetrieveModelMixin, GenericViewSet):

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


class ArticleFilterList(SearchViewMixin, ListAPIView):

    serializer_class = ArticleSerializer
    renderer_classes = (TemplateHTMLRenderer,)
    template_name = 'articles/search.html'

    def list(self, *args, **kwargs):
        response = super(ArticleFilterList, self).list(*args, **kwargs)
        response.data['keyword'] = self.keyword

        return response


class TagViewSet(ModelViewSet):

    serializer_class = TagSerializer
    queryset = Tag.lang_objects.all()
    permission_classes = ()
    pagination_class = None


class CommentViewSet(ModelViewSet):

    serializer_class = CommentSerializer
    queryset = Comment.objects.order_by('-posted')
    permission_classes = ()

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
