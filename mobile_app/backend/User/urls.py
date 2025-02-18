from django.urls import path

from .views import home, logout_view

urlpatterns = [
    # path("api/auth/google/", google_login, name="google_login"),
    path("", home),
    path("logout", logout_view),
]
