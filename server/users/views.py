from rest_framework import viewsets
from .serializers import UserSerializer
from .models import User

from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response


class UserViewSet(viewsets.ModelViewSet):

    serializer_class = UserSerializer
    queryset = User.objects.all()
    pagination_class = None


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
