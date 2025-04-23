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
import base64
import google.generativeai as genai
from PIL import Image

yolo_model = YOLO("E:/ORC_mobile_app/mobile_app/backend/ocr/runs/detect/train10/weights/best.pt")
yolo_infor = YOLO("E:/ORC_mobile_app/mobile_app/backend/ocr/runs/detect/train5/weights/best.pt")
ocr_model = PaddleOCR(use_gpu=False, lang='vi')
genai.configure(api_key="AIzaSyCiludt5vTQLBn38xAQI4F1Awleq2P6Mi0")
gemini_model = genai.GenerativeModel("models/gemini-2.0-flash")

BART_SERVER_URL = "http://34.69.155.77:8001/correct"

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

    image_type = request.POST.get('image_type', 'report_card')
    model = yolo_model if image_type == 'report_card' else yolo_infor
    image_file = request.FILES['image']
    unique_filename = str(uuid.uuid4()) + ".jpg"
    temp_image_path = os.path.join(settings.MEDIA_ROOT, "temp", unique_filename)
    os.makedirs(os.path.dirname(temp_image_path), exist_ok=True)
    with open(temp_image_path, 'wb+') as f:
        f.write(image_file.read())

    try:
        # Chạy YOLO
        results = model(temp_image_path)[0]
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

            if image_type == 'report_card':
                text_data = extract_report_card_from_ocr_result(ocr_result)
                result_entry = {
                    "image_url": settings.MEDIA_URL + os.path.relpath(crop_path, settings.MEDIA_ROOT).replace("\\", "/"),
                    "ocr_data": text_data,
                    "student_info": {}
                }
            else:
                info_data = extract_student_info_from_image(crop_path)

                result_entry = {
                    "image_url": settings.MEDIA_URL + os.path.relpath(crop_path, settings.MEDIA_ROOT).replace("\\", "/"),
                    "ocr_data": [],
                    "student_info": info_data
                }

            response_data.append(result_entry)

        return JsonResponse({'results': response_data}, json_dumps_params={'ensure_ascii': False})

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

    finally:
        if os.path.exists(temp_image_path):
            os.remove(temp_image_path)



def extract_report_card_from_ocr_result(ocr_result):
    rows = []
    for line in ocr_result[0]:
        box = line[0]
        text = line[1][0].strip()
        if not text:
            continue
        x_center = (box[0][0] + box[2][0]) / 2
        y_center = (box[0][1] + box[2][1]) / 2
        height = abs(box[0][1] - box[2][1])
        rows.append([y_center, x_center, text, box, height])

    rows.sort(key=lambda r: r[0])
    avg_height = np.mean([r[4] for r in rows])

    grouped_rows = []
    current_group = []

    for r in rows:
        if not current_group or abs(r[0] - current_group[-1][0]) < avg_height * 0.7:
            current_group.append(r)
        else:
            grouped_rows.append(current_group)
            current_group = [r]
    if current_group:
        grouped_rows.append(current_group)

    extracted = []
    for group in grouped_rows:
        group.sort(key=lambda r: r[1])
        texts = [item[2] for item in group]
        if "Giao duc" in texts and "cong dan" in texts:
            idx1 = texts.index("Giao duc")
            idx2 = texts.index("cong dan")
            if abs(idx1 - idx2) == 1:
                new_text = "Giáo dục công dân"
                min_idx = min(idx1, idx2)
                texts[min_idx] = new_text
                del texts[max(idx1, idx2)]
        if len(texts) >= 3:
            corrected_subject = correct_text_with_bart(texts[0])
            item = {
                "ten_mon": corrected_subject,
                "hky1": texts[1] if len(texts) > 1 else "",
                "hky2": texts[2] if len(texts) > 2 else "",
                "ca_nam": texts[3] if len(texts) > 3 else ""
            }
            extracted.append(item)

    return extracted


def extract_student_info_from_image(image_path):
    try:
        with open(image_path, "rb") as img_file:
            image_bytes = img_file.read()
            base64_image = base64.b64encode(image_bytes).decode("utf-8")

        prompt = """
        Hãy trích xuất thông tin sau từ ảnh học bạ hoặc thông tin sinh viên:

        - Họ và tên
        - Giới tính
        - Ngày sinh

        Trả về kết quả JSON với các trường: name, gender, dob
        """

        response = gemini_model.generate_content([
            {"text": prompt},
            {
                "inline_data": {
                    "mime_type": "image/jpeg",
                    "data": base64_image,
                }
            }
        ])

        output_text = response.text.strip()
        print("📄 Gemini raw response:", output_text)

        # Loại bỏ ```json hoặc ``` nếu tồn tại
        if output_text.startswith("```json"):
            output_text = output_text[7:]
        elif output_text.startswith("```"):
            output_text = output_text[3:]

        if output_text.endswith("```"):
            output_text = output_text[:-3]

        output_text = output_text.strip()
        print("✅ Gemini JSON cleaned:", output_text)

        return json.loads(output_text)

    except Exception as e:
        print("❌ Lỗi khi xử lý ảnh bằng Gemini:", str(e))

    return {
        "name": "",
        "gender": "",
        "dob": ""
    }

