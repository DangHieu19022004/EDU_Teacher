from django.urls import path

from .views import export_image, process_image, recieve_image

urlpatterns = [
    path('', recieve_image, name='recieve_image'),
    path('recieve_image/', recieve_image, name='recieve_image'),
    path('process_image/', process_image, name='process_image'),
    path('export_image/', export_image, name='export_image'),
]

