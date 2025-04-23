from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from django.conf import settings
from . import settings

urlpatterns = [
    path('admin/', admin.site.urls),
    path("auth/", include("User.urls")),
    path("ocr/", include("ocr.urls")),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
