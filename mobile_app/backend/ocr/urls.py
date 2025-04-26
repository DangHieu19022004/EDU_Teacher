from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

from .views import detect, save_full_report_card

urlpatterns = [
    path('detect/', detect, name='detect'),
    path('save_full_report_card/', save_full_report_card, name='save_full_report_card'),
]
