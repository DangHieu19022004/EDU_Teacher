import base64

from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from rest_framework.decorators import api_view
from scan_orc.views import process_image

from .models import RawImage


@api_view(['POST'])
def recieve_image(request):
    try:
        # Lấy dữ liệu từ request
        data = request.data
        if "imgPath" not in data:
            return JsonResponse({"status": "error", "message": "No image provided"}, status=400)

        # lay du lieu anh tu request
        img_data = data["imgPath"].split(",")[1]
        img_binary = base64.b64decode(img_data)

        # Lưu ảnh vào MongoDB
        image_document = RawImage()
        image_document.image_path = img_binary
        image_document.save()

        # Gọi hàm xử lý ảnh
        process_image(image_document.id)

        return JsonResponse({"status": "success", "message": "Image saved successfully"})
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)
