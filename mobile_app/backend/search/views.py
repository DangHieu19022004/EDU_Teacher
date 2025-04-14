import json
import os
from django.http import JsonResponse, Http404
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt

# Load dữ liệu từ file JSON
DATA_PATH = os.path.join(settings.BASE_DIR, 'EDU_Teacher_FE', 'app', 'test_data', 'fakedata.json')

with open(DATA_PATH, 'r', encoding='utf-8') as f:
    DATA = json.load(f)

@csrf_exempt
def get_class_list(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    class_list = [{"id": cls["id"], "name": cls["name"]} for cls in DATA]
    return JsonResponse(class_list, safe=False)

@csrf_exempt
def get_students_by_class(request, class_id):
    if request.method != 'GET':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    for cls in DATA:
        if cls["id"] == class_id:
            students = [{"id": std["id"], "name": std["name"]} for std in cls["students"]]
            return JsonResponse(students, safe=False)
    return JsonResponse({'error': 'Class not found'}, status=404)

@csrf_exempt
def get_student_report(request, student_id):
    if request.method != 'GET':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    for cls in DATA:
        for std in cls["students"]:
            if std["id"] == student_id:
                return JsonResponse(std, safe=False)
    return JsonResponse({'error': 'Student not found'}, status=404)

@csrf_exempt
def search_students(request, class_id):
    if request.method != 'GET':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    query = request.GET.get('q', '').lower()
    for cls in DATA:
        if cls["id"] == class_id:
            students = [
                {"id": std["id"], "name": std["name"]}
                for std in cls["students"]
                if query in std["name"].lower()
            ]
            return JsonResponse(students, safe=False)
    return JsonResponse({'error': 'Class not found'}, status=404)