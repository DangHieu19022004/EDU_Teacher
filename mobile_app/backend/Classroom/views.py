import json
from uuid import UUID
from django.http import JsonResponse
from Classroom.models import Class
from ocr.models import ReportCardSubject, StudentInfo, ReportCard
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from User.models import User

@csrf_exempt
@require_http_methods(["DELETE"])
def delete_classroom(request):
    try:
        class_id = request.GET.get("id")
        print(f"🧪 DELETE request class_id = {class_id}")
        if not class_id:
            return JsonResponse({'error': 'Thiếu class_id'}, status=400)

        # Xác thực người dùng
        authorization_header = request.headers.get('Authorization')
        if not authorization_header or not authorization_header.startswith("Bearer "):
            return JsonResponse({'error': 'Thiếu hoặc sai định dạng Authorization'}, status=401)
        uid = authorization_header.split(' ')[1]
        try:
            User.objects.get(uid=uid)
        except User.DoesNotExist:
            return JsonResponse({'error': 'Người dùng không tồn tại'}, status=404)

        # Tìm tất cả học bạ của lớp
        report_cards = ReportCard.objects.filter(class_id=UUID(class_id))
        student_ids = list(report_cards.values_list('student_id', flat=True))

        # 1. Xoá ReportCardSubject trước
        for rc in report_cards:
            deleted = ReportCardSubject.objects.filter(report_card_id=rc._id).delete()
            print(f"🗑️ Deleted ReportCardSubject for report_card_id={rc._id}: {deleted}")

        # 2. Xoá ReportCard tiếp theo
        deleted_rc = report_cards.delete()
        print(f"🗑️ Deleted ReportCards: {deleted_rc}")

        # 3. Xoá StudentInfo nếu không còn report card nào khác
        for student_id in student_ids:
            if not ReportCard.objects.filter(student_id=student_id).exists():
                deleted_st = StudentInfo.objects.filter(student_id=student_id).delete()
                print(f"🗑️ Deleted StudentInfo for student_id={student_id}: {deleted_st}")

        # 4. Xoá class cuối cùng
        class_instance = Class.objects.get(id=UUID(class_id))
        deleted_class = class_instance.delete()
        print(f"🗑️ Deleted Class: {deleted_class}")

        return JsonResponse({'message': 'Xoá lớp và toàn bộ học sinh liên quan thành công'}, status=200)

    except Class.DoesNotExist:
        return JsonResponse({'error': 'Không tìm thấy lớp'}, status=404)
    except Exception as e:
        print("❌ Exception delete_classroom:", str(e))
        return JsonResponse({'error': str(e)}, status=500)




@csrf_exempt
def save_classroom(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)

            uid = request.headers.get('Authorization', '').replace('Bearer ', '').strip()


            if not uid:
                return JsonResponse({'error': 'User not authenticated or uid missing'}, status=401)

            # Lấy các trường từ frontend
            name = data.get('name')
            school_name = data.get('school_name')
            class_year = data.get('class_year')

            if not all([name, school_name, class_year]):
                return JsonResponse({'error': 'Missing class information'}, status=400)

            # Tạo lớp mới
            new_class = Class.objects.create(
                name=name,
                teacher_id=uid,
                school_name=school_name  or "",
                class_year=class_year  or ""
            )

            return JsonResponse({'message': 'Class saved successfully', 'class_id': str(new_class.id)})

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=405)


def get_classroom(request):
    return JsonResponse({'status': 'get_classroom working'})

@csrf_exempt
def get_classrooms(request):
    teacher_id = request.GET.get('teacher_id')
    if not teacher_id:
        return JsonResponse({'error': 'Missing teacher_id'}, status=400)

    classrooms = Class.objects.filter(teacher_id=teacher_id)
    data = [
        {
            'id': str(c.id),
            'name': c.name,
            'school_name': c.school_name,
            'class_year': c.class_year,
        }
        for c in classrooms
    ]
    return JsonResponse(data, safe=False)

@csrf_exempt
def get_students_by_class(request):
    class_id = request.GET.get('class_id')
    if not class_id:
        return JsonResponse({'error': 'Missing class_id'}, status=400)

    report_cards = ReportCard.objects.filter(class_id=class_id)
    student_ids = report_cards.values_list('student_id', flat=True)
    students = StudentInfo.objects.filter(student_id__in=student_ids)

    results = [
        {
            'id': student.student_id,
            'name': student.name,
            'gender': student.gender,
            'dob': student.dob,
            'phone': student.phone,
            'school': student.school,
            'academicPerformance': '',
            'conduct': '',
            'transcript': ''
        } for student in students
    ]
    return JsonResponse(results, safe=False)

def update_classroom(request):
    return JsonResponse({'status': 'update_classroom working'})
