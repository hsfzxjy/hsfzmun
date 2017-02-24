from django.http import JsonResponse
from django.contrib.auth.decorators import login_required

from django.core.files.storage import default_storage

from .utils import make_file_name
from .models import Attachment
from .serializers import AttachmentSerializer

from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated


@login_required
def upload_image(request):
    if request.method == 'POST':
        image = request.FILES['image']
        file_name = make_file_name(image.name)
        default_storage.save(file_name, image)
        return JsonResponse({
            'success': True,
            'url': default_storage.url(file_name)
        })


class AttachmentViewSet(ModelViewSet):

    queryset = Attachment.objects.all()
    serializer_class = AttachmentSerializer
    permission_classes = [IsAuthenticated]
