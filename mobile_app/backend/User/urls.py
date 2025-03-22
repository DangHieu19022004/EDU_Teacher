from django.urls import path
from .views import google_login, verify_token, facebook_login, register_email, verify_otp, email_login

urlpatterns = [
    path('googlelogin/', google_login, name='google_login'),
    path('facebooklogin/', facebook_login, name='facebook_login'),
    path('verify-token/', verify_token, name='verify_token'),
    path("register/", register_email, name="register_user"),
    path("verify-otp/", verify_otp, name="verify_otp"),
    path("login/", email_login, name="email_login"),
]
