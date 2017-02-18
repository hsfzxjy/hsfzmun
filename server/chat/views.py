from django.shortcuts import render

from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework.pagination import CursorPagination
from rest_framework.exceptions import ParseError
from rest_framework.generics import ListAPIView
from .serializers import DiscussionSerializer, MessageSerializer
from .models import Message

from django.utils.translation import gettext_lazy as _
from django.utils.dateparse import parse_datetime


class DiscussionViewSet(ReadOnlyModelViewSet):

    serializer_class = DiscussionSerializer
    pagination_class = None
    permission_classes = ()

    def get_queryset(self):
        return self.request.user.discussions.all()


class UnreadMessagesList(ListAPIView):

    serializer_class = MessageSerializer
    pagination_class = None

    def get_queryset(self):
        after = self.request.query_params.get('after', None)

        if after is None:
            raise ParseError(
                _('The API should receive an `after` param.'))

        return Message.objects.filter_user(self.request.user).filter(
            created__gt=parse_datetime(after)).order_by('created')


class HistoryMessagesList(ListAPIView):

    serializer_class = MessageSerializer
    pagination_class = CursorPagination

    def get_queryset(self):
        before = self.request.query_params.get('before', None)

        if before is None:
            raise ParseError(
                _('The API should receive an `before` param.'))

        session_name = self.request.query_params.get('session_name', None)

        if session_name is None:
            raise ParseError(
                _('The API should receive a `session_name` param.')
            )

        return Message.objects.filter(
            created__lte=parse_datetime(before), session_name=session_name)
