from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
import re

from .views import google_login, verify_token, facebook_login, verify_token, register_email, verify_email, login_email

urlpatterns = [
    path('googlelogin/', google_login, name='google_login'),
    path('facebooklogin/', facebook_login, name='facebook_login'),
    path('verify-token/', verify_token, name='verify_token'),
    path("register/", register_email, name="register_email"),
    path("verify-email/", verify_email, name="verify_email"),
    path("login/", login_email, name="login_email"),
]
