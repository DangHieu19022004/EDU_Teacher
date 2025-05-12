from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

from .views import ask_chatbot

urlpatterns = [
    path('ask_chatbot/', ask_chatbot, name='ask_chatbot'),
]
