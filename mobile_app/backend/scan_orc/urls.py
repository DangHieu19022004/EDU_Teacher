from django.urls import path

from .views import export_image, process_image, recieve_image

urlpatterns = [
    path('process_image/', process_image, name='process_image'),
    path('export_image/', export_image, name='export_image'),
]

