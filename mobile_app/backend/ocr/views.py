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
        all_subjects = []

        for i, box in enumerate(results.boxes.xyxy.cpu().numpy()):
            x1, y1, x2, y2 = map(int, box)
            crop = img[y1:y2, x1:x2]
            crop_filename = f"crop_{i}.jpg"
            crop_path = os.path.join(cropped_dir, crop_filename)
            cv2.imwrite(crop_path, crop)

            # OCR
            ocr_result = ocr_model.ocr(crop_path, det=True, rec=True, cls=False)
            text_data = extract_table_from_ocr_result(ocr_result)
            all_subjects.extend(text_data)

            # Tạo URL trả về
            relative_crop_url = os.path.relpath(crop_path, settings.MEDIA_ROOT).replace("\\", "/")
            image_url = settings.MEDIA_URL + relative_crop_url

            response_data.append({
                "image_url": image_url,
                "ocr_data": text_data
            })


        # Tự động đưa lời khuyên sau khi quét OCR
        diem_dict = {}
        all_scores = []

        for item in all_subjects:
            ten_mon = item.get("ten_mon", "")
            try:
                hky1 = float(item.get("hky1", "0").replace(",", "."))
                hky2 = float(item.get("hky2", "0").replace(",", "."))
                diem_dict[ten_mon] = [hky1, hky2]
                all_scores.extend([hky1, hky2])
            except:
                continue

        dtb = round(sum(all_scores) / len(all_scores), 2) if all_scores else 0.0
        advice = generate_advice_from_scores(dtb, diem_dict)

        return JsonResponse({
            'results': response_data,
            'advice': advice
        }, json_dumps_params={'ensure_ascii': False})

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

    finally:
        if os.path.exists(temp_image_path):
            os.remove(temp_image_path)



def extract_table_from_ocr_result(ocr_result):
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


#Hàm sinh lời khuyên
def generate_advice_from_scores(dtb, diem_data):
    strong = [subject for subject, scores in diem_data.items()
              if all(isinstance(s, (int, float)) for s in scores) and sum(scores)/len(scores) >= 8.0]

    weak = [subject for subject, scores in diem_data.items()
            if all(isinstance(s, (int, float)) for s in scores) and sum(scores)/len(scores) <= 5.5]

    message = (
        f"🎓 Điểm trung bình: {dtb}\n"
        f"✅ Môn mạnh: {', '.join(strong) if strong else 'Không có'}\n"
        f"⚠️ Môn yếu: {', '.join(weak) if weak else 'Không có'}\n"
        "💡 Gợi ý: Hãy chọn ngành học liên quan tới các môn mạnh, "
        "đồng thời xem xét hỗ trợ thêm cho các môn yếu bằng cách học phụ đạo hoặc luyện tập thêm."
    )
    return message


#Chatbot API
@csrf_exempt
def chatbot_advice(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)

            message = data.get("message", "").lower()
            dtb = data.get("DTB", [0])[-1]
            diem_data = data.get("diem", {})

            strong = [subject for subject, scores in diem_data.items()
                      if all(isinstance(s, (int, float)) for s in scores) and sum(scores)/len(scores) >= 8.0]

            weak = [subject for subject, scores in diem_data.items()
                    if all(isinstance(s, (int, float)) for s in scores) and sum(scores)/len(scores) <= 5.5]

            if "ngành" in message:
                return JsonResponse({
                    "advice": f"💡 Bạn nên chọn ngành học liên quan tới các môn mạnh như: {', '.join(strong) if strong else 'chưa xác định'}."
                })

            elif "cải thiện" in message or "môn yếu" in message:
                return JsonResponse({
                    "advice": f"📉 Các môn cần cải thiện là: {', '.join(weak) if weak else 'Không có môn yếu rõ ràng.'}"
                })

            elif "mạnh" in message or "giỏi" in message:
                return JsonResponse({
                    "advice": f"💪 Các môn học tốt của bạn là: {', '.join(strong) if strong else 'Chưa phát hiện môn mạnh rõ ràng.'}"
                })

            elif "xếp loại" in message or "học lực" in message:
                xep_loai = (
                    "Giỏi" if dtb >= 8 else
                    "Khá" if dtb >= 6.5 else
                    "Trung bình" if dtb >= 5 else
                    "Yếu"
                )
                return JsonResponse({
                    "advice": f"🎓 Điểm trung bình: {dtb}. Xếp loại học lực: {xep_loai}."
                })

            else:
                advice = generate_advice_from_scores(dtb, diem_data)
                return JsonResponse({"advice": advice}, json_dumps_params={'ensure_ascii': False})

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Only POST method allowed"}, status=405)

