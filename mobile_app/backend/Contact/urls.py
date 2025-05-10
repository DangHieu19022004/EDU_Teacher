from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

from .views import save_contact, delete_contact

urlpatterns = [
    path('save_contact/', save_contact, name='save_contact'),
    path('delete_contact/', delete_contact, name='delete_contact'),
]
