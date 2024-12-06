from django.urls import path

from .views import get_image, recieve_image

urlpatterns = [
    path('recieve_image/', recieve_image, name='recieve_image'),
    path('get_image/<str:image_id>/', get_image, name='get_image'),
]
