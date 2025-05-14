from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
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
from .models import StudentInfo, ReportCard, Subject, ReportCardSubject
from User.models import User
import base64
import google.generativeai as genai
from PIL import Image
from bson import ObjectId
from Classroom.models import Class
from uuid import UUID
import base64
import os, time

yolo_model = YOLO("./runs/detect/train10/weights/best.pt")
yolo_infor = YOLO("./runs/detect/train5/weights/best.pt")
ocr_model = PaddleOCR(use_gpu=False, lang='vi')
genai.configure(api_key="AIzaSyCiludt5vTQLBn38xAQI4F1Awleq2P6Mi0")
gemini_model = genai.GenerativeModel("models/gemini-2.0-flash")

def cleanup_cropped_dir(base_dir, max_age_minutes=15):
    now = time.time()
    for folder in os.listdir(base_dir):
        folder_path = os.path.join(base_dir, folder)
        if os.path.isdir(folder_path):
            if now - os.path.getmtime(folder_path) > max_age_minutes * 60:
                try:
                    for file in os.listdir(folder_path):
                        os.remove(os.path.join(folder_path, file))
                    os.rmdir(folder_path)
                    print(f"🧹 Đã xoá thư mục cũ: {folder_path}")
                except Exception as e:
                    print(f"⚠️ Không thể xoá {folder_path}: {e}")

BART_SERVER_URL = "http://34.69.155.77:8001/correct"


@csrf_exempt
@require_http_methods(["GET"])
def get_all_student_data(request):
    try:
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return JsonResponse({'error': 'Thiếu Authorization'}, status=401)

        uid = auth_header.split(" ")[1]
        try:
            teacher = User.objects.get(uid=uid)
        except User.DoesNotExist:
            return JsonResponse({'error': 'Người dùng không tồn tại'}, status=404)

        all_data = []

        # Lấy tất cả lớp của giáo viên
        classes = Class.objects.filter(teacher_id=uid)
        for cls in classes:
            # Lấy tất cả học sinh trong lớp đó
            students = StudentInfo.objects.filter(class_id=cls.id)
            for student in students:
                student_entry = {
                    "student": {
                        "id": student.student_id,
                        "name": student.name,
                        "gender": student.gender or '',
                        "dob": str(student.dob) if student.dob else '',
                        "school": cls.school_name,
                        "class": cls.name,
                        "class_year": cls.class_year,
                    },
                    "report_card": {},
                    "subjects": []
                }

                # Lấy học bạ gần nhất
                report = ReportCard.objects.filter(student_id=student.student_id).order_by('-school_year').first()
                if report:
                    student_entry["report_card"] = {
                        "school_year": report.school_year,
                        "teacher_comment": report.teacher_comment or '',
                        "conduct": report.conduct_year3_final or '',
                        "gpa": {
                            "10": report.gpa_avg_year1,
                            "11": report.gpa_avg_year2,
                            "12": report.gpa_avg_year3
                        }
                    }

                    # Lấy danh sách điểm môn học từ ReportCardSubject
                    subjects_entry = ReportCardSubject.objects.filter(report_card_id=str(report._id)).first()
                    if subjects_entry:
                        for subject in subjects_entry.subjects:
                            year = subject.get("year")
                            year_str = str(year)
                            subject_obj = {
                                "name": subject.get("name", ""),
                                "year": year_str,
                                "hk1": str(subject.get(f"year{year}_sem1_score", '')),
                                "hk2": str(subject.get(f"year{year}_sem2_score", '')),
                                "cn": str(subject.get(f"year{year}_final_score", '')),
                            }
                            student_entry["subjects"].append(subject_obj)

                all_data.append(student_entry)

        return JsonResponse({"students": all_data}, json_dumps_params={'ensure_ascii': False}, status=200)

    except Exception as e:
        print(f"❌ Exception get_all_student_data: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["DELETE"])
def delete_full_report_card(request):
    try:
        report_card_id = request.GET.get("id")
        if not report_card_id:
            return JsonResponse({'error': 'Thiếu report_card_id'}, status=400)

        # 1. Xác thực người dùng
        authorization_header = request.headers.get('Authorization')
        if not authorization_header or not authorization_header.startswith("Bearer "):
            return JsonResponse({'error': 'Thiếu hoặc sai định dạng Authorization'}, status=401)

        uid = authorization_header.split(' ')[1]
        try:
            User.objects.get(uid=uid)
        except User.DoesNotExist:
            return JsonResponse({'error': 'Người dùng không tồn tại'}, status=404)

        # 2. Tìm và xoá học bạ
        try:
            report_card = ReportCard.objects.get(_id=ObjectId(report_card_id))
        except ReportCard.DoesNotExist:
            return JsonResponse({'error': 'Không tìm thấy học bạ'}, status=404)

        student_id = report_card.student_id

        # Xoá học bạ
        report_card.delete()

        # Xoá bảng điểm
        ReportCardSubject.objects.filter(report_card_id=report_card_id).delete()

        # Xoá thông tin sinh viên (nếu không còn học bạ nào khác)
        if not ReportCard.objects.filter(student_id=student_id).exists():
            StudentInfo.objects.filter(student_id=student_id).delete()


        return JsonResponse({'message': 'Xoá học bạ và sinh viên thành công'}, status=200)

    except Exception as e:
        print(f"❌ Exception delete_full_report_card: {e}")
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["PUT"])
def update_report_card(request):
    try:
        report_card_id = request.GET.get("id")
        if not report_card_id:
            return JsonResponse({'error': 'Thiếu report_card_id'}, status=400)

        data = json.loads(request.body)
        authorization_header = request.headers.get('Authorization')
        if not authorization_header or not authorization_header.startswith("Bearer "):
            return JsonResponse({'error': 'Thiếu hoặc sai định dạng Authorization'}, status=401)

        uid = authorization_header.split(' ')[1]
        try:
            user = User.objects.get(uid=uid)
        except User.DoesNotExist:
            return JsonResponse({'error': 'Người dùng không tồn tại'}, status=404)

        # 1. Tìm và cập nhật ReportCard
        try:
            report_card = ReportCard.objects.get(_id=ObjectId(report_card_id))
        except ReportCard.DoesNotExist:
            return JsonResponse({'error': 'Không tìm thấy report card'}, status=404)

        report_data = data.get('report_card', {})
        class_id = report_data.get('class_id')
        print("🧪 class_id nhận từ frontend:", class_id)
        if not class_id:
            return JsonResponse({'error': 'class_id không được để trống'}, status=400)

        try:
            class_instance = Class.objects.get(id=class_id)
        except Class.DoesNotExist:
            return JsonResponse({'error': f'Không tìm thấy class_id: {class_id}'}, status=404)

        for field, value in report_data.items():
            if field == 'class_id':
                continue  # ✅ bỏ qua vì đã gán riêng ở dưới
            setattr(report_card, field, value)

        report_card.class_id = class_instance

        report_card.user_id = user.uid
        report_card.save()

        # 2. Cập nhật thông tin sinh viên
        student_data = data.get('student', {})
        student_id = student_data.get('id')
        student_info, created = StudentInfo.objects.get_or_create(student_id=student_id)
        for field, value in student_data.items():
            setattr(student_info, field, value)
        student_info.save()

        # 3. Cập nhật ReportCardSubject
        ReportCardSubject.objects.filter(report_card_id=str(report_card._id)).delete()
        ReportCardSubject.objects.create(
            report_card_id=str(report_card._id),
            subjects=data.get('subjects', [])
        )

        return JsonResponse({'message': 'Cập nhật học bạ thành công'}, status=200)

    except Exception as e:
        print(f"❌ Exception update_report_card: {e}")
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def get_full_report_card(request):
    student_id = request.GET.get('student_id')
    if not student_id:
        return JsonResponse({'error': 'Missing student_id'}, status=400)

    try:
        # 1. Lấy thông tin sinh viên
        student_info = StudentInfo.objects.get(student_id=student_id)

        # 1.1 Truy xuất thông tin lớp từ class_id
        class_name = ''
        school_name = ''
        if student_info.class_id:
            try:
                class_obj = Class.objects.get(id=UUID(str(student_info.class_id)))
                class_name = class_obj.name
                school_name = class_obj.school_name
            except Exception as e:
                print(f"❌ Không tìm được lớp từ class_id: {e}")

        # 2. Gán thông tin cơ bản
        student_data = {
            'id': student_info.student_id,
            'name': student_info.name,
            'dob': student_info.dob or '',
            'gender': student_info.gender or '',
            'phone': student_info.phone or '',
            'school': school_name,
            'class_id': str(student_info.class_id) if student_info.class_id else '',
            'academicPerformance': '',
            'conduct': '',
        }

        # 3. Lấy học bạ gần nhất
        report_card = ReportCard.objects.filter(student_id=student_id).order_by('-school_year').first()
        if not report_card:
            return JsonResponse({
                'student': student_data,
                'report_card': None,
                'classList': [],
                'class_name': class_name,
                'school_name': school_name
            }, status=200)

        student_data['academicPerformance'] = report_card.academic_perform_year1 or ''
        student_data['conduct'] = report_card.conduct_year1_final or ''

        # 4. Lấy danh sách điểm môn học
        print("🧪 Dạng string dùng để filter:", str(report_card._id))
        subjects_entries = ReportCardSubject.objects.filter(report_card_id=str(report_card._id))
        print("🔍 Số entries tìm được:", subjects_entries.count())
        print("🧪 _id report_card dùng để tìm:", str(report_card._id))
        year_map = {1: "10", 2: "11", 3: "12"}
        class_subjects = { "10": [], "11": [], "12": [] }

        for entry in subjects_entries:
            for sub in entry.subjects:
                year = sub.get('year')
                class_label = year_map.get(year)
                if not class_label:
                    continue

                name = sub.get('name', '').strip()
                if name.lower() in ['học', 'các môn', 'dtb các môn']:
                    print(f"⚠️ Bỏ qua môn không hợp lệ: {name}")
                    continue


                subject_obj = {
                    'name': name,
                    'hk1': str(sub.get(f'year{year}_sem1_score') or ''),
                    'hk2': str(sub.get(f'year{year}_sem2_score') or ''),
                    'cn':  str(sub.get(f'year{year}_final_score') or '')
                }

                class_subjects[class_label].append(subject_obj)

        # 5. Ghép thành classList
        class_list = []
        for class_name_, subjects in class_subjects.items():
            if subjects:
                class_list.append({
                    'class': class_name_,
                    'subjects': subjects
                })
        print("✅ Tổng số entry ReportCardSubject:", subjects_entries.count())
        print("🔍 class_subjects build xong:", json.dumps(class_subjects, ensure_ascii=False))
        print("📦 classList trả về:", json.dumps(class_list, ensure_ascii=False))

        # 6. Trả dữ liệu
        return JsonResponse({
            'student': student_data,
            'report_card': {
                'id': str(report_card._id),
                'school_year': report_card.school_year,
                'teacher_signed': report_card.teacher_signed,
                'principal_signed': report_card.principal_signed,
                'teacher_comment': report_card.teacher_comment,
                'approval_date': str(report_card.approval_date) if report_card.approval_date else None,
            },
            'classList': class_list,
            'class_name': class_name,
            'school_name': school_name,
        }, json_dumps_params={'ensure_ascii': False}, status=200)

    except StudentInfo.DoesNotExist:
        return JsonResponse({'error': 'Student not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)



@csrf_exempt
@require_http_methods(["POST"])
def save_full_report_card(request):
    try:
        print("🔵 Nhận request save_full_report_card")

        body_unicode = request.body.decode('utf-8')
        print("📦 Payload raw nhận được:", body_unicode)
        data = json.loads(request.body)
        print("📋 Dữ liệu parse xong:", data)
  # 0. Lấy UID từ Authorization Header
        authorization_header = request.headers.get('Authorization')
        if not authorization_header:
            print("🔴 Lỗi: Thiếu Authorization Header (UID)")
            return JsonResponse({'error': 'Missing Authorization header (UID)'}, status=401)

        # Extract UID từ header 'Bearer user_xxx'
        if not authorization_header.startswith("Bearer "):
            print("🔴 Lỗi: Authorization Header không đúng định dạng Bearer")
            return JsonResponse({'error': 'Invalid Authorization header format'}, status=400)

        uid = authorization_header.split(' ')[1]
        print(f"🔹 UID nhận được: {uid}")

        try:
            user = User.objects.get(uid=uid)
        except User.DoesNotExist:
            print(f"🔴 Lỗi: Không tìm thấy user với UID: {uid}")
            return JsonResponse({'error': 'User not found'}, status=404)

        # 1. Lưu StudentInfo
        student_id = data.get('student', {}).get('id')
        if not student_id:
            print("🔴 Lỗi: Không có student_id")
            return JsonResponse({'error': 'Missing student ID'}, status=400)

        student_info, created = StudentInfo.objects.get_or_create(
            student_id=student_id,
            defaults={
                'name': data['student'].get('name', ''),
                'dob': data['student'].get('dob', ''),
                'gender': data['student'].get('gender', ''),
                'address': data['student'].get('address', ''),
                'father_name': data['student'].get('father_name', ''),
                'mother_name': data['student'].get('mother_name', ''),
                'phone': data['student'].get('phone', ''),
                'parents_email': data['student'].get('parents_email', ''),
                'class_id': data['student'].get('class_id', ''),
                'ethnicity': data['student'].get('ethnicity', ''),
                'birthplace': data['student'].get('birthplace', ''),
            }
        )

        if not created:
            for field, value in data['student'].items():
                setattr(student_info, field, value)
            student_info.save()

        # 2. Lưu ReportCard
        class_uuid = data['report_card'].get('class_id', '')
        try:
            class_instance = Class.objects.get(id=class_uuid)
        except Class.DoesNotExist:
            return JsonResponse({'error': f'Class with id {class_uuid} not found'}, status=404)
        report_card = ReportCard.objects.create(
            student_id=student_id,
            class_id=class_instance,
            school_year=data['report_card'].get('school_year', ''),
            conduct_year1_sem1=data['report_card'].get('conduct_year1_sem1', ''),
            conduct_year1_sem2=data['report_card'].get('conduct_year1_sem2', ''),
            conduct_year1_final=data['report_card'].get('conduct_year1_final', ''),
            conduct_year2_sem1=data['report_card'].get('conduct_year2_sem1', ''),
            conduct_year2_sem2=data['report_card'].get('conduct_year2_sem2', ''),
            conduct_year2_final=data['report_card'].get('conduct_year2_final', ''),
            conduct_year3_sem1=data['report_card'].get('conduct_year3_sem1', ''),
            conduct_year3_sem2=data['report_card'].get('conduct_year3_sem2', ''),
            conduct_year3_final=data['report_card'].get('conduct_year3_final', ''),
            academic_perform_year1=data['report_card'].get('academic_perform_year1', ''),
            academic_perform_year2=data['report_card'].get('academic_perform_year2', ''),
            academic_perform_year3=data['report_card'].get('academic_perform_year3', ''),
            gpa_avg_year1=data['report_card'].get('gpa_avg_year1', 0),
            gpa_avg_year2=data['report_card'].get('gpa_avg_year2', 0),
            gpa_avg_year3=data['report_card'].get('gpa_avg_year3', 0),
            promotion_status=data['report_card'].get('promotion_status', ''),
            teacher_comment=data['report_card'].get('teacher_comment', ''),
            teacher_signed=data['report_card'].get('teacher_signed', False),
            principal_signed=data['report_card'].get('principal_signed', False),
            user_id=user.uid
        )
        print("🟩 Tạo ReportCard thành công, _id =", report_card._id)

        # 3. Lưu ReportCardSubject
        ReportCardSubject.objects.create(
            report_card_id=str(report_card._id),
            subjects=data.get('subjects', [])
        )


        return JsonResponse({'message': 'Lưu học bạ thành công'}, status=201)

    except Exception as e:
        print(f"🔴 Exception trong save_full_report_card: {e}")
        return JsonResponse({'error': str(e)}, status=400)



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
        cleanup_cropped_dir(os.path.join(settings.MEDIA_ROOT, "cropped"))

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

