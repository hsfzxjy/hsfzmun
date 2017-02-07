from django.shortcuts import render

from rest_framework.viewsets import ReadOnlyModelViewSet
from .serializers import DiscussionSerializer
from .models import Discussion


class DiscussionViewSet(ReadOnlyModelViewSet):

    serializer_class = DiscussionSerializer
    pagination_class = None

    def get_queryset(self):
        return self.request.user.discussions.all()
