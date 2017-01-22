from rest_framework import viewsets
from .serializers import UserSerializer
from .models import User

from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required


class UserViewSet(viewsets.ModelViewSet):

    serializer_class = UserSerializer
    queryset = User.objects.all()


def profile(request, username):
    return render(request, 'users/profile.html',
                  {'user': get_object_or_404(User, username)})


@login_required
def my_profile(request):
    return render(request, 'users/profile.html',
                  {'user': request.user})
