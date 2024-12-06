import base64
import logging
import os
from io import BytesIO

import cv2
import numpy as np
import onnxruntime as ort
from django.conf import settings
from django.http import JsonResponse
from paddleocr import PaddleOCR
from PIL import Image
from rest_framework.decorators import api_view
from ultralytics import YOLO

from .models import Receipt

logger = logging.getLogger(__name__)

ocr = PaddleOCR(lang='vi',  drop_score=0.3, use_angle_cls=True)

model_path = "models/best.onnx"


def extract_text(image, coords):
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
        cropped_image = cv2.equalizeHist(cropped_image)

        # Thử nghiệm OCR
        result = ocr.ocr(cropped_image, cls=True)  # Nhận diện văn bản
        if not result or not result[0]:
            print(f"OCR không nhận diện được văn bản tại vùng ({x1}, {y1}, {x2}, {y2})")
            continue


        for line in result[0]:  # Duyệt qua các kết quả OCR
            detected_text = line[1][0]  # Văn bản nhận diện được
            confidence = line[1][1]    # Độ tin cậy của kết quả
            texts.append((detected_text, confidence))

    return texts


def process_image(img_binary):
    try:
        # Convert binary data to numpy array
        nparr = np.frombuffer(img_binary, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            logger.error("Failed to decode image.")
            return {"status": "error", "error": "Failed to decode image."}

        # Tiến hành tiền xử lý ảnh và sử dụng mô hình YOLO và OCR
        logger.info("Image successfully decoded, proceeding with YOLOv8 model.")



        session = ort.InferenceSession(model_path)
        input_name = session.get_inputs()[0].name
        input_data = cv2.resize(img, (640, 640))
        input_data = input_data.transpose(2, 0, 1)
        input_data = np.expand_dims(input_data, axis=0).astype(np.float32) / 255.0

        result = session.run(None, {input_name: input_data})
        logger.debug(f"YOLO result: {result}")

         # YOLO output (bounding boxes, classes, and scores)
        boxes = result[0]  # YOLO output
        boxes = boxes[0]   # Get the first element if batch size is 1

        # Filter boxes with confidence > 0.5
        boxes = boxes[boxes[:, 4] > 0.5]
        logger.debug(f"YOLO Output: {boxes}")  # Log ra các bounding box để kiểm tra

        if len(boxes) == 0:
            logger.warning("No objects detected in image, continuing without further processing.")
            return {"status": "warning", "message": "No objects detected in image."}


        if len(boxes) == 0:
            logger.error("No objects detected.")
            return {"status": "error", "error": "No objects detected in image."}

        # Process each bounding box
        cropped_images = []
        for box in boxes:
            x1, y1, x2, y2 = map(int, box[:4])
            cropped_img = img[y1:y2, x1:x2]
            cropped_images.append(cropped_img)

        logger.debug(f"Image shape: {img.shape}")
        logger.debug(f"Cropped image shape: {cropped_img.shape}")


        result_text = ""
        for cropped_img in cropped_images:
            # Tăng cường độ tương phản của ảnh trước khi gửi vào OCR
            gray_img = cv2.cvtColor(cropped_img, cv2.COLOR_BGR2GRAY)
            contrast_img = cv2.equalizeHist(gray_img)

            # Perform OCR on each cropped image
            text_result = ocr.ocr(contrast_img, cls=True)  # Perform OCR on the contrast-enhanced image
            if text_result and isinstance(text_result, list) and len(text_result) > 0:
                for line in text_result[0]:  # Ensure the result is a list and not empty
                    if len(line) > 1:
                        detected_text = line[1][0]
                        confidence = line[1][1]
                        result_text += detected_text + " "
                    else:
                        logger.debug(f"OCR detected an invalid line format: {line}")
            else:
                logger.debug("OCR did not detect any text in this region.")

        logger.info("OCR process completed successfully.")

        # Log thêm chi tiết về bounding boxes của YOLO
        boxes = result[0][0]
        logger.debug(f"YOLO detected boxes: {boxes}")


        return {"status": "success", "text": result_text.strip()}

        # # Lấy ảnh dưới dạng base64 từ MongoDB
        # image_base64 = Image.open(BytesIO(image_document.image_path))

        # # Giải mã chuỗi base64 thành ảnh
        # image_data = base64.b64decode(image_base64)
        # nparr = np.frombuffer(image_data, np.uint8)
        # image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # # Chạy mô hình YOLOv8 và OCR
        # results = model.predict(image, conf=0.2, iou=0.5)
        # # results = model.run(image)


        # detections = results[0].boxes.xyxy.cpu().numpy()
        # # detections = results[0]
        # coords = [(int(x1), int(y1), int(x2), int(y2)) for x1, y1, x2, y2 in detections]
        # texts = extract_text(image, coords)

        # return texts

    except Receipt.DoesNotExist:
        return "Error: Image not found"
    except Exception as e:
        return f"Error: {str(e)}"

@api_view(['GET'])
def export_image(request, idImage):
    try:
        receipt = Receipt.objects.get(id=idImage)
        image_base64 = receipt.image_path
        return JsonResponse({"image_base64": image_base64})
    except Receipt.DoesNotExist:
        return JsonResponse({"error": "Image not found"}, status=404)
