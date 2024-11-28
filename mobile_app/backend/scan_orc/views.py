from django.http import JsonResponse
from django.shortcuts import render


def recieve_image(request):
    return JsonResponse({"message": "recieve_image"});

def process_image(request):
    return JsonResponse({"message": "process_image"});

def export_image(request):
    return JsonResponse({"message": "export_image"});
