from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

from .views import save_classroom, get_classroom, get_classrooms, delete_classroom, update_classroom, get_students_by_class, delete_classroom

urlpatterns = [
    path("save_classroom/", save_classroom, name="save_classroom"),
    path("get_classroom/", get_classroom, name="get_classroom"),
    path("get_classrooms/", get_classrooms, name="get_classrooms"),
    path("update_classroom/", update_classroom, name="update_classroom"),
    path("get_students_by_class/", get_students_by_class, name="get_students_by_class"),
    path("delete_classroom/", delete_classroom, name="delete_classroom")
]
