from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from regex import T

from .views import google_login, verify_token, facebook_login, form_login, form_register

urlpatterns = [
    path('googlelogin/', google_login, name='google_login'),
    path('facebooklogin/', facebook_login, name='facebook_login'),
    path('formregister/', form_register, name='form_register'),
    path('formlogin/', form_login, name='form_login'),
    path('verify-token/', verify_token, name='verify_token'),
]
