from rest_framework import viewsets
from .serializers import UserSerializer
from .models import User

from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from django.views.generic import View

from .creator import create_from_string, FailToCreate


class UserBulkCreationView(View):

    def get(self, request):
        return render(request, 'users/bulk-creation.html')

    def post(self, request):
        content = request.POST.get('users', '')

        context = {}
        try:
            context['created'] = create_from_string(request, content)
        except FailToCreate as e:
            context.update(e.details)

        return render(request, 'users/bulk-creation.html', context)


class UserViewSet(viewsets.ModelViewSet):

    serializer_class = UserSerializer
    queryset = User.objects.all()
    pagination_class = None
    permission_classes = ()


@api_view(['GET'])
@permission_classes([])
def user_nicknames(request):
    return Response(User.objects.all().values_list('nickname', flat=True))


def profile(request, username):
    return render(request, 'users/profile.html',
                  {'user': get_object_or_404(User, username)})


@login_required
def my_profile(request):
    return render(request, 'users/profile.html',
                  {'user': request.user})
