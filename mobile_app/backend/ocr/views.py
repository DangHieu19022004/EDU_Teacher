from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import os
import uuid
import cv2
import numpy as np
from ultralytics import YOLO
from paddleocr import PaddleOCR
import json
from django.conf import settings
import requests


yolo_model = YOLO("E:/ORC_mobile_app/mobile_app/backend/ocr/runs/detect/train10/weights/best.pt")
ocr_model = PaddleOCR(use_gpu=False, lang='vi')

BART_SERVER_URL = "http://35.225.133.162:8001/correct"  # hoặc port bạn dùng

def correct_text_with_bart(text):
    try:
        response = requests.post(BART_SERVER_URL, json={"text": text})
        if response.status_code == 200:
            result = response.json().get("corrected", text)
            print(f"✅ BART sửa: '{text}' ➜ '{result}'")
            return result
        print(f"⚠️ BART HTTP error: {response.status_code}")
        return text
    except Exception as e:
        print(f"⚠️ BART connection error: {e}")
        return text

@csrf_exempt
def detect(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method allowed'}, status=405)

    if 'image' not in request.FILES:
        return JsonResponse({'error': 'Missing image file'}, status=400)

    image_file = request.FILES['image']
    unique_filename = str(uuid.uuid4()) + ".jpg"
    temp_image_path = os.path.join(settings.MEDIA_ROOT, "temp", unique_filename)
    os.makedirs(os.path.dirname(temp_image_path), exist_ok=True)
    with open(temp_image_path, 'wb+') as f:
        f.write(image_file.read())

    try:
        # Chạy YOLO
        results = yolo_model(temp_image_path)[0]
        img = cv2.imread(temp_image_path)
        cropped_dir = os.path.join(settings.MEDIA_ROOT, "cropped", uuid.uuid4().hex[:6])
        os.makedirs(cropped_dir, exist_ok=True)

        response_data = []

        for i, box in enumerate(results.boxes.xyxy.cpu().numpy()):
            x1, y1, x2, y2 = map(int, box)
            crop = img[y1:y2, x1:x2]
            crop_filename = f"crop_{i}.jpg"
            crop_path = os.path.join(cropped_dir, crop_filename)
            cv2.imwrite(crop_path, crop)

            # OCR
            ocr_result = ocr_model.ocr(crop_path, det=True, rec=True, cls=False)
            text_data = extract_table_from_ocr_result(ocr_result)

            # Tạo URL trả về
            relative_crop_url = os.path.relpath(crop_path, settings.MEDIA_ROOT).replace("\\", "/")
            image_url = settings.MEDIA_URL + relative_crop_url

            response_data.append({
                "image_url": image_url,
                "ocr_data": text_data
            })

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

    finally:
        if os.path.exists(temp_image_path):
            os.remove(temp_image_path)





