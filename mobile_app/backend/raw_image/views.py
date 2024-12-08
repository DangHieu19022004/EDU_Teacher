import base64
from venv import logger

import cv2
import numpy as np
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from paddleocr import PaddleOCR
from rest_framework.decorators import api_view
from ultralytics import YOLO

from .models import RawImage

# from scan_orc.views import process_image


def process_image(img_binary):
    model = YOLO('models/best.onnx')

    nparr = np.frombuffer(img_binary, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    results = model.predict(image, conf=0.2, iou=0.5)

    detections = results[0].boxes.xyxy.cpu().numpy()
    coords = [(int(x1), int(y1), int(x2), int(y2)) for x1, y1, x2, y2 in detections]

    # ocr
    ocr = PaddleOCR(lang='en',  drop_score=0.2, use_angle_cls=True)
    texts = []
    for (x1, y1, x2, y2) in coords:
        cropped_image = image[y1:y2, x1:x2]  # Cắt vùng bounding box
        if x1 < 0 or y1 < 0 or x2 > image.shape[1] or y2 > image.shape[0]:
            print(f"OCR không nhận diện được văn bản tại vùng ({x1}, {y1}, {x2}, {y2})")
            continue
         # Cắt và chuyển đổi định dạng ảnh
        cropped_image = image[y1:y2, x1:x2]
        if cropped_image.size == 0:
            print(f"Vùng ảnh rỗng tại: ({x1}, {y1}, {x2}, {y2})")
            continue

        cropped_image = cv2.cvtColor(cropped_image, cv2.COLOR_BGR2GRAY)
        cropped_image = cv2.GaussianBlur(cropped_image, (3, 3), 0)
        cropped_image = cv2.adaptiveThreshold(cropped_image, 255,
                                            cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                            cv2.THRESH_BINARY, 11, 2)

        # Thử nghiệm OCR
        result = ocr.ocr(cropped_image, cls=True)  # Nhận diện văn bản
        # result = ocr.ocr(image, cls=True)  # Nhận diện văn bản

        if not result or not result[0]:
            print(f"OCR không nhận diện được văn bản tại vùng ({x1}, {y1}, {x2}, {y2})")
            continue

        for line in result[0]:  # Duyệt qua các kết quả OCR
            detected_text = line[1][0]  # Văn bản nhận diện được
            confidence = line[1][1]    # Độ tin cậy của kết quả
            texts.append(detected_text)

    return texts

@api_view(['POST', 'GET'])
def recieve_image(request):
    try:
        if request.method == "POST":
            # Lấy dữ liệu từ request
            data = request.data
            if "imgPath" not in data:
                return JsonResponse({"status": "error", "message": "No image provided"}, status=400)

            # lay du lieu anh tu request
            img_data = data["imgPath"].split(",")[1]
            img_binary = base64.b64decode(img_data)

            # Kiểm tra ảnh đã được giải mã chính xác
            if not img_binary:
                return JsonResponse({"status": "error", "message": "Failed to decode image."}, status=400)

            # Lưu ảnh vào MongoDB
            image_document = RawImage()
            image_document.image_path = img_binary
            image_document.save()

            process_result  = process_image(img_binary)


            return JsonResponse({"status": "success", "message": "Image saved successfully" , "result" : process_result}, status=200)

            # try:
            #     result = process_image(img_binary)
            #     if isinstance(result, dict) and "status" in result:
            #         if result["status"] == "error":
            #             logger.error(f"Error: {result['error']}")
            #             return JsonResponse({"status": "error", "message": result['error']})
            #         return JsonResponse({"status": "success", "text": result.get("text", "")})
            #     else:
            #         logger.error("Invalid result format from process_image")
            #         return JsonResponse({"status": "error", "message": "Unexpected result format from process_image"})
            # except Exception as e:
            #     logger.error(f"Unexpected error: {str(e)}")
            #     return JsonResponse({"status": "error", "message": str(e)})
            # # Gọi hàm xử lý ảnh
            # process_result  = process_image(img_binary)

            # if "error" in process_result:
            #     return JsonResponse({"status": "error", "message": process_result["error"]}, status=500)


            # return JsonResponse({"status": "success", "message": "Image saved successfully" , "result" : process_result["text"]}, status=200)

        elif request.method == "GET":
            images = RawImage.objects.all()

            images_list = [{"id": str(image.id), "image_path": str(image.image_path)} for image in images]

            return JsonResponse({"status": "success", "images": images_list}, status=200)
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)


@api_view(["GET"])
def get_image(request, image_id):
    try:
        image = RawImage.objects.get(id=image_id)
        return HttpResponse(image.image_path, content_type="image/jpeg")
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)

