from django.urls import path
from . import views

urlpatterns = [
    path('classes/', views.get_class_list, name='class-list'),
    path('class/<str:class_id>/students/', views.get_students_by_class, name='students-by-class'),
    path('student/<str:student_id>/report/', views.get_student_report, name='student-report'),
]
