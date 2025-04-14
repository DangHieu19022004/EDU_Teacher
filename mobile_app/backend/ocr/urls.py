from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

from .views import detect

urlpatterns = [
    path('detect/', detect, name='detect'),  
]
