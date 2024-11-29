import base64

from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from rest_framework.decorators import api_view

from .models import Receipt


def process_image(idImage):
    # Process image
    return JsonResponse({"message": "process_image"})


@api_view(['GET'])
def export_image(request):
    return JsonResponse({"message": "export_image"})
