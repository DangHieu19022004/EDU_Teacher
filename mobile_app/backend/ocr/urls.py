from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

from .views import detect, chatbot_advice

urlpatterns = [
    path('detect/', detect, name='detect'),
    path('chatbot/advice/', chatbot_advice, name='chatbot_advice')   
]
