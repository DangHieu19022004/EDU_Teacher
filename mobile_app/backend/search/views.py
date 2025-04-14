import json
import os
from django.http import JsonResponse, Http404
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt

# Load dữ liệu từ file JSON
DATA_PATH = os.path.join(settings.BASE_DIR, 'EDU_Teacher_FE', 'app', 'test_data', 'fakedata.json')

with open(DATA_PATH, 'r', encoding='utf-8') as f:
    DATA = json.load(f)


# Lấy danh sách lớp học
def get_class_list(request):
    class_list = [{"id": cls["id"], "name": cls["name"]} for cls in DATA]
    return JsonResponse(class_list, safe=False)


# Lấy danh sách học sinh theo lớp
def get_students_by_class(request, class_id):
    for cls in DATA:
        if cls["id"] == class_id:
            students = [{"id": std["id"], "name": std["name"]} for std in cls["students"]]
            return JsonResponse(students, safe=False)
    raise Http404("Class not found")


# Lấy học bạ học sinh
def get_student_report(request, student_id):
    for cls in DATA:
        for std in cls["students"]:
            if std["id"] == student_id:
                return JsonResponse(std, safe=False)
    raise Http404("Student not found")
