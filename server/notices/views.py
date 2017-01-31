from rest_framework.generics import ListAPIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.renderers import TemplateHTMLRenderer
from rest_framework.decorators import list_route, detail_route
from rest_framework.response import Response

from .serializers import NoticeSerializer
from .models import Notice

from django.http import Http404


class NoticeMixin(object):

    filter_fields = ('category', 'has_read')

    def get_queryset(self):
        return self.request.user.received_notices.all()


class NoticeList(NoticeMixin, ListAPIView):

    serializer_class = NoticeSerializer
    renderer_classes = (TemplateHTMLRenderer,)
    template_name = 'notices/list.html'

    def list(self, *args, **kwargs):
        response = super(NoticeList, self).list(*args, **kwargs)
        if not response.data['count']:
            raise Http404

        current = self.request.query_params.get(
            'category', 'all')
        get_class = lambda c: 'active' if current == c else ''
        categories = [{'name': 'all', 'url': '?', 'class': get_class('all')}]
        categories.extend([
            {
                'name': category,
                'url': '?category={}'.format(category),
                'class': get_class(category)
            } for category in Notice.objects.categories()])

        response.data['categories'] = categories

        return response


class NoticeViewSet(NoticeMixin, ModelViewSet):

    serializer_class = NoticeSerializer

    @list_route(methods=['GET'])
    def categories(self, *args, **kwargs):
        return Response(
            Notice.objects.categories()
        )

    @detail_route(methods=['POST'])
    def mark_as_read(self, *args, **kwargs):
        self.get_object().mark_as_read()

        return Response('OK')
