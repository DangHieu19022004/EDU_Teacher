from django.urls import path

from .views import recieve_image

urlpatterns = [
    path('recieve_image/', recieve_image, name='recieve_image'),
]
