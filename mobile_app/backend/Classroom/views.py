import json
from django.http import JsonResponse
from Classroom.models import Class
from ocr.models import StudentInfo, ReportCard
from django.views.decorators.csrf import csrf_exempt

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


def delete_classroom(request):
    return JsonResponse({'status': 'delete_classroom working'})

def update_classroom(request):
    return JsonResponse({'status': 'update_classroom working'})
